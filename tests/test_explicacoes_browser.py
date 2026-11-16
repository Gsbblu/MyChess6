"""Teste ponta a ponta da análise didática em navegador real, com o Stockfish local de verdade.

Carrega o site por HTTP local (o Web Worker exige isso), importa a partida de Légal (sacrifício de dama,
erro grave das pretas e mate), analisa com o motor real e confere o que o aluno vê: classificação,
manchete, fatos calculados com origem, revisão guiada e lance final de mate.

Requer o pacote Python `playwright` com um Chromium instalado; sem isso o teste é ignorado (SKIP).
Inicia apenas um servidor local temporário em 127.0.0.1.
"""

from __future__ import annotations

import functools
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    raise SystemExit("SKIP: o pacote Python 'playwright' não está instalado; o teste em navegador não foi executado.")

PGN = (
    '[Event "Légal"]\n[White "Brancas"]\n[Black "Pretas"]\n[Result "1-0"]\n\n'
    "1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0\n"
)

results: list[tuple[str, bool, str]] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    results.append((name, bool(condition), "" if condition else detail))


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *_args: object) -> None:
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_port}/index.html"

try:
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch()
        except Exception as error:  # navegador não instalado
            raise SystemExit(f"SKIP: Chromium indisponível para o Playwright ({str(error).splitlines()[0]}).")
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        # O app consulta a API pública do Chess.com ao abrir; o teste não depende da internet.
        page.route("https://api.chess.com/**", lambda route: route.fulfill(
            status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body='{"archives": []}'))
        page.goto(url)

        page.evaluate("document.querySelector('.paste-pgn').open = true")
        page.fill("#pgn-text", PGN)
        page.click("#load-pgn-text")
        check("A partida de Légal é importada (13 lances)", "13 lances" in page.inner_text("#import-status"), page.inner_text("#import-status"))
        page.click("#analyze-game")
        # A análise só começa depois de confirmar a profundidade no diálogo (10 = Rápida).
        page.click('.depth-option:has(input[value="10"])')
        page.click('.depth-dialog-card button[type="submit"]')
        page.wait_for_function(
            "document.querySelector('#game-progress-label').textContent.startsWith('Partida analisada')", timeout=240_000
        )
        check("A análise com o Stockfish real termina", True)
        check("O resumo da partida aparece", page.is_visible("#game-summary"))

        coach_text = page.text_content("#game-summary-coach") or ""
        check("A revisão guiada cita o erro grave das pretas (Bxd1)", "Bxd1" in coach_text, coach_text[:300])
        check("A revisão guiada traz o hábito a levar", "Para levar" in coach_text, coach_text[:300])
        check("Há botão para resolver o lance no tabuleiro", page.locator("#game-summary-coach .summary-exercise-link").count() > 0)

        def open_move(label_part: str) -> None:
            page.locator(f'.move-entry[aria-label*="{label_part}"]').first.click()

        open_move("pretas: Bxd1")
        badge = page.inner_text("#game-review-badge")
        check("5…Bxd1 é classificado como erro", badge in ("Erro grave", "Erro", "Chance perdida"), badge)
        headline = page.inner_text("#game-review-explanation")
        check("A manchete explica o mate demonstrado pela variante", "mate" in headline.lower() and "Nd5#" in headline, headline)
        check("O painel pergunta antes de revelar", len(page.inner_text("#game-review-question")) > 40)
        check("A análise completa começa oculta", not page.is_visible("#detailed-move-explanation"))
        page.click("#explain-move")
        check("Revelar mostra a confiança da explicação", page.is_visible(".lesson-confidence"))
        facts = page.inner_text(".lesson-facts")
        check("Os fatos citam a variante do motor com a sua origem", "Variante do motor" in facts and "Nd5#" in facts, facts[:300])
        check("Há o bloco 'Para levar'", page.is_visible(".lesson-takeaway"))

        open_move("brancas: Nxe5")
        badge = page.inner_text("#game-review-badge")
        check("5.Nxe5 (brancas) é aprovado pelo motor", badge in ("Melhor", "Excelente", "Bom", "Grande lance", "Brilhante"), badge)

        open_move("brancas: Nd5#")
        badge = page.inner_text("#game-review-badge")
        check("O lance final de mate é classificado (não fica 'Sem avaliação')", badge in ("Melhor", "Grande lance", "Brilhante"), badge)

        open_move("pretas: g6")
        badge = page.inner_text("#game-review-badge")
        g6 = page.inner_text("#game-review-explanation")
        check("O lance das pretas (g6) recebe classificação e explicação", bool(badge) and len(g6) > 40, f"{badge} :: {g6}")

        check("Nenhum erro de JavaScript ou de rede no console", not errors, "; ".join(errors[:3]))
        browser.close()
finally:
    server.shutdown()
    server.server_close()

failed = 0
for name, ok, detail in results:
    print(f"{'OK' if ok else 'FALHA'}: {name}")
    if not ok:
        failed += 1
        if detail:
            print(f"  {detail}")
if failed:
    print(f"{failed} verificação(ões) falharam.")
    sys.exit(1)
print("Todos os cenários em navegador passaram.")
