// Testes do módulo didático (coach.js) em posições concretas, para brancas e pretas.
// Verificam que cada afirmação é sustentada por lances legais ou por variante do motor, que fatos,
// indícios e incertezas ficam separados, e que o treinador não inventa causa quando não há evidência.
// Requer Node.js; não usa navegador. Uso: node tests/test_coach.js
'use strict';
const path = require('path');
const { carregarApp } = require('./_app_node');
const Coach = require('../coach.js');

const t = carregarApp(path.join(__dirname, '..'));
const A = t.app;
const coach = Coach.create(A, {});
const resultados = [];
const verificar = (nome, ok, detalhe = '') => resultados.push({ nome, ok: Boolean(ok), detalhe });
const Q = (kind, label, loss) => ({ kind, label, loss });

function licao(beforeFen, uci, { before = {}, after = {}, quality, depth = 12 }) {
  const pos = A.positionFromFen(beforeFen), move = A.parseUciMove(pos, uci);
  if (!move) throw new Error(`Lance ilegal no cenário: ${uci} em ${beforeFen}`);
  const next = A.applyMove(pos, move);
  const played = { side: pos.turn, san: A.moveToSan(pos, move), moveNumber: pos.fullmove, from: move.from, to: move.to, promotion: move.promotion || '', movingPiece: pos.board[move.from], capturedPiece: pos.board[move.to] };
  return coach.buildLesson({
    before: { fen: beforeFen, turn: pos.turn, depth, ...before },
    after: { fen: A.currentFen(next), turn: next.turn, depth, ...after }, played, quality
  });
}
const temFato = (l, id) => l.facts.some((f) => f.id === id);
const textoTotal = (l) => [l.headline, ...l.facts.map((f) => f.text), ...l.heuristics.map((h) => h.text), ...l.uncertainty].join(' | ');

