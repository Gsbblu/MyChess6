"""Verificações locais do Xadrez Livre usando apenas a biblioteca padrão."""

from __future__ import annotations

import ast
import hashlib
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.local_assets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.append(attributes["id"] or "")
        for name in ("src", "href"):
            value = attributes.get(name)
            if value and not value.startswith(("http://", "https://", "//", "#", "data:")):
                self.local_assets.append(value.split("?", 1)[0])


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


html = (ROOT / "index.html").read_text(encoding="utf-8")
page = PageParser()
page.feed(html)
require(len(page.ids) == len(set(page.ids)), "O HTML contém IDs duplicados.")
for asset in page.local_assets:
    require((ROOT / asset).is_file(), f"Recurso local ausente: {asset}")

required_ids = {
    "chessboard", "move-arrows", "analyze-position", "cancel-analysis", "analyze-game",
    "game-analysis", "game-progress", "game-analysis-rows", "load-pgn-text",
    "game-summary", "game-summary-overview", "game-summary-opening", "game-summary-qualities",
    "game-summary-phases", "game-summary-themes", "game-summary-strategy", "game-summary-turning-points",
    "advantage-chart", "advantage-chart-status", "chart-current-eval",
    "white-rating", "black-rating",
    "game-review-quality", "game-review-badge", "game-review-explanation",
    "explain-move", "detailed-move-explanation", "replay-played-line",
    "explore-variation", "best-line-actions", "show-best-move", "show-best-line",
    "variation-banner", "exit-variation",
}
require(required_ids <= set(page.ids), f"Faltam IDs da interface: {sorted(required_ids - set(page.ids))}")

for filename in ("index.html", "styles.css", "app.js", "coach.js", "insights.js"):
    require((ROOT / "publicacao" / filename).is_file(), f"A pasta publicacao/ não tem {filename}.")
    require((ROOT / "publicacao" / filename).read_bytes() == (ROOT / filename).read_bytes(),
            f"A cópia de publicação está desatualizada: {filename}")

engine_files = {
    "stockfish-19-lite-single.js": "ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a",
    "stockfish-19-lite-single.wasm": "ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de",
}
for filename, expected_hash in engine_files.items():
    engine_path = ROOT / "public" / "engine" / filename
    require(engine_path.is_file(), f"Arquivo Stockfish ausente: {filename}")
    actual_hash = hashlib.sha256(engine_path.read_bytes()).hexdigest()
    require(actual_hash == expected_hash, f"SHA-256 divergente: {filename}")

for filename in ("iniciar-servidor.py", "tests/verificar_projeto.py", "tests/test_explicacoes_browser.py", "tests/executar_todos.py"):
    ast.parse((ROOT / filename).read_text(encoding="utf-8"), filename=filename)

app = (ROOT / "app.js").read_text(encoding="utf-8")
for feature in (
    "requestAnalysis", "requestGameAnalysis", "startNextGamePosition",
    "rememberAnalysis", "lookupAnalysis", "analysisCacheLimit = 256",
    "analysisStopping", "formatPrincipalVariation", "pointerdown",
    "pointermove", "pointerup", "pieceArtwork", "scoreForSide",
    "moveQuality", "addMoveQuality", "expectedPoints", "brilliantSacrifice",
    "MultiPV value 3", "Chance perdida", "Grande lance",
    "renderGameReviewAtCurrentPosition", "gameReviewResults",
    "renderCurrentMoveQuality",
    "enterVariationMode", "exitVariationMode", "analyzeVariationWhenReady",
    "showBestAlternative",
    "renderAdvantageChart", "updateAdvantageChartSelection",
    "coach.buildLesson", "renderLesson", "terminalAnalysis", "replayPlayedLine",
    "renderMoveArrows", "analysis-arrowhead",
    "castleToken", "normalize('NFKC')", "direitos de roque no PGN",
    "renderGameSummary", "summaryEvaluation", "summaryMoveLabel", "summaryPhase",
    "skipDepthPrompt", "lastGameAnalysisDepth", "depthDialog.returnValue = ''",
    "assertChessComUrl", "positionFromUserFen", "fenOnlyPattern",
):
    require(feature in app, f"Implementação não encontrada: {feature}")

coach_src = (ROOT / "coach.js").read_text(encoding="utf-8")
for feature in ("MyChessCoach", "buildLesson", "exchange", "hangingPieces", "lineMaterial", "verifiedFork", "replay",
                "facts", "heuristics", "uncertainty"):
    require(feature in coach_src, f"Treinador: implementação não encontrada: {feature}")
require("document." not in coach_src and "window." not in coach_src, "coach.js deve ser puro (sem acesso ao DOM).")
for old_name in ("candidateMoveInsights", "coachingComparison", "chessReason", "studyTheme", "coachPrompt"):
    require(old_name not in app, f"Resíduo da análise didática antiga em app.js: {old_name}")
require(html.index("coach.js") < html.index("app.js"), "coach.js precisa ser carregado antes de app.js.")
require(html.index("insights.js") < html.index("app.js"), "insights.js precisa ser carregado antes de app.js.")
insights_src = (ROOT / "insights.js").read_text(encoding="utf-8")
for feature in ("MyChessInsights", "compute", "moveAccuracy", "parseClocks", "openingOf", "priorities", "strengths", "wasted"):
    require(feature in insights_src, f"Visão geral: implementação não encontrada: {feature}")
require("document." not in insights_src and "window." not in insights_src, "insights.js deve ser puro (sem acesso ao DOM).")
require("insights-body" in html and "insights-speed" in html and "insightsEngine.compute" in app, "Visão geral não está ligada ao módulo insights.js.")
require('rel="icon"' in html and "<noscript>" in html, "Favicon embutido e aviso <noscript> ausentes.")
require("evil" not in app and "function chessComJsonp" in app and "response.status === 404" in app, "Tratamento de erros HTTP do Chess.com ausente.")

styles = (ROOT / "styles.css").read_text(encoding="utf-8")
require("--light-square:#eeeed2" in styles and "--dark-square:#769656" in styles, "Paleta do tabuleiro ausente.")
require(".piece-drag-ghost" in styles, "Estilo de peça durante o arraste ausente.")
require(".move-arrows" in styles and ".analysis-arrow-2" in styles, "Estilos das setas de análise ausentes.")
require(".move-quality-badge" in styles and ".move-quality-explanation" in styles, "Estilos da avaliação de qualidade ausentes.")
require(".explain-move-button" in styles and ".lesson-block" in styles and ".lesson-source" in styles, "Estilos da lição do treinador ausentes.")
require(".game-summary" in styles and ".summary-move-link" in styles, "Estilos do resumo de partida ausentes.")
require(".insight-priority" in styles and ".insight-hero" in styles, "Estilos da Visão geral ausentes.")
require(".summary-quality-table" in styles and ".game-summary-columns" in styles, "Estatísticas de qualidade/fases ausentes.")

readme = (ROOT / "README.md").read_text(encoding="utf-8")
require("eventos de ponteiro" in readme and "pontos esperados" in readme, "README não descreve as melhorias atuais.")
require("GPL-3.0" in readme and (ROOT / "public/engine/Copying.txt").is_file(), "Avisos/licença do Stockfish ausentes.")

print("OK: HTML, IDs, recursos locais, sintaxe Python, recursos Stockfish (SHA-256), funcionalidades e licença verificados.")
