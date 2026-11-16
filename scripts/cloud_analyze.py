#!/usr/bin/env python3
"""Analyze unreviewed Chess.com games in resumable batches using the existing app."""

from __future__ import annotations

import functools
import json
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "cloud-data" / "games.json"
BATCH_SIZE = 5
MIN_ARCHIVE_YEAR = 2026
MAX_RUN_SECONDS = 5 * 60 * 60 + 30 * 60
MIN_BATCH_WINDOW_SECONDS = 30 * 60
ARCHIVE_FINISHED = """url => window.MyChess6Cloud?.archiveUrl === url &&
  ['done', 'error'].includes(window.MyChess6Cloud?.archiveState)"""


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, _format: str, *_args: object) -> None:
        pass


def read_browser_library(page) -> list[dict]:
    return page.evaluate("""() => new Promise((resolve, reject) => {
      const request = indexedDB.open('mychess6-library', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('games')) { resolve([]); return; }
        const read = db.transaction('games', 'readonly').objectStore('games').getAll();
        read.onsuccess = () => resolve(read.result || []);
        read.onerror = () => reject(read.error);
      };
    })""")


def archive_snapshot(page, url: str) -> tuple[list[dict], int]:
    page.wait_for_function(ARCHIVE_FINISHED, arg=url, timeout=28 * 60 * 1000)
    state = page.evaluate("window.MyChess6Cloud?.archiveState || 'error'")
    status = page.locator("#chesscom-status").inner_text()
    if state == "error":
        raise RuntimeError(f"Falha ao consultar/analisar o arquivo {url}: {status}")
    records = read_browser_library(page)
    remaining = page.evaluate("window.MyChess6Cloud?.archiveRemaining || 0")
    return records, int(remaining)


def start_archive_batch(page, url: str) -> tuple[list[dict], int]:
    page.evaluate("""url => {
      window.__MyChess6MaxGamesPerArchive = 5;
      const select = document.querySelector('#chesscom-month');
      if (!select || !Array.from(select.options).some(option => option.value === url)) {
        throw new Error(`O arquivo mensal ${url} não está disponível no seletor.`);
      }
      select.value = url;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }""", url)
    return archive_snapshot(page, url)


def valid_records(records: list[dict]) -> list[dict]:
    return [record for record in records if isinstance(record, dict)
            and isinstance(record.get("id"), str)
            and isinstance(record.get("pgn"), str)
            and isinstance(record.get("results"), list)]


