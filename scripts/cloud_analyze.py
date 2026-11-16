#!/usr/bin/env python3
"""Analyze unreviewed Chess.com games in resumable batches using the existing app."""

from __future__ import annotations

import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "cloud-data" / "games.json"
MAX_GAMES_PER_RUN = 1
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
    # A full depth-16 review can take well over 28 minutes on a hosted runner.
    # Keep the browser alive for nearly the full Actions job window.
    page.wait_for_function(ARCHIVE_FINISHED, arg=url, timeout=350 * 60 * 1000)
    state = page.evaluate("window.MyChess6Cloud?.archiveState || 'error'")
    status = page.locator("#chesscom-status").inner_text()
    if state == "error":
        raise RuntimeError(f"Falha ao consultar/analisar o arquivo {url}: {status}")
    records = read_browser_library(page)
    remaining = page.evaluate("window.MyChess6Cloud?.archiveRemaining || 0")
    return records, int(remaining)


def valid_records(records: list[dict]) -> list[dict]:
    return [record for record in records if isinstance(record, dict)
            and isinstance(record.get("id"), str)
            and isinstance(record.get("pgn"), str)
            and isinstance(record.get("results"), list)]


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

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            try:
                page = browser.new_page()
                page.add_init_script("""
                  localStorage.setItem('mychess6-auto-chesscom', 'on');
                  window.__MyChess6ScanAllArchives = true;
                  window.__MyChess6MaxGamesPerArchive = 1;
                """)
                page.goto(url, wait_until="load", timeout=60_000)

                options = page.locator("#chesscom-month option").evaluate_all(
                    "items => items.map(item => item.value).filter(Boolean)")
                if not options:
                    page.wait_for_function("""() => document.querySelectorAll('#chesscom-month option').length > 1 ||
                      window.MyChess6Cloud?.archiveState === 'error'""", timeout=60_000)
                    options = page.locator("#chesscom-month option").evaluate_all(
                        "items => items.map(item => item.value).filter(Boolean)")
                if not options:
                    raise RuntimeError(page.locator("#chesscom-status").inner_text())

                latest_url = options[0]
                print(f"Verificando arquivo mais recente: {latest_url}", flush=True)
                records, archive_remaining = archive_snapshot(page, latest_url)
                records = valid_records(records)
                new_count = sum(1 for record in records if record["id"] not in previous_ids)
                remaining_budget = MAX_GAMES_PER_RUN - new_count
                backfill_complete = previous.get("backfillComplete") is True
                previous_cursor = previous.get("backfillArchiveUrl") or ""
                next_cursor = ""

                if archive_remaining:
                    next_cursor = latest_url
                elif backfill_complete and remaining_budget > 0 and len(options) > 1:
                    # Recheck the previous month for games published late by Chess.com.
                    previous_url = options[1]
                    if previous_cursor in options[1:2]:
                        previous_url = previous_cursor
                    page.evaluate("limit => { window.__MyChess6MaxGamesPerArchive = limit; }", remaining_budget)
                    page.select_option("#chesscom-month", value=previous_url)
                    records, archive_remaining = archive_snapshot(page, previous_url)
                    records = valid_records(records)
                    new_count = sum(1 for record in records if record["id"] not in previous_ids)
                    if archive_remaining:
                        next_cursor = previous_url
                elif not backfill_complete:
                    if previous_cursor in options:
                        start_index = options.index(previous_cursor)
                        if previous_cursor == latest_url:
                            start_index += 1
                    else:
                        start_index = 1

                    if start_index >= len(options):
                        backfill_complete = True
                    for index in range(start_index, len(options)):
                        if remaining_budget <= 0:
                            next_cursor = options[index]
                            break
                        archive_url = options[index]
                        print(f"Retropreenchendo arquivo: {archive_url}", flush=True)
                        page.evaluate("limit => { window.__MyChess6MaxGamesPerArchive = limit; }", remaining_budget)
                        page.select_option("#chesscom-month", value=archive_url)
                        records, archive_remaining = archive_snapshot(page, archive_url)
                        records = valid_records(records)
                        new_count = sum(1 for record in records if record["id"] not in previous_ids)
                        remaining_budget = MAX_GAMES_PER_RUN - new_count

                        if archive_remaining:
                            next_cursor = archive_url
                            backfill_complete = False
                            break
                        if remaining_budget <= 0:
                            if index + 1 < len(options):
                                next_cursor = options[index + 1]
                            else:
                                backfill_complete = True
                            break
                    else:
                        backfill_complete = True

                records = valid_records(read_browser_library(page))
                last_seen = page.evaluate("window.MyChess6Cloud?.lastSeenGameUrl || ''")
                OUTPUT.write_text(json.dumps({
                    "format": "MyChess cloud library",
                    "version": 1,
                    "lastSeenGameUrl": last_seen,
                    "backfillArchiveUrl": next_cursor,
                    "backfillComplete": backfill_complete,
                    "games": records,
                }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                print(f"Lote salvo: {max(0, len(records) - len(previous_ids))} análise(s) nova(s); "
                      f"{len(records)} no total; retropreenchimento {'concluído' if backfill_complete else 'em andamento'}.")
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
