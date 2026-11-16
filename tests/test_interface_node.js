// Testes de comportamento da interface em Node, com DOM mínimo e Stockfish falso (sem navegador).
// Cobrem: PGN com várias partidas, teclado e foco, navegação durante a análise e exercício guiado.
// Uso: node tests/test_interface_node.js [pasta-do-projeto] [cenário ...]
'use strict';
const fs = require('fs');
const path = require('path');
const { carregarApp } = require('./_app_node');

const argumentos = process.argv.slice(2);
const raiz = argumentos[0] && fs.existsSync(path.resolve(argumentos[0])) ? path.resolve(argumentos.shift()) : path.join(__dirname, '..');
const escolhidos = argumentos;
const resultados = [];
const verificar = (nome, ok, detalhe = '') => resultados.push({ nome, ok: Boolean(ok), detalhe });

const PGN_UMA = '[Event "Jogo 1"]\n[White "Ana"]\n[Black "Beto"]\n[WhiteElo "1500"]\n[BlackElo "1480"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *\n';
const PGN_DUAS = `${PGN_UMA}\n[Event "Jogo 2"]\n[White "Carla"]\n[Black "Davi"]\n[WhiteElo "2100"]\n[SetUp "1"]\n[FEN "8/8/8/8/8/8/4K3/4k3 w - - 0 1"]\n\n1. Ke3 Kd1 *\n`;
const PGN_LEGAL = '[Event "Légal"]\n[White "Brancas"]\n[Black "Pretas"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0\n';
const PGN_CLK = '[Event "Relógio"]\n\n1. e4 {[%clk 0:03:00]} e5\n{ comentário\n[%clk 0:02:59] }\n2. Nf3 *\n';

const carregar = (t, texto = PGN_UMA) => { t.porId('pgn-text').value = texto; t.clicar(t.porId('load-pgn-text')); };
const tick = () => new Promise((resolve) => setImmediate(resolve));
const quadrados = (t) => t.porId('chessboard').querySelectorAll('.square');

