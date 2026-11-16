#!/usr/bin/env python3
"""Run the existing MyChess automatic analysis in a headless browser for cloud jobs."""

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
TERMINAL_STATUS = """() => {
  const text = document.querySelector('#chesscom-status')?.textContent || '';
  return text.startsWith('Análise automática pronta:') ||
    text === 'A partida mais recente já tem análise salva.' ||
    text === 'Nenhuma partida com PGN está disponível para análise automática.' ||
    /não respondeu a tempo|não consegui acessar|não encontrou esse perfil|limitou temporariamente|respondeu com erro/i.test(text);
}"""


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


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_port}/index.html"

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            try:
                page = browser.new_page()
                page.add_init_script("localStorage.setItem('mychess6-auto-chesscom', 'on')")
                page.goto(url, wait_until="load", timeout=60_000)
                try:
                    page.wait_for_function(TERMINAL_STATUS, timeout=22 * 60 * 1000)
                except PlaywrightTimeoutError as error:
                    status = page.locator("#chesscom-status").inner_text()
                    raise RuntimeError(f"Chess.com/Stockfish não terminou a tempo: {status}") from error

                status = page.locator("#chesscom-status").inner_text()
                if not (status.startswith("Análise automática pronta:")
                        or status == "A partida mais recente já tem análise salva."
                        or status == "Nenhuma partida com PGN está disponível para análise automática."):
                    raise RuntimeError(f"Consulta automática falhou: {status}")

                records = read_browser_library(page)
                records = [record for record in records if isinstance(record, dict)
                           and isinstance(record.get("id"), str)
                           and isinstance(record.get("pgn"), str)
                           and isinstance(record.get("results"), list)]
                last_seen = page.evaluate("window.MyChess6Cloud?.lastSeenGameUrl || ''")
                OUTPUT.write_text(json.dumps({
                    "format": "MyChess cloud library",
                    "version": 1,
                    "lastSeenGameUrl": last_seen,
                    "games": records,
                }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                print(f"Biblioteca em nuvem atualizada: {len(records)} análise(s).")
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
