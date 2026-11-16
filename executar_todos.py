"""Executa todas as verificações do projeto, uma após a outra, e resume o resultado.

Uso: python3 tests/executar_todos.py

- verificar_projeto.py: estático, só biblioteca padrão do Python.
- test_perft.js, test_interface_node.js, test_coach.js, test_insights.js: precisam de Node.js (sem navegador).
- test_explicacoes_browser.py: precisa de Playwright + Chromium; é ignorado (SKIP) quando faltam.
Termina com código 1 se alguma verificação falhar. Verificações ignoradas não contam como falha.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
node = shutil.which("node")

passos: list[tuple[str, list[str], bool]] = [
    ("Verificação estática", [sys.executable, "tests/verificar_projeto.py"], False),
    ("Regras do tabuleiro (perft)", ["node", "tests/test_perft.js"], True),
    ("Interface (DOM simulado)", ["node", "tests/test_interface_node.js"], True),
    ("Treinador", ["node", "tests/test_coach.js"], True),
    ("Visão geral (insights)", ["node", "tests/test_insights.js"], True),
    ("Navegador real + Stockfish", [sys.executable, "tests/test_explicacoes_browser.py"], False),
]

resumo: list[tuple[str, str]] = []
for nome, comando, precisa_node in passos:
    if precisa_node and not node:
        resumo.append((nome, "IGNORADO (Node.js não encontrado)"))
        continue
    print(f"\n=== {nome} ===", flush=True)
    processo = subprocess.run(comando, cwd=ROOT, capture_output=True, text=True)
    saida = (processo.stdout + processo.stderr).strip().splitlines()
    print("\n".join(saida[-6:]))
    if processo.returncode == 0:
        resumo.append((nome, "OK"))
    elif any(linha.startswith("SKIP") for linha in saida):
        resumo.append((nome, "IGNORADO (dependência ausente)"))
    else:
        resumo.append((nome, "FALHOU"))

print("\n--- Resumo ---")
for nome, estado in resumo:
    print(f"{estado:34} {nome}")
sys.exit(1 if any(estado == "FALHOU" for _, estado in resumo) else 0)