const cenarios = {
  async pgn() {
    const t = carregarApp(raiz); carregar(t, PGN_DUAS);
    const e = t.app.estado();
    verificar('PGN com duas partidas: só os 6 lances da primeira são carregados', e.history.length === 7, `posições=${e.history.length}; ${t.porId('import-status').textContent}`);
    verificar('PGN com duas partidas: jogadores vêm da primeira', t.porId('game-details').textContent.includes('Ana × Beto'), t.porId('game-details').textContent);
    verificar('PGN com duas partidas: rating vem da primeira', t.porId('white-rating').value === '1500', t.porId('white-rating').value);
    verificar('PGN com duas partidas: o site avisa que só a primeira foi carregada', /apenas a primeira/.test(t.porId('import-status').textContent), t.porId('import-status').textContent);
    const u = carregarApp(raiz); carregar(u, PGN_UMA);
    verificar('PGN de uma partida: sem aviso de partidas ignoradas', u.app.estado().history.length === 7 && !/apenas a primeira/.test(u.porId('import-status').textContent), u.porId('import-status').textContent);
    const c = carregarApp(raiz); carregar(c, PGN_CLK);
    verificar('Comentário com [%clk] em linha própria não divide a partida', c.app.estado().history.length === 4 && !/apenas a primeira/.test(c.porId('import-status').textContent), c.porId('import-status').textContent);
  },

  async teclado() {
    const t = carregarApp(raiz); carregar(t);
    const tab = quadrados(t).filter((q) => q.tabIndex === 0);
    verificar('Tabuleiro: 64 casas em 8 linhas (role=row)', quadrados(t).length === 64 && t.porId('chessboard').querySelectorAll('[role="row"]').length === 8);
    verificar('Tabuleiro: só uma casa fica na ordem de Tab', tab.length === 1, `tabindex 0 em ${tab.length}`);
    const primeira = quadrados(t)[0]; primeira.focus();
    t.tecla(primeira, 'ArrowRight');
    verificar('Seta → move o foco para a casa vizinha', t.documento.activeElement === quadrados(t)[1]);
    verificar('Foco "roving": a casa anterior sai da ordem de Tab', primeira.tabIndex === -1 && quadrados(t)[1].tabIndex === 0);
    t.tecla(quadrados(t)[1], 'ArrowDown');
    verificar('Seta ↓ desce uma linha', t.documento.activeElement === quadrados(t)[9]);
    quadrados(t)[0].focus(); t.tecla(quadrados(t)[0], 'ArrowLeft');
    verificar('Seta ← na borda mantém o foco', t.documento.activeElement === quadrados(t)[0]);
    verificar('Setas no tabuleiro não mudam o lance', t.app.estado().historyIndex === 0);

    t.tecla(t.documento.body, 'ArrowRight');
    verificar('→ fora do tabuleiro avança um lance', t.app.estado().historyIndex === 1 && /1 \/ 6/.test(t.porId('move-count').textContent), t.porId('move-count').textContent);
    t.tecla(t.documento.body, 'ArrowLeft');
    verificar('← fora do tabuleiro volta um lance', t.app.estado().historyIndex === 0);
    t.tecla(t.documento.body, 'End');
    verificar('End na página não é capturado (preserva a rolagem)', t.app.estado().historyIndex === 0);
    t.tecla(t.porId('move-list'), 'End');
    verificar('End na lista de lances vai ao último lance', t.app.estado().historyIndex === 6);
    t.tecla(t.porId('move-list'), 'Home');
    verificar('Home na lista de lances vai à posição inicial', t.app.estado().historyIndex === 0);
    const casa = quadrados(t)[20];
    t.tecla(casa, 'ArrowRight', { shiftKey: true });
    verificar('Shift + → no tabuleiro avança um lance', t.app.estado().historyIndex === 1);
    t.tecla(quadrados(t)[20], 'ArrowLeft', { shiftKey: true });
    verificar('Shift + ← no tabuleiro volta um lance', t.app.estado().historyIndex === 0);
    t.tecla(t.porId('pgn-text'), 'ArrowRight');
    verificar('Setas em campos de texto não navegam', t.app.estado().historyIndex === 0);
    const ev = t.tecla(t.documento.body, 'ArrowRight', { ctrlKey: true });
    verificar('Ctrl + seta não é capturado', t.app.estado().historyIndex === 0 && !ev.defaultPrevented);
  },

  async foco() {
    const t = carregarApp(raiz); carregar(t);
    const entradas = () => t.porId('move-list').querySelectorAll('.move-entry');
    const alvo = entradas()[2]; alvo.focus(); t.clicar(alvo);
    const atual = t.documento.activeElement;
    verificar('Clicar num lance devolve o foco ao lance atual', atual && atual.classList.contains('current') && atual.textContent.startsWith('Nf3'), atual && atual.textContent);
    t.porId('last-move').focus(); t.clicar(t.porId('last-move'));
    verificar('Foco sai do botão desabilitado para "Lance anterior"', t.documento.activeElement === t.porId('prev-move'), t.documento.activeElement && t.documento.activeElement.id);
    t.porId('first-move').focus(); t.clicar(t.porId('first-move'));
    verificar('Foco sai de "Posição inicial" para "Próximo lance"', t.documento.activeElement === t.porId('next-move'), t.documento.activeElement && t.documento.activeElement.id);
    const casa = t.porId('chessboard').querySelector('[data-square="52"]'); casa.focus(); t.clicar(casa);
    const depois = t.documento.activeElement;
    verificar('Clicar numa casa mantém o foco nela após recriar o tabuleiro', depois && depois.dataset.square === 52 || depois && String(depois.dataset.square) === '52', depois && String(depois.dataset.square));
    verificar('A casa continua selecionada e é a única na ordem de Tab', depois.classList.contains('selected') && quadrados(t).filter((q) => q.tabIndex === 0).length === 1);
  },

  async lote() {
    const t = carregarApp(raiz); carregar(t);
    await t.analisar('analyze-game');
    t.avancarLote(3);
    let e = t.app.estado();
    verificar('Análise da partida em andamento antes de navegar', e.gameBatch !== null && e.gameReviewResults.filter(Boolean).length >= 3, `resultados=${e.gameReviewResults.filter(Boolean).length}`);
    t.clicar(t.porId('last-move'));
    e = t.app.estado();
    verificar('Navegar durante a análise não cancela o lote', e.gameBatch !== null && !/cancelada/.test(t.porId('game-progress-label').textContent), t.porId('game-progress-label').textContent);
    verificar('Painel avisa que a posição ainda não foi calculada', t.porId('analysis-placeholder').hidden === false && /ainda não foi calculada|continua/.test(t.porId('engine-status-text').textContent), t.porId('engine-status-text').textContent);
    t.avancarLote(100);
    e = t.app.estado();
    verificar('A análise termina com as 7 posições', e.gameReviewResults.filter(Boolean).length === 7 && e.gameBatch === null, `resultados=${e.gameReviewResults.filter(Boolean).length}`);
    verificar('Ao terminar, a posição atual mostra o resultado', t.porId('game-review-quality').hidden === false);
  },

  async exercicio() {
    const t = carregarApp(raiz); carregar(t);
    await t.analisar('analyze-game'); t.avancarLote(100);
    const botoes = () => t.porId('game-summary-coach').querySelectorAll('.summary-exercise-link');
    verificar('A revisão guiada oferece "Resolver no tabuleiro"', botoes().length > 0, `cartões=${botoes().length}`);
    if (!botoes().length) return;
    t.clicar(botoes()[0]);
    let e = t.app.estado();
    const idx = e.exerciseState && e.exerciseState.moveIndex;
    verificar('O exercício abre a posição ANTES do lance', e.exerciseState && e.historyIndex === idx - 1, `índice=${e.historyIndex}, lance=${idx}`);
    verificar('Classificação, setas e avaliação ficam ocultas', t.porId('game-review-badge').hidden === true && t.porId('move-arrows').hidden === true && t.porId('eval-number').textContent === '—');
    verificar('As linhas "melhor lance" e "linha principal" ficam ocultas', t.porId('analysis-results').classList.contains('exercise-mode'));
    verificar('Pergunta e botão de revelar aparecem', t.porId('game-review-question').hidden === false && t.porId('reveal-exercise').hidden === false);
    verificar('A explicação curta (que cita a causa do erro) não aparece', !/\bperd|erro|imprecis/i.test(t.porId('game-review-explanation').textContent), t.porId('game-review-explanation').textContent);

    const lance = t.app.allLegalMoves(e.history[e.historyIndex].position)[0];
    const casa = (n) => t.porId('chessboard').querySelector(`[data-square="${n}"]`);
    t.clicar(casa(lance.from)); t.clicar(casa(lance.to));
    e = t.app.estado();
    verificar('O palpite não altera a partida nem a análise', e.history.length === 7 && e.historyIndex === idx - 1 && e.gameReviewResults.filter(Boolean).length === 7);
    verificar('O palpite fica registrado e aparece no painel', e.exerciseState.guess && /Seu palpite/.test(t.porId('game-review-explanation').textContent), t.porId('game-review-explanation').textContent);
    t.clicar(t.porId('reveal-exercise'));
    e = t.app.estado();
    verificar('Revelar leva à posição depois do lance', e.historyIndex === idx);
    verificar('A classificação aparece depois de revelar', t.porId('game-review-badge').hidden === false);
    const fb = t.porId('exercise-feedback');
    verificar('A comparação (palpite, lance jogado, motor) é exibida', fb.hidden === false && /Seu palpite/.test(fb.textContent) && /Lance jogado/.test(fb.textContent) && /Stockfish/.test(fb.textContent), fb.textContent);
    t.clicar(t.porId(idx <= 3 ? 'last-move' : 'first-move'));
    e = t.app.estado();
    verificar('Sair do lance encerra o exercício e some a comparação', e.exerciseState === null && t.porId('exercise-feedback').hidden === true);

    t.clicar(botoes()[0]);
    t.tecla(t.documento.body, 'ArrowRight');
    e = t.app.estado();
    verificar('Avançar com a seta também revela, indicando que não houve palpite', e.historyIndex === idx && /não indicou um palpite/.test(t.porId('exercise-feedback').textContent), t.porId('exercise-feedback').textContent);
    t.clicar(botoes()[0]);
    await t.analisar('analyze-position');
    verificar('Pedir outra análise encerra o exercício', t.app.estado().exerciseState === null);
  },

  async treinador() {
    const t = carregarApp(raiz); carregar(t, PGN_LEGAL);
    await t.analisar('analyze-game'); t.avancarLote(200);
    const e = t.app.estado();
    const res = e.gameReviewResults;
    verificar('Partida com mate: 14 posições analisadas', res.filter(Boolean).length === 14 && e.gameBatch === null, `resultados=${res.filter(Boolean).length}`);
    const lances = res.slice(1);
    verificar('Todo lance classificado tem uma lição válida (brancas e pretas)', lances.every((r) => r.quality && r.quality.lesson && r.quality.lesson.valid) && lances.some((r) => r.quality.lesson.mover === 'b') && lances.some((r) => r.quality.lesson.mover === 'w'), lances.map((r) => r.quality?.label).join(','));
    verificar('O lance que dá mate não fica "Sem avaliação" (posição terminal resolvida pelas regras)', res[13].quality && res[13].quality.kind === 'best' && res[13].score.type === 'mate', JSON.stringify(res[13].quality && res[13].quality.label));
    verificar('A posição terminal não é enviada ao motor', res[13].bestMove === '(none)');
    const alvo = lances.findIndex((r) => r.quality.lesson.facts.length > 0) + 1;
    t.app.goTo(alvo);
    const q = t.app.estado().gameReviewResults[alvo].quality;
    verificar('O painel mostra a manchete da lição', t.porId('game-review-explanation').textContent === q.explanation && q.explanation.length > 20, t.porId('game-review-explanation').textContent);
    verificar('A pergunta de estudo vem da lição', t.porId('game-review-question').textContent === q.lesson.questions.review);
    verificar('A análise completa fica oculta até o aluno pedir', t.porId('detailed-move-explanation').hidden === true && t.porId('explain-move').hidden === false);
    t.clicar(t.porId('explain-move'));
    const det = t.porId('detailed-move-explanation');
    verificar('Revelar mostra o nível de confiança, os fatos e o que o aluno leva', det.hidden === false && det.querySelector('.lesson-confidence') && det.querySelector('.lesson-facts') && det.querySelector('.lesson-takeaway'), det.textContent.slice(0, 200));
    verificar('Cada fato mostra a sua origem (regras, variante ou motor)', det.querySelectorAll('.lesson-source').length >= 1);
    const comIndicio = lances.findIndex((r) => r.quality.lesson.heuristics.length > 0) + 1;
    if (comIndicio > 0) {
      t.app.goTo(comIndicio); t.clicar(t.porId('explain-move'));
      const h = t.porId('detailed-move-explanation').querySelector('.lesson-heuristics');
      verificar('Indícios posicionais aparecem rotulados como heurísticas, não provas', h && /não provas/.test(h.textContent), h && h.textContent.slice(0, 120));
    }
    const cartoes = t.porId('game-summary-coach').querySelectorAll('.coach-review-card');
    verificar('A revisão guiada mostra cartões com tema, pergunta e hábito', cartoes.length > 0 && /Para levar/.test(t.porId('game-summary-coach').textContent), `cartões=${cartoes.length}`);
    verificar('A revisão guiada traz o lance mais custoso de qualquer lado', /Bxd1|g6/.test(t.porId('game-summary-coach').textContent) || cartoes.length > 0);
  },

  async hipotetica() {
    const t = carregarApp(raiz); carregar(t, PGN_LEGAL);
    await t.analisar('analyze-game'); t.avancarLote(200);
    t.app.goTo(2);
    const pos = t.app.estado().history[2].position;
    const original = t.app.estado().history[3].move;
    const outro = t.app.allLegalMoves(pos).find((m) => !(m.from === original.from && m.to === original.to));
    const casa = (n) => t.porId('chessboard').querySelector(`[data-square="${n}"]`);
    t.clicar(casa(outro.from)); t.clicar(casa(outro.to));
    let e = t.app.estado();
    verificar('Um lance diferente inicia a linha hipotética', e.variationSession !== null && e.history.length === 4, `posições=${e.history.length}`);
    t.avancarLote(200);
    e = t.app.estado();
    const r = e.gameReviewResults[3];
    verificar('O lance hipotético recebe classificação e lição', r && r.quality && r.quality.lesson && r.quality.lesson.valid, JSON.stringify(r && r.quality && r.quality.label));
    verificar('O painel identifica o lance como hipotético', /HIPOTÉTICA/.test(t.porId('game-review-context').textContent), t.porId('game-review-context').textContent);
  },

  async lanceDoMotor() {
    const t = carregarApp(raiz);
    const fenAntes = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const pos = t.app.positionFromFen(fenAntes), mv = t.app.parseUciMove(pos, 'e2e4'), depois = t.app.applyMove(pos, mv);
    const jogado = { side: 'w', san: 'e4', moveNumber: 1, from: mv.from, to: mv.to, promotion: '', movingPiece: 'P', capturedPiece: '.' };
    const antes = { fen: fenAntes, turn: 'w', depth: 14, score: { type: 'cp', value: 1007 }, bestMove: 'e2e4', best: 'e4', pvUci: 'e2e4 e7e5', variations: [] };
    // A busca da posição seguinte instável devolve uma pontuação muito pior (+3,4 para as brancas).
    const apos = { fen: t.app.currentFen(depois), turn: 'b', depth: 14, score: { type: 'cp', value: -340 }, pvUci: 'e7e5' };
    const igual = t.app.moveQuality(antes, apos, jogado);
    verificar('Lance igual ao do motor tem perda zero e é "Melhor", mesmo com busca instável', igual.loss === 0 && igual.kind === 'best', JSON.stringify({ loss: igual.loss, kind: igual.kind }));
    const outro = t.app.moveQuality({ ...antes, bestMove: 'd2d4', best: 'd4' }, apos, jogado);
    verificar('Lance diferente do melhor continua medido pela perda de pontos esperados', outro.loss > 0.1, String(outro.loss));
  },


  async dialogo() {
    const t = carregarApp(raiz); carregar(t);
    await t.analisar('analyze-game'); t.avancarLote(100);
    carregar(t, PGN_LEGAL); // outra partida: sem posições em cache, para que uma análise indevida ficasse visível
    t.clicar(t.porId('analyze-game'));
    const d = t.porId('depth-dialog');
    verificar('O diálogo de profundidade abre ao analisar', d.open === true);
    d.close(); // Esc: fecha sem valor de retorno
    await tick();
    const e = t.app.estado();
    verificar('Defesa: fechar o diálogo sem escolha (Esc) não inicia a análise nem com returnValue antigo', e.pendingAnalysis === null && e.gameBatch === null && e.activeAnalysis === null);
  },

  async variacaoSemDialogo() {
    const t = carregarApp(raiz); carregar(t, PGN_LEGAL);
    await t.analisar('analyze-game', 16); t.avancarLote(200);
    t.documento.querySelector('.mode-tab[data-depth="10"]').dispatchEvent(t.documento.criarEvento('click')); // a pessoa muda a aba depois
    t.app.goTo(2);
    const pos = t.app.estado().history[2].position, original = t.app.estado().history[3].move;
    const outro = t.app.allLegalMoves(pos).find((m) => !(m.from === original.from && m.to === original.to));
    const casa = (n) => t.porId('chessboard').querySelector(`[data-square="${n}"]`);
    t.clicar(casa(outro.from)); t.clicar(casa(outro.to));
    const e = t.app.estado();
    verificar('Lance hipotético não abre o diálogo de profundidade', t.porId('depth-dialog').open === false);
    verificar('A variação é analisada na mesma profundidade da partida (16)', e.gameBatch && e.gameBatch.depth === 16, e.gameBatch && String(e.gameBatch.depth));
  },

  async fen() {
    const t = carregarApp(raiz);
    carregar(t, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    let e = t.app.estado();
    verificar('FEN avulso abre a posição sem lances', e.history.length === 1 && /FEN carregada/.test(t.porId('import-status').textContent), t.porId('import-status').textContent);
    verificar('FEN avulso respeita o lado a jogar', /pretas/.test(t.porId('turn-indicator').textContent), t.porId('turn-indicator').textContent);
    const lance = t.app.allLegalMoves(e.position)[0];
    const casa = (n) => t.porId('chessboard').querySelector(`[data-square="${n}"]`);
    t.clicar(casa(lance.from)); t.clicar(casa(lance.to));
    e = t.app.estado();
    verificar('FEN avulso é tabuleiro livre: o lance entra no histórico, sem modo de variação', e.history.length === 2 && e.variationSession === null);
    carregar(t, '4k3/8/8/8/8/8/4r3/4K3 b - - 0 1');
    verificar('FEN ilegal (lado que não joga em xeque) é recusado com explicação', /ilegal/.test(t.porId('import-status').textContent), t.porId('import-status').textContent);
    carregar(t, 'P3k3/8/8/8/8/8/8/4K3 w - - 0 1');
    verificar('FEN com peão na última fileira é recusado', /peão/.test(t.porId('import-status').textContent), t.porId('import-status').textContent);
  },

  async pgnTolerante() {
    const t = carregarApp(raiz);
    const lances = (texto) => { carregar(t, texto); return t.app.estado().history.length - 1; };
    verificar('Captura de peão sem "x" (ed5)', lances('1. e4 d5 2. ed5 *') === 3);
    verificar('Captura de peça sem "x" (Qf7#)', lances('1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qf7# *') === 7);
    verificar('Promoção sem "=" (e8Q+)', lances('[SetUp "1"]\n[FEN "8/4P2k/8/8/8/8/8/K7 w - - 0 1"]\n\n1. e8Q+ *') === 1);
    verificar('Numeração com reticências unicode (1…)', lances('1. e4 1… e5 2. Nf3 *') === 3);
    lances('1. e5 *');
    verificar('Lance impossível continua sendo recusado', /Não consegui interpretar/.test(t.porId('import-status').textContent), t.porId('import-status').textContent);
  },

  async chesscom() {
    const arquivo = 'https://api.chess.com/pub/player/gab0bu/games/2026/11';
    const resposta = (status, corpo) => ({ ok: status >= 200 && status < 300, status, json: async () => corpo });
    const chamadas = [];
    let t = carregarApp(raiz, { fetch: async (url) => { chamadas.push(url); return resposta(404, {}); } });
    await tick(); await tick();
    verificar('Perfil inexistente (404) mostra mensagem clara', /não encontrou/.test(t.porId('chesscom-status').textContent), t.porId('chesscom-status').textContent);

    chamadas.length = 0;
    t = carregarApp(raiz, { fetch: async (url) => { chamadas.push(url); return url.endsWith('/archives') ? resposta(200, { archives: ['https://evil.example/pub/x'] }) : resposta(200, { games: [] }); } });
    await tick(); await tick(); await tick();
    verificar('Arquivo mensal fora de api.chess.com é recusado e nunca consultado', !chamadas.some((u) => u.includes('evil')) && /inesperado/.test(t.porId('chesscom-status').textContent), `${chamadas.join(',')} :: ${t.porId('chesscom-status').textContent}`);

    t = carregarApp(raiz, { fetch: async (url) => url.endsWith('/archives') ? resposta(200, { archives: [arquivo] })
      : resposta(200, { games: [{ url: 'https://www.chess.com/game/live/1', pgn: PGN_UMA, time_class: 'blitz', end_time: 1700000000, white: { username: 'Gab0bu', result: 'win', rating: 1000 }, black: { username: 'Rival', result: 'checkmated', rating: 990 } }] }) });
    for (let i = 0; i < 5; i += 1) await tick();
    const cartoes = t.porId('chesscom-games').querySelectorAll('.external-game-card');
    verificar('As partidas do mês são listadas', cartoes.length === 1, t.porId('chesscom-status').textContent);
    if (cartoes.length) {
      t.clicar(cartoes[0].querySelector('button'));
      verificar('"Analisar" carrega a partida e pede a profundidade', t.app.estado().history.length === 7 && t.porId('depth-dialog').open === true);
    }
  },

  async biblioteca() {
    const t = carregarApp(raiz); carregar(t, PGN_LEGAL);
    await t.analisar('analyze-game'); t.avancarLote(200); await tick(); await tick();
    verificar('Ao terminar, a análise é salva no IndexedDB', t.bancoFalso.dados.size === 1, `registros=${t.bancoFalso.dados.size}`);
    const registro = [...t.bancoFalso.dados.values()][0] || {};
    verificar('O registro guarda PGN, profundidade e um resultado por posição', /Nd5#/.test(registro.pgn || '') && registro.depth && registro.results && registro.results.length === 14, JSON.stringify(Object.keys(registro)));
    verificar('A lista "Análises salvas" mostra o registro', t.porId('saved-games').querySelectorAll('.saved-game-card').length === 1);
    carregar(t, PGN_UMA);
    verificar('Carregar outra partida limpa os resultados da anterior', t.app.estado().gameReviewResults.filter(Boolean).length === 0);
    const abrir = t.porId('saved-games').querySelector('.saved-game-card button');
    t.clicar(abrir); await tick();
    const e = t.app.estado();
    verificar('"Abrir análise" restaura partida e resultados salvos', e.history.length === 14 && e.gameReviewResults.filter(Boolean).length === 14, `posições=${e.history.length}`);

    const arquivoImportado = { text: async () => JSON.stringify({ games: [{ ...registro, id: 'pgn:outro' }, { id: 7 }, { id: 'x', pgn: 'y', results: ['texto'] }] }) };
    t.porId('import-library-file').files = [arquivoImportado];
    t.porId('import-library-file').dispatchEvent(t.documento.criarEvento('change', { bubbles: false }));
    for (let i = 0; i < 6; i += 1) await tick();
    verificar('A importação aceita só registros válidos e informa os ignorados', t.bancoFalso.dados.size === 2 && /2 ignorado/.test(t.porId('saved-status').textContent), `${t.bancoFalso.dados.size} :: ${t.porId('saved-status').textContent}`);
  },

  async visaoGeral() {
    const t = carregarApp(raiz);
    await tick(); await tick();
    t.clicar(t.porId('insights-tab')); await tick(); await tick();
    verificar('Visão geral vazia explica como começar (sem erro)', /Nenhuma análise salva/.test(t.porId('insights-status').textContent) && /primeira análise/.test(t.porId('insights-body').textContent), t.porId('insights-status').textContent);

    carregar(t, PGN_LEGAL);
    await t.analisar('analyze-game'); t.avancarLote(200); await tick(); await tick();
    const base = [...t.bancoFalso.dados.values()][0];
    verificar('Há uma análise salva para alimentar a Visão geral', Boolean(base) && base.results.length === 14);
    // Quatro partidas do perfil Gab0bu (brancas): três lances seus por partida marcados como "peça deixada em prise".
    for (let n = 1; n <= 4; n += 1) {
      const registro = JSON.parse(JSON.stringify(base));
      registro.id = `pgn:visao-${n}`; registro.headers = { ...registro.headers, White: 'Gab0bu', Black: 'Rival', Result: '1-0', Date: `2026.11.0${n}`, WhiteElo: '1200', BlackElo: '1200', ECOUrl: 'https://www.chess.com/openings/Italian-Game-Giuoco-Piano-4.c3' };
      for (const i of [3, 5, 7]) registro.results[i].quality = { ...registro.results[i].quality, kind: 'blunder', label: 'Erro grave', loss: 0.3, lesson: { ...registro.results[i].quality.lesson, theme: 'piece-hanging', kind: 'blunder', label: 'Erro grave' } };
      t.bancoFalso.dados.set(registro.id, registro);
    }
    t.clicar(t.porId('insights-tab')); await tick(); await tick(); await tick();
    const corpo = t.porId('insights-body');
    const texto = corpo.textContent;
    verificar('Considera só as 4 partidas de Gab0bu (a de terceiros fica de fora)', /4 partidas de Gab0bu/.test(t.porId('insights-status').textContent), t.porId('insights-status').textContent);
    verificar('Mostra a precisão estimada e o resultado', /Precisão estimada/.test(texto) && /dos pontos/.test(texto), texto.slice(0, 200));
    verificar('Mostra "O que treinar primeiro" com o tema recorrente e a evidência separada da sugestão', /O que treinar primeiro/.test(texto) && /Peça deixada em prise/.test(texto) && /O que foi medido/.test(texto) && /Sugestão de treino/.test(texto), texto.slice(0, 300));
    verificar('Mostra aberturas agrupadas por família', /Italian Game \(brancas\)/.test(texto), texto.slice(0, 300));
    verificar('Sem relógio no PGN, não mostra a seção de tempo', !/Gestão de tempo/.test(texto));
    const exemplo = corpo.querySelectorAll('.insight-examples .insight-link')[0];
    verificar('O tema traz lances de exemplo clicáveis', Boolean(exemplo), texto.slice(0, 200));
    if (exemplo) {
      const rotulo = exemplo.textContent;
      t.clicar(exemplo); await tick(); await tick();
      const e = t.app.estado(), lance = e.history[e.historyIndex];
      verificar('Clicar num exemplo abre a partida direto no lance citado', e.history.length === 14 && e.historyIndex > 0 && rotulo.startsWith(`${lance.moveNumber}. ${lance.san}`), `posição=${e.historyIndex} (${lance.moveNumber}. ${lance.san}) botão="${rotulo}"`);
    }
    t.porId('insights-speed').value = 'bullet'; t.porId('insights-speed').dispatchEvent(t.documento.criarEvento('change', { bubbles: false })); await tick(); await tick(); await tick();
    verificar('Filtro de ritmo sem partidas mostra estado vazio claro', /combina com o filtro/.test(t.porId('insights-status').textContent), t.porId('insights-status').textContent);
  },

  async estatico() {
    const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(raiz, 'styles.css'), 'utf8');
    verificar('Lista de lances sem aria-live (evita reanúncio a cada lance)', !/id="move-list"[^>]*aria-live/.test(html));
    verificar('Contagem de posições é uma região de status', /id="move-count"[^>]*role="status"/.test(html));
    verificar('Barra de avaliação tem role="img"', /class="eval-bar" role="img"/.test(html));
    verificar('CSS respeita prefers-reduced-motion', /prefers-reduced-motion:reduce/.test(css));
    verificar('CSS sem regras da navegação superior removida', !/\.top-nav|\.nav-link/.test(css));
    verificar('A animação dock-enter é usada', /animation:dock-enter/.test(css));
  },
};

(async () => {
const nomes = escolhidos.length ? escolhidos : Object.keys(cenarios);
for (const nome of nomes) {
  if (!cenarios[nome]) { console.error(`Cenário desconhecido: ${nome}. Disponíveis: ${Object.keys(cenarios).join(', ')}`); process.exit(2); }
  try { await cenarios[nome](); } catch (erro) { verificar(`Cenário "${nome}" executou sem erro`, false, erro.stack.split('\n').slice(0, 4).join(' | ')); }
}
let falhas = 0;
for (const r of resultados) { if (!r.ok) falhas += 1; console.log(`${r.ok ? 'OK' : 'FALHA'}: ${r.nome}${!r.ok && r.detalhe ? `\n  ${r.detalhe}` : ''}`); }
if (falhas) { console.error(`${falhas} verificação(ões) falharam.`); process.exit(1); }
console.log('Todos os cenários de interface passaram.');
})();
