// Teste de regras: contagem "perft" (número de lances legais alcançáveis) em posições de referência
// publicadas no Chess Programming Wiki. Requer Node.js; não usa navegador nem dependências externas.
// Uso: node tests/test_perft.js
'use strict';
const { carregarApp } = require('./_app_node');
const { app } = carregarApp();
const { positionFromFen, allLegalMoves, applyMove } = app;

function perft(pos, depth) {
  if (depth === 0) return 1;
  const moves = allLegalMoves(pos);
  if (depth === 1) return moves.length;
  let total = 0;
  for (const move of moves) total += perft(applyMove(pos, move), depth - 1);
  return total;
}

const casos = [
  ['Posição inicial', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', [[1, 20], [2, 400], [3, 8902], [4, 197281]]],
  ['Kiwipete (roques, en passant, xeques)', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [[1, 48], [2, 2039], [3, 97862]]],
  ['Posição 3 (finais, en passant com cravada)', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [[1, 14], [2, 191], [3, 2812], [4, 43238]]],
  ['Posição 4 (promoções e xeques)', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [[1, 6], [2, 264], [3, 9467]]],
  ['Posição 5 (promoção com captura)', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [[1, 44], [2, 1486], [3, 62379]]],
  ['Posição 6 (jogo simétrico)', 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10', [[1, 46], [2, 2079], [3, 89890]]],
];

let falhas = 0;
for (const [nome, fen, niveis] of casos) {
  const pos = positionFromFen(fen);
  for (const [profundidade, esperado] of niveis) {
    const obtido = perft(pos, profundidade);
    const ok = obtido === esperado;
    if (!ok) falhas += 1;
    console.log(`${ok ? 'OK' : 'FALHA'}: ${nome} · profundidade ${profundidade} · esperado ${esperado}, obtido ${obtido}`);
  }
}
if (falhas) { console.error(`${falhas} contagem(ns) divergente(s).`); process.exit(1); }
console.log('Todas as contagens perft conferem.');