def save_checkpoint(records: list[dict], last_seen: str, cursor: str, complete: bool) -> None:
    OUTPUT.write_text(json.dumps({
        "format": "MyChess cloud library",
        "version": 1,
        "lastSeenGameUrl": last_seen,
        "backfillArchiveUrl": cursor,
        "backfillComplete": complete,
        "games": records,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    try:
        previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        previous = {}
    previous_games = previous.get("games", []) if isinstance(previous, dict) else []
    previous_ids = {game.get("id") for game in previous_games if isinstance(game, dict)}

    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_port}/index.html"

    run_deadline = time.monotonic() + MAX_RUN_SECONDS
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            try:
                page = browser.new_page()
                page.add_init_script("""
                  localStorage.setItem('mychess6-auto-chesscom', 'on');
                  window.__MyChess6ScanAllArchives = true;
                  window.__MyChess6MaxGamesPerArchive = 5;
                """)
                page.goto(url, wait_until="load", timeout=60_000)

                options = page.locator("#chesscom-month option").evaluate_all(
                    r"items => items.map(item => item.value).filter(value => /^https:\/\/api\.chess\.com\/pub\/player\/[^/]+\/games\/\d{4}\/\d{2}$/.test(value))")
                if not options:
                    page.wait_for_function(r"""() => Array.from(document.querySelectorAll('#chesscom-month option')).some(item =>
                      /^https:\/\/api\.chess\.com\/pub\/player\/[^/]+\/games\/\d{4}\/\d{2}$/.test(item.value)) ||
                      window.MyChess6Cloud?.archiveState === 'error'""", timeout=60_000)
                    options = page.locator("#chesscom-month option").evaluate_all(
                        r"items => items.map(item => item.value).filter(value => /^https:\/\/api\.chess\.com\/pub\/player\/[^/]+\/games\/\d{4}\/\d{2}$/.test(value))")
                options = [archive_url for archive_url in options
                           if int(archive_url.rstrip('/').split('/')[-2]) >= MIN_ARCHIVE_YEAR]
                if not options:
                    raise RuntimeError(f"Não encontrei arquivos públicos de {MIN_ARCHIVE_YEAR} em diante para este perfil.")

                latest_url = options[0]
                print(f"Verificando arquivo mais recente: {latest_url}", flush=True)
                records, archive_remaining = archive_snapshot(page, latest_url)
                records = valid_records(records)
                backfill_was_complete = previous.get("backfillComplete") is True
                backfill_complete = backfill_was_complete
                previous_cursor = previous.get("backfillArchiveUrl") or ""
                last_seen = page.evaluate("window.MyChess6Cloud?.lastSeenGameUrl || ''")

                def checkpoint(cursor: str, complete: bool) -> list[dict]:
                    nonlocal last_seen
                    current = valid_records(read_browser_library(page))
                    last_seen = page.evaluate("window.MyChess6Cloud?.lastSeenGameUrl || ''") or last_seen
                    save_checkpoint(current, last_seen, cursor, complete)
                    return current

                def finish_archive(archive_url: str, remaining: int) -> tuple[list[dict], int]:
                    nonlocal records
                    records = checkpoint(archive_url, backfill_complete)
                    while remaining > 0:
                        time_left = run_deadline - time.monotonic()
                        if time_left < MIN_BATCH_WINDOW_SECONDS:
                            print(f"Pausa segura: restam {remaining} partida(s) em {archive_url}; cursor salvo para a próxima execução.", flush=True)
                            return records, remaining
                        print(f"Lote de {BATCH_SIZE} concluído; restam {remaining} partida(s) neste arquivo. Iniciando outro lote.", flush=True)
                        records, remaining = start_archive_batch(page, archive_url)
                        records = valid_records(records)
                        records = checkpoint(archive_url, backfill_complete)
                    return records, 0

                def enough_time_for_batch() -> bool:
                    return run_deadline - time.monotonic() >= MIN_BATCH_WINDOW_SECONDS

                if archive_remaining:
                    records, archive_remaining = finish_archive(latest_url, archive_remaining)
                    if archive_remaining:
                        next_cursor = "" if backfill_was_complete else latest_url
                        backfill_complete = backfill_was_complete
                        checkpoint(next_cursor, backfill_complete)
                        records = valid_records(read_browser_library(page))
                        print("Checkpoint salvo no limite seguro de tempo; a próxima execução retomará automaticamente.", flush=True)
                        return

                if backfill_was_complete:
                    # Recheck the previous month for games published late by Chess.com.
                    if len(options) > 1:
                        previous_url = options[1]
                        print(f"Conferindo partidas recentes publicadas com atraso: {previous_url}", flush=True)
                        if enough_time_for_batch():
                            records, archive_remaining = start_archive_batch(page, previous_url)
                            records = valid_records(records)
                            records, archive_remaining = finish_archive(previous_url, archive_remaining)
                        else:
                            print("Sem tempo para conferir o mês anterior nesta execução; o próximo run fará essa verificação.", flush=True)
                            archive_remaining = 0
                        backfill_complete = archive_remaining == 0
                        next_cursor = previous_url if archive_remaining else ""
                    else:
                        next_cursor = ""
                    checkpoint(next_cursor, backfill_complete)
                else:
                    if previous_cursor in options:
                        start_index = options.index(previous_cursor)
                        if previous_cursor == latest_url and archive_remaining == 0:
                            start_index += 1
                    else:
                        start_index = 1

                    next_cursor = options[start_index] if start_index < len(options) else ""
                    if start_index >= len(options):
                        backfill_complete = True
                        checkpoint("", True)
                    else:
                        for index in range(start_index, len(options)):
                            archive_url = options[index]
                            if not enough_time_for_batch():
                                next_cursor = archive_url
                                checkpoint(next_cursor, False)
                                print(f"Pausa segura; cursor salvo em {next_cursor} para a próxima execução.", flush=True)
                                break
                            print(f"Retropreenchendo arquivo: {archive_url}", flush=True)
                            records, archive_remaining = start_archive_batch(page, archive_url)
                            records = valid_records(records)
                            records, archive_remaining = finish_archive(archive_url, archive_remaining)
                            if archive_remaining:
                                next_cursor = archive_url
                                checkpoint(next_cursor, False)
                                break
                            next_cursor = options[index + 1] if index + 1 < len(options) else ""
                            backfill_complete = not next_cursor
                            checkpoint(next_cursor, backfill_complete)
                            if backfill_complete:
                                break

                records = valid_records(read_browser_library(page))
                last_seen = page.evaluate("window.MyChess6Cloud?.lastSeenGameUrl || ''") or last_seen
                save_checkpoint(records, last_seen, next_cursor, backfill_complete)
                print(f"Lote salvo: {max(0, len(records) - len(previous_ids))} análise(s) nova(s); "
                      f"{len(records)} no total; retropreenchimento {'concluído' if backfill_complete else 'em andamento'}.")
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