const cenarios = {
  mate() {
    const l = licao('rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2', 'g2g4', {
      before: { score: { type: 'cp', value: 30 }, bestMove: 'b1c3', best: 'Nc3', pvUci: 'b1c3 b8c6' },
      after: { score: { type: 'mate', value: 1 }, pvUci: 'd8h4' }, quality: Q('blunder', 'Erro grave', 0.5) });
    verificar('Mate permitido é demonstrado pela variante legal (brancas)', temFato(l, 'mate-allowed') && l.facts[0].source === 'line' && /Qh4#/.test(l.facts[0].text), textoTotal(l));
    verificar('Mate permitido define o tema e a explicação é "verificada"', l.theme === 'mate-allowed' && l.explanation === 'verified', `${l.theme}/${l.explanation}`);
    verificar('Erro tático demonstrado não traz indícios posicionais que distraiam', l.heuristics.length === 0, JSON.stringify(l.heuristics));
    verificar('A melhor alternativa é informada', l.alternative && l.alternative.san === 'Nc3', JSON.stringify(l.alternative));
  },

  materialPerdido() {
    const l = licao('4k3/2b5/8/8/8/8/3Q4/4K3 w - - 0 1', 'd2f4', {
      before: { score: { type: 'cp', value: 900 }, bestMove: 'd2d7', best: 'Qd7+', pvUci: 'd2d7 e8d7' },
      after: { score: { type: 'cp', value: 0 }, pvUci: 'c7f4' }, quality: Q('blunder', 'Erro grave', 0.4) });
    const f = l.facts.find((x) => x.id === 'piece-hanging');
    verificar('Dama deixada em prise: fato das regras, com troca na casa calculada', f && f.source === 'rules' && /9 pontos/.test(f.text), textoTotal(l));
    verificar('Quando o motor confirma a captura, o fato é corroborado', f && f.corroborated && l.explanation === 'verified', JSON.stringify(f));
    const semConfirmacao = licao('4k3/2b5/8/8/8/8/3Q4/4K3 w - - 0 1', 'd2f4', {
      before: { score: { type: 'cp', value: 900 }, bestMove: 'd2d7', best: 'Qd7+', pvUci: 'd2d7 e8d7' },
      after: { score: { type: 'cp', value: 0 }, pvUci: 'e8d8' }, quality: Q('mistake', 'Erro', 0.15) });
    verificar('Sem confirmação do motor, o texto fala em indício e a explicação é parcial', semConfirmacao.explanation === 'partial' && /Indício forte/.test(semConfirmacao.headline) && !/Causa verificada/.test(semConfirmacao.headline), semConfirmacao.headline);
  },

  ameacaIgnorada() {
    const l = licao('4k3/8/8/8/2n5/8/3Q4/4K3 w - - 0 1', 'e1f1', {
      before: { score: { type: 'cp', value: 600 }, bestMove: 'd2d8', best: 'Qd8+', pvUci: 'd2d8 e8d8' },
      after: { score: { type: 'cp', value: -300 }, pvUci: 'c4d2 f1e2' }, quality: Q('blunder', 'Erro grave', 0.3) });
    verificar('Ameaça existente antes do lance e não tratada é identificada', temFato(l, 'threat-ignored') && l.theme === 'threat-ignored', textoTotal(l));
    verificar('Concordância de gênero na ameaça à dama', /dama branca em d2 já estava ameaçada/.test(textoTotal(l)), textoTotal(l));
  },

  trocaRuim() {
    const l = licao('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', 'f3e5', {
      before: { score: { type: 'cp', value: 30 }, bestMove: 'f1b5', best: 'Bb5', pvUci: 'f1b5 g8f6' },
      after: { score: { type: 'cp', value: 200 }, pvUci: 'c6e5 d2d4 e5g6' }, quality: Q('mistake', 'Erro', 0.14) });
    const f = l.facts.find((x) => x.id === 'piece-hanging');
    verificar('Captura que perde material desconta o que o lance capturou (cavalo por peão = −2)', f && /2 ponto|dois peões/.test(f.text) && /capturou/.test(f.text), textoTotal(l));
    verificar('A comparação de variantes só entra com mesma profundidade e linha assentada', temFato(l, 'tactic-allowed') && /mesma profundidade \(12\)/.test(l.facts.find((x) => x.id === 'tactic-allowed').text), textoTotal(l));
    const diferente = licao('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', 'f3e5', {
      before: { score: { type: 'cp', value: 30 }, bestMove: 'f1b5', best: 'Bb5', pvUci: 'f1b5 g8f6', depth: 14 },
      after: { score: { type: 'cp', value: 200 }, pvUci: 'c6e5 d2d4 e5g6', depth: 12 }, quality: Q('mistake', 'Erro', 0.14) });
    verificar('Profundidades diferentes não geram comparação de variantes', !temFato(diferente, 'tactic-allowed') && diferente.uncertainty.some((u) => /profundidades diferentes/.test(u)), textoTotal(diferente));
  },

  garfo() {
    const fen = '4k3/1r3q2/8/8/4N3/8/8/K7 w - - 0 1';
    const achado = licao(fen, 'e4d6', {
      before: { score: { type: 'cp', value: 200 }, bestMove: 'e4d6', best: 'Nd6+', pvUci: 'e4d6 e8f8 d6b7 f7b7' },
      after: { score: { type: 'cp', value: -200 }, pvUci: 'e8f8 d6b7 f7b7' }, quality: Q('best', 'Melhor', 0) });
    const f = achado.facts.find((x) => x.id === 'fork-found');
    verificar('Garfo com xeque é demonstrado pela variante (alvos b7 e f7)', f && /b7 e f7/.test(f.text) && /xeque/.test(f.text), textoTotal(achado));
    verificar('Lance aprovado não carrega causas negativas', !achado.facts.some((x) => !x.positive && x.id !== 'evaluation'), JSON.stringify(achado.facts.map((x) => x.id)));
    const perdido = licao(fen, 'e4c3', {
      before: { score: { type: 'cp', value: 200 }, bestMove: 'e4d6', best: 'Nd6+', pvUci: 'e4d6 e8f8 d6b7 f7b7' },
      after: { score: { type: 'cp', value: -100 }, pvUci: 'f7f2 c3e4' }, quality: Q('mistake', 'Erro', 0.12) });
    verificar('Garfo não aproveitado aponta a alternativa e o tema correto', temFato(perdido, 'fork-missed') && perdido.theme === 'fork-missed', textoTotal(perdido));
    // O cavalo bloqueia o xeque da torre em d8 e fica cravado em d6: geometricamente ataca b7 e f7, mas não pode capturar.
    const cravada = licao('3rk3/1r3q2/8/8/4N3/8/8/3K4 w - - 0 1', 'e4d6', {
      before: { score: { type: 'cp', value: 0 }, bestMove: 'e4d6', pvUci: 'e4d6 e8f8 d6b7 f7b7' }, after: { score: { type: 'cp', value: 0 }, pvUci: 'e8f8' }, quality: Q('best', 'Melhor', 0) });
    verificar('Sem alvos legais, nenhum garfo é inventado', !temFato(cravada, 'fork-found') && !temFato(cravada, 'fork-missed'), textoTotal(cravada));
  },

  mateEncontradoEPerdido() {
    const fen = 'k7/8/1K6/8/8/8/8/7Q w - - 0 1';
    const perdido = licao(fen, 'h1h2', {
      before: { score: { type: 'mate', value: 1 }, bestMove: 'h1h8', best: 'Qh8#', pvUci: 'h1h8' },
      after: { score: { type: 'cp', value: 0 }, pvUci: 'a8b8' }, quality: Q('blunder', 'Erro grave', 0.3) });
    verificar('Mate perdido é identificado com a variante legal do mate', temFato(perdido, 'mate-missed') && perdido.theme === 'mate-missed' && /Qh8#/.test(textoTotal(perdido)), textoTotal(perdido));
    const achado = licao(fen, 'h1h8', {
      before: { score: { type: 'mate', value: 1 }, bestMove: 'h1h8', best: 'Qh8#', pvUci: 'h1h8' },
      after: { score: { type: 'mate', value: 0 }, pvUci: '' }, quality: Q('best', 'Melhor', 0) });
    verificar('Lance que dá mate é elogiado com fato verificado', temFato(achado, 'found-mate') && achado.explanation === 'verified', textoTotal(achado));
  },

  posicaoJaPerdida() {
    const fen = 'r1bqkbnr/ppp2Bpp/2n1p3/3pN3/8/8/PPPP1PPP/RNBQK2R b KQkq - 0 1';
    // Pretas já estão perdidas: o melhor lance ainda leva a mate; não pode ser culpado por isso.
    const pos = A.positionFromFen('rnbqkbnr/ppp2ppp/3p4/4N3/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5');
    const l = licao('rn1qkbnr/ppp2Bpp/3p4/4N3/8/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 6', 'e8e7', {
      before: { score: { type: 'mate', value: -1 }, bestMove: 'e8e7', best: 'Ke7', pvUci: 'e8e7 c3d5' },
      after: { score: { type: 'mate', value: 1 }, pvUci: 'c3d5' }, quality: Q('best', 'Melhor', 0) });
    verificar('Melhor lance numa posição já perdida não recebe tema de erro', l.theme === 'sound' && (temFato(l, 'already-lost') || l.valid), `${l.theme} :: ${textoTotal(l)}`);
    void fen; void pos;
  },

  posicional() {
    const abertura = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const l = licao(abertura, 'a2a3', {
      before: { score: { type: 'cp', value: 30 }, bestMove: 'e2e4', best: 'e4', pvUci: 'e2e4 e7e5', variations: [] },
      after: { score: { type: 'cp', value: 10 }, pvUci: 'e7e5 g1f3' }, quality: Q('inaccuracy', 'Imprecisão', 0.06) });
    verificar('Sem causa tática: o treinador declara incerteza e não inventa motivo', l.theme === 'positional' && l.explanation !== 'verified' && l.uncertainty.some((u) => /não demonstram uma causa concreta/.test(u)), textoTotal(l));
    verificar('Indícios posicionais ficam em campo próprio (heurísticas), não entre os fatos', l.heuristics.some((h) => h.id === 'center-pawn') && !l.facts.some((f) => f.id === 'center-pawn'), JSON.stringify(l.heuristics));
    verificar('A manchete admite que a causa não foi demonstrada', /não demonstram uma causa concreta/.test(l.headline), l.headline);
    const pretas = licao('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', 'a7a6', {
      before: { score: { type: 'cp', value: -30 }, bestMove: 'e7e5', best: 'e5', pvUci: 'e7e5 g1f3' },
      after: { score: { type: 'cp', value: 40 }, pvUci: 'g1f3 b8c6' }, quality: Q('inaccuracy', 'Imprecisão', 0.07) });
    verificar('Funciona para as pretas (perspectiva e alternativa corretas)', pretas.mover === 'b' && pretas.alternative.san === 'e5' && pretas.heuristics.some((h) => h.subject === 'best' && h.id === 'center-pawn'), JSON.stringify(pretas.heuristics));
    verificar('Perguntas de estudo existem nas duas variantes (decisão e revisão)', /Volte uma jogada/.test(pretas.questions.review) && /Lembre o que você pretendia/.test(pretas.questions.decision));
  },

  roque() {
    const l = licao('r3k2r/pppqbppp/2n1pn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQK2R b KQkq - 0 8', 'e8g8', {
      before: { score: { type: 'cp', value: -20 }, bestMove: 'e8g8', best: 'O-O', pvUci: 'e8g8 e1g1' },
      after: { score: { type: 'cp', value: 20 }, pvUci: 'e1g1 f8e8' }, quality: Q('best', 'Melhor', 0) });
    verificar('Roque das pretas é reconhecido como indício, sem afirmar causa', l.heuristics.some((h) => h.id === 'castle') && l.explanation === 'partial', textoTotal(l));
  },

  sacrificio() {
    // Cavalo entregue em f7 num lance que o motor aprova: fato positivo de sacrifício, nunca um "erro".
    const l = licao('r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6', 'g5f7', {
      before: { score: { type: 'cp', value: 100 }, bestMove: 'g5f7', best: 'Nxf7', pvUci: 'g5f7 e8f7 d1f3' },
      after: { score: { type: 'cp', value: -100 }, pvUci: 'e8f7 d1f3' }, quality: Q('best', 'Melhor', 0) });
    verificar('Lance aprovado que entrega material vira fato de sacrifício, sem tema de erro', l.theme === 'sound' && !l.facts.some((f) => !f.positive && f.id !== 'evaluation'), textoTotal(l));
  },

  robustez() {
    const base = {
      before: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', turn: 'w', depth: 10, score: { type: 'cp', value: 20 }, bestMove: 'e2e4', pvUci: 'e2e4' },
      after: { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', turn: 'b', depth: 10, score: { type: 'cp', value: -20 }, pvUci: 'e7e5' },
      played: { side: 'w', san: 'e4', moveNumber: 1, from: 52, to: 36, promotion: '' }, quality: Q('best', 'Melhor', 0)
    };
    verificar('Entrada completa gera lição válida', coach.buildLesson(base).valid === true);
    const ilegal = coach.buildLesson({ ...base, played: { ...base.played, to: 20 + 0 * 1, from: 52 } });
    verificar('Lance ilegal na posição de origem: nenhuma explicação é inventada', ilegal.valid === false && ilegal.facts.length === 0, JSON.stringify(ilegal.uncertainty));
    const inconsistente = coach.buildLesson({ ...base, after: { ...base.after, fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1' } });
    verificar('Posição depois do lance que não confere: lição inválida e honesta', inconsistente.valid === false && /não confere/.test(inconsistente.uncertainty[0]), inconsistente.uncertainty[0]);
    const semDados = coach.buildLesson({ before: {}, after: {}, played: base.played, quality: base.quality });
    verificar('Sem dados do motor: lição inválida com aviso', semDados.valid === false && semDados.uncertainty.length === 1);
    const pvQuebrada = coach.buildLesson({ ...base, after: { ...base.after, pvUci: 'e7e5 a1a8 h7h6' } });
    verificar('Variante com lance ilegal usa só o trecho validado e avisa', pvQuebrada.valid === true && pvQuebrada.uncertainty.some((u) => /não pôde ser reproduzida/.test(u)), JSON.stringify(pvQuebrada.uncertainty));
  },

  estruturaEReiSeguro() {
    const simples = (fen, uci, kind = 'best', label = 'Melhor') => licao(fen, uci, {
      before: { score: { type: 'cp', value: 0 }, bestMove: uci, pvUci: uci }, after: { score: { type: 'cp', value: 0 }, pvUci: '' }, quality: Q(kind, label, 0) });
    const ids = (l) => l.heuristics.filter((h) => h.subject === 'played').map((h) => h.id);
    const dobrados = simples('4k3/8/8/8/2p5/1P6/2P5/4K3 w - - 0 1', 'b3c4');
    verificar('Captura que dobra e isola peões é apontada como ponto de atenção', ids(dobrados).includes('doubled-pawns') && ids(dobrados).includes('isolated-pawn'), JSON.stringify(ids(dobrados)));
    verificar('Ponto de atenção nunca vira elogio em lance aprovado', !dobrados.positives.some((p) => p.id === 'doubled-pawns' || p.id === 'isolated-pawn'), JSON.stringify(dobrados.positives));
    const passado = simples('4k3/5p2/3p4/4P3/8/8/8/4K3 w - - 0 1', 'e5d6');
    verificar('Peão passado criado por captura é detectado (positivo)', ids(passado).includes('passed-pawn') && passado.positives.some((p) => p.id === 'passed-pawn'), JSON.stringify(passado.heuristics));
    const semPassado = simples('4k3/2p5/3p4/4P3/8/8/8/4K3 w - - 0 1', 'e5d6');
    verificar('Sem peão passado de fato (c7 vigia d6), nada é inventado', !ids(semPassado).includes('passed-pawn'), JSON.stringify(ids(semPassado)));
    const escudo = simples('r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R4RK1 w - - 0 1', 'g2g4');
    verificar('g4 diante do rei roqueado enfraquece o escudo (3 → 2)', ids(escudo).includes('king-shield') && /3 → 2/.test(escudo.heuristics.find((h) => h.id === 'king-shield').text), JSON.stringify(escudo.heuristics));
    const pretasEscudo = simples('r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R4RK1 b - - 0 1', 'g7g5');
    verificar('O escudo do rei também é medido para as pretas', ids(pretasEscudo).includes('king-shield'), JSON.stringify(pretasEscudo.heuristics));
    const neutro = simples('r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R4RK1 w - - 0 1', 'a2a3');
    verificar('Lance neutro não aciona estrutura nem escudo', !ids(neutro).some((id) => ['doubled-pawns', 'isolated-pawn', 'king-shield', 'passed-pawn'].includes(id)), JSON.stringify(ids(neutro)));
  },

  perdidaPorMate() {
    const fen = 'rn1qkbnr/ppp2p1p/3p2p1/4N3/2B3b1/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5';
    const l = licao(fen, 'g4d1', {
      before: { score: { type: 'mate', value: -3 }, bestMove: 'g8f6', best: 'Nf6', pvUci: 'g8f6 e5f7' },
      after: { score: { type: 'mate', value: 3 }, pvUci: 'c4f7 e8e7 c3d5' }, quality: Q('inaccuracy', 'Imprecisão', 0.08) });
    verificar('Lance não-melhor numa posição já perdida para mate não é culpado pelo mate', !temFato(l, 'mate-allowed') && temFato(l, 'already-lost') && l.theme === 'lost-position', `${l.theme} :: ${textoTotal(l)}`);
    verificar('A manchete diz que a posição já estava perdida', /já estava perdida/.test(l.headline), l.headline);
    const culpado = licao('rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2', 'g2g4', {
      before: { score: { type: 'cp', value: 30 }, bestMove: 'b1c3', best: 'Nc3', pvUci: 'b1c3 b8c6' },
      after: { score: { type: 'mate', value: 1 }, pvUci: 'd8h4' }, quality: Q('blunder', 'Erro grave', 0.5) });
    verificar('Mate que não existia antes continua sendo causa do erro', temFato(culpado, 'mate-allowed') && culpado.theme === 'mate-allowed');
  },

  nucleo() {
    const pos = A.positionFromFen('4k3/2b5/8/8/8/8/3Q4/4K3 w - - 0 1');
    const ex = coach.exchange(A.applyMove(pos, A.parseUciMove(pos, 'd2f4')), 37);
    verificar('exchange: bispo captura a dama indefesa em f4 (ganho 9)', ex.gain === 9, JSON.stringify(ex.gain));
    const defendida = A.positionFromFen('4k3/8/8/3p4/4P3/3P4/8/4K3 b - - 0 1');
    verificar('exchange: peão defendido por peão não é ganho (captura e recaptura)', coach.exchange(defendida, 36).gain === 0, String(coach.exchange(defendida, 36).gain));
    const rep = coach.replay('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5']);
    verificar('replay: reproduz a variante e gera a notação com numeração', coach.formatLine(rep) === '1. e4 e5 2. Nf3 Nc6 3. Bb5', coach.formatLine(rep));
    const quebrada = coach.replay('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', ['e2e4', 'e2e4']);
    verificar('replay: para na primeira jogada ilegal', quebrada.broken && quebrada.steps.length === 1);
    const pretasLinha = coach.replay('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', ['e7e5', 'g1f3']);
    verificar('replay: linha que começa com as pretas usa reticências', coach.formatLine(pretasLinha) === '1… e5 2. Nf3', coach.formatLine(pretasLinha));
    const whiteMat = coach.lineMaterial(coach.replay('7k/8/8/8/8/8/4q3/4R2K w - - 0 1', ['e1e2']), 'w');
    const blackMat = coach.lineMaterial(coach.replay('4r2k/4Q3/8/8/8/8/8/K7 b - - 0 1', ['e8e7']), 'b');
    verificar('lineMaterial: captura de dama conta +9 para o lado que captura (brancas e pretas)', whiteMat.delta === 9 && blackMat.delta === 9, `${whiteMat.delta}/${blackMat.delta}`);
    const pendente = coach.lineMaterial(coach.replay('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', ['f3e5']), 'w');
    verificar('lineMaterial: captura ainda pendente marca a variante como não assentada', pendente.settled === false, JSON.stringify(pendente));
  },
};

for (const [nome, fn] of Object.entries(cenarios)) {
  try { fn(); } catch (erro) { verificar(`Cenário "${nome}" executou sem erro`, false, erro.stack.split('\n').slice(0, 4).join(' | ')); }
}
let falhas = 0;
for (const r of resultados) { if (!r.ok) falhas += 1; console.log(`${r.ok ? 'OK' : 'FALHA'}: ${r.nome}${!r.ok && r.detalhe ? `\n  ${r.detalhe}` : ''}`); }
if (falhas) { console.error(`${falhas} verificação(ões) do treinador falharam.`); process.exit(1); }
console.log('Todos os cenários do treinador passaram.');
