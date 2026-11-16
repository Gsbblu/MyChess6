/*
 * MyChess · Visão geral (diagnóstico a partir das análises salvas)
 *
 * Módulo puro (sem DOM) que lê os registros guardados na biblioteca (PGN, cabeçalhos e resultados do
 * Stockfish já classificados pelo aplicativo) e devolve um relatório estruturado. Nada aqui chama o motor:
 * tudo é aritmética sobre dados que já existem. Cada afirmação do relatório traz a sua evidência numérica
 * e só aparece quando a amostra mínima é atingida; o que é sugestão de treino fica separado do que é medido.
 *
 *   precisão      Estimativa por partida. Aplica a fórmula aberta do Lichess (curva exponencial sobre a perda
 *                 de chance) à perda de pontos esperados do próprio app; a nota final é a média entre a média
 *                 aritmética e a harmônica dos lances. NÃO é a nota proprietária de nenhum site.
 *   temas         Vêm do treinador (coach.js) gravado em cada lance salvo; só lances com imprecisão, erro ou
 *                 erro grave entram. "Preferência posicional" significa que nenhuma causa tática foi provada.
 *   tempo         Lido dos comentários [%clk] do PGN (Chess.com); só entra se houver um relógio por lance.
 *   aberturas     Nome vindo dos cabeçalhos do PGN (Opening/ECOUrl/ECO); não há base de teoria aqui.
 *   vantagens     "Vantagem desperdiçada" = a chance esperada do jogador passou de 80% e a partida não terminou
 *                 em vitória (inclui derrotas por tempo, identificadas pelo cabeçalho Termination).
 *
 * Uso: const relatorio = MyChessInsights.compute(registros, { profile, periodDays, speed, expected, themes });
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MyChessInsights = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONCERNING = ['inaccuracy', 'mistake', 'blunder'];
  const SERIOUS = ['mistake', 'blunder'];
  const GOOD = ['best', 'excellent', 'good', 'great', 'brilliant'];
  const PHASES = ['Abertura', 'Meio-jogo', 'Final'];
  const NOT_ACTIONABLE = ['positional', 'lost-position', 'unknown', 'sound'];
  const MIN = { themeMoves: 3, phaseMoves: 15, phaseGames: 3, openingGames: 3, colorGames: 5, wastedGames: 2, clockGames: 3, troubleMoves: 6, fastMoves: 20, trendGames: 6 };
  const ADVANTAGE = 0.8, COMEBACK = 0.25, EARLY_PLIES = 8;
  const FAMILY_END = new Set(['Defense', 'Defence', 'Game', 'Opening', 'Gambit', 'Attack', 'System']);
  const NAME_FIXES = [[/\bCaro Kann\b/, 'Caro-Kann'], [/\bNimzo Larsen\b/, 'Nimzo-Larsen'], [/\bNimzo Indian\b/, 'Nimzo-Indian'], [/\bQueens Indian\b/, 'Queens Indian'], [/\bKings Indian\b/, 'Kings Indian'], [/\bPetrovs\b/, 'Petrovs']];

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const sum = (values) => values.reduce((total, value) => total + value, 0);
  const mean = (values) => (values.length ? sum(values) / values.length : null);
  const pct = (fraction) => `${Math.round(fraction * 100)}%`;
  const one = (number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(number);
  const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;
  const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

  // ---- Precisão ---------------------------------------------------------------------------------------------

  function moveAccuracy(loss) {
    const winDiff = clamp(loss, 0, 1) * 100;
    return clamp(103.1668100711649 * Math.exp(-0.04354415386753951 * winDiff) - 3.166924740191411, 0, 100);
  }

  function gameAccuracy(losses) {
    if (!losses.length) return null;
    const accuracies = losses.map(moveAccuracy);
    const harmonic = accuracies.length / sum(accuracies.map((value) => 1 / Math.max(value, 1)));
    return (mean(accuracies) + harmonic) / 2;
  }

  function defaultExpected(score, turn, side) {
    if (!score || !isNumber(score.value)) return null;
    const mover = turn === 'w' ? 1 : -1, wanted = side === 'w' ? 1 : -1;
    const cp = score.type === 'mate' ? Math.sign(score.value) * 10000 : score.value;
    return 1 / (1 + Math.exp(-(cp * mover * wanted) / 400));
  }

  // ---- Leitura dos cabeçalhos e do PGN ---------------------------------------------------------------------------

  function gameTime(headers, savedAt) {
    const date = [headers.UTCDate, headers.Date, headers.EndDate].find((value) => /^\d{4}\.\d{2}\.\d{2}$/.test(value || ''));
    if (!date) return savedAt || 0;
    const [year, month, day] = date.split('.').map(Number);
    const time = /(\d{1,2}):(\d{2}):(\d{2})/.exec(headers.UTCTime || headers.EndTime || '');
    return Date.UTC(year, month - 1, day, time ? Number(time[1]) : 12, time ? Number(time[2]) : 0, time ? Number(time[3]) : 0);
  }

  function parseTimeControl(value) {
    const text = String(value || '').trim();
    if (!text || text === '-') return { speed: 'unknown', base: 0, increment: 0 };
    if (text.includes('/')) return { speed: 'daily', base: 0, increment: 0 };
    const match = /^(\d+)(?:\+(\d+))?$/.exec(text);
    if (!match) return { speed: 'unknown', base: 0, increment: 0 };
    const base = Number(match[1]), increment = Number(match[2] || 0), estimate = base + 40 * increment;
    return { speed: estimate < 180 ? 'bullet' : estimate < 600 ? 'blitz' : 'rapid', base, increment };
  }

  function parseClocks(pgn) {
    const clocks = [], pattern = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/g;
    const text = String(pgn || '');
    let match;
    while ((match = pattern.exec(text))) clocks.push(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
    return clocks;
  }

  function openingFamily(name) {
    const tokens = name.split(/\s+/).filter(Boolean);
    const stop = tokens.findIndex((token) => FAMILY_END.has(token));
    return (stop >= 0 ? tokens.slice(0, stop + 1) : tokens.slice(0, 3)).join(' ');
  }

  function openingOf(headers) {
    let name = String(headers.Opening || '').trim();
    if (!name && headers.ECOUrl) {
      let slug = String(headers.ECOUrl).split('/openings/')[1] || String(headers.ECOUrl).split('/').pop() || '';
      try { slug = decodeURIComponent(slug); } catch { /* mantém o texto original */ }
      const words = [];
      for (const token of slug.split(/[-\s]+/).filter(Boolean)) {
        if (/^\d+\.{1,3}/.test(token) || /\.{3}/.test(token)) break; // daqui em diante o endereço lista lances
        words.push(token);
      }
      name = words.join(' ');
    }
    for (const [pattern, replacement] of NAME_FIXES) name = name.replace(pattern, replacement);
    const eco = String(headers.ECO || '').trim();
    if (!name && eco) return { name: `ECO ${eco}`, eco, family: `ECO ${eco}` };
    if (!name) return null;
    return { name, eco, family: openingFamily(name) };
  }

  function phaseOf(result, index) {
    if (index <= 20) return 'Abertura';
    const board = String(result.fen || '').split(' ')[0];
    const nonPawn = (board.match(/[QRBNqrbn]/g) || []).length;
    return !/[Qq]/.test(board) && nonPawn <= 6 ? 'Final' : 'Meio-jogo';
  }

  const moveLabel = (move) => `${move.moveNumber}${move.side === 'w' ? '.' : '…'} ${move.san}`;

  // ---- Uma partida ---------------------------------------------------------------------------------------------------------

  function analyzeGame(record, context) {
    if (!record || !Array.isArray(record.results)) return null;
    const headers = record.headers || {};
    const white = String(headers.White || '').trim().toLowerCase(), black = String(headers.Black || '').trim().toLowerCase();
    const playerSide = context.profile && white === context.profile ? 'w' : context.profile && black === context.profile ? 'b' : null;
    const results = record.results;
    const rating = (side) => Number(headers[side === 'w' ? 'WhiteElo' : 'BlackElo']) || 1200;
    const control = parseTimeControl(headers.TimeControl);
    const plies = Number(record.moves) || Math.max(0, results.length - 1);

    const clocks = parseClocks(record.pgn);
    const hasClock = control.base > 0 && plies > 0 && clocks.length === plies;
    const troubleLimit = Math.max(10, control.base * 0.12);

    const moves = [];
    results.forEach((result, index) => {
      if (index === 0 || !result || !result.quality || !isNumber(result.quality.loss)) return;
      const side = result.playedMove?.side || (index % 2 === 1 ? 'w' : 'b');
      const lesson = result.quality.lesson || null;
      const move = {
        index, side, san: result.playedMove?.san || '', moveNumber: result.playedMove?.moveNumber || Math.ceil(index / 2),
        loss: clamp(result.quality.loss, 0, 1), kind: result.quality.kind || '', label: result.quality.label || '',
        theme: lesson?.theme || null, explanation: lesson?.explanation || null, phase: phaseOf(result, index)
      };
      move.accuracy = moveAccuracy(move.loss);
      if (hasClock) {
        const previous = index - 2 >= 1 ? clocks[index - 3] : control.base;
        move.clock = clocks[index - 1];
        move.spent = Math.max(0, previous + control.increment - move.clock);
        move.inTrouble = move.clock <= troubleLimit;
      }
      moves.push(move);
    });

    const mine = playerSide ? moves.filter((move) => move.side === playerSide) : moves;
    const outcomeOf = () => {
      const result = headers.Result;
      if (!playerSide || !['1-0', '0-1', '1/2-1/2'].includes(result)) return null;
      if (result === '1/2-1/2') return 'draw';
      return (result === '1-0') === (playerSide === 'w') ? 'win' : 'loss';
    };
    const outcome = outcomeOf();

    const game = {
      id: record.id, record, time: gameTime(headers, record.savedAt), speed: control.speed, timeControl: String(headers.TimeControl || ''),
      playerSide, opponent: playerSide ? (playerSide === 'w' ? headers.Black : headers.White) || '' : '',
      title: headers.White && headers.Black ? `${headers.White} × ${headers.Black}` : record.title || 'Partida sem nome',
      outcome, termination: String(headers.Termination || ''), moves, mine, hasClock, troubleLimit, base: control.base,
      depth: Number(record.depth) || 0, opening: openingOf(headers),
      incomplete: results.slice(1).some((result) => !result) || results.length - 1 < plies,
      accuracy: mine.length >= 5 ? gameAccuracy(mine.map((move) => move.loss)) : null,
      avgLoss: mean(mine.map((move) => move.loss)), ep: {}, peak: null, low: null, wasted: null, comeback: false
    };

    if (playerSide) {
      let peak = null, low = null;
      results.forEach((result, index) => {
        if (!result || !result.score) return;
        const value = context.expected(result.score, result.turn, playerSide, rating(playerSide));
        if (!isNumber(value)) return;
        game.ep[index] = value;
        if (index >= EARLY_PLIES) { peak = peak === null ? value : Math.max(peak, value); low = low === null ? value : Math.min(low, value); }
      });
      game.peak = peak; game.low = low;
      if (peak !== null && peak >= ADVANTAGE && outcome && outcome !== 'win') {
        const candidates = mine.filter((move) => (game.ep[move.index - 1] ?? 0) >= 0.6).sort((a, b) => b.loss - a.loss);
        const timeLoss = outcome === 'loss' && /on time|tempo/i.test(game.termination);
        game.wasted = { collapse: candidates[0] || null, timeLoss };
      }
      game.comeback = low !== null && low <= COMEBACK && outcome === 'win';
    }
    return game;
  }

  // ---- Referências a lances (para o botão "Ver lance") ------------------------------------------------------

  function ref(game, move) {
    return {
      recordId: game.id, index: move.index, san: move.san, moveNumber: move.moveNumber, side: move.side, text: moveLabel(move),
      loss: move.loss, quality: move.label, opponent: game.opponent, time: game.time, theme: move.theme
    };
  }

  const confidenceFor = (n) => (n >= 8 ? 'alta' : n >= 4 ? 'média' : 'baixa');

  const PHASE_ACTION = {
    'Abertura': 'Escolha uma linha por cor e revise as partidas abaixo procurando onde você saiu do plano. Priorize desenvolver as peças, rocar e disputar o centro antes de atacar.',
    'Meio-jogo': 'Antes de cada lance, faça a checagem de três passos: xeques, capturas e ameaças do adversário. Só depois compare dois lances candidatos.',
    'Final': 'Treine finais básicos (rei e peão, torre e peões) e a atividade do rei. Nas partidas abaixo, procure o momento em que a posição deixou de ser vencedora.'
  };

  // ---- Relatório ---------------------------------------------------------------------------------------------------------------

  function compute(records, options = {}) {
    const profile = String(options.profile || '').trim().toLowerCase();
    const expected = typeof options.expected === 'function' ? options.expected : defaultExpected;
    const themes = options.themes || {};
    const now = options.now || Date.now();
    const cutoff = options.periodDays ? now - Number(options.periodDays) * 86400000 : 0;
    const speedFilter = options.speed && options.speed !== 'all' ? options.speed : null;
    const context = { profile, expected };

    const analyzed = (records || []).map((record) => analyzeGame(record, context)).filter(Boolean);
    const inPeriod = analyzed.filter((game) => game.time >= cutoff && (!speedFilter || game.speed === speedFilter));
    const mode = inPeriod.some((game) => game.playerSide) ? 'player' : 'both';
    const eligible = mode === 'player' ? inPeriod.filter((game) => game.playerSide) : inPeriod;
    const games = eligible.filter((game) => game.mine.length > 0).sort((a, b) => a.time - b.time);
    const counts = {
      stored: (records || []).length, inPeriod: inPeriod.length, considered: games.length,
      thirdParty: inPeriod.length - eligible.length, unclassified: eligible.length - games.length,
      incomplete: games.filter((game) => game.incomplete).length
    };
    if (!games.length) return { empty: true, mode, counts, speed: speedFilter, periodDays: Number(options.periodDays) || 0 };

    const mine = games.flatMap((game) => game.mine.map((move) => ({ ...move, game })));
    const nGames = games.length;
    const avgLoss = mean(mine.map((move) => move.loss));
    const depths = games.map((game) => game.depth).filter(Boolean);
    const isSerious = (move) => SERIOUS.includes(move.kind);
    const isConcerning = (move) => CONCERNING.includes(move.kind);
    const concerning = mine.filter(isConcerning);
    const serious = mine.filter(isSerious);
    const accuracies = games.filter((game) => game.accuracy !== null);

    // Visão geral
    const outcomes = { win: 0, draw: 0, loss: 0 };
    for (const game of games) if (game.outcome) outcomes[game.outcome] += 1;
    const decided = outcomes.win + outcomes.draw + outcomes.loss;
    const series = accuracies.map((game) => ({ id: game.id, time: game.time, accuracy: game.accuracy, outcome: game.outcome, side: game.playerSide, opponent: game.opponent }));
    const k = Math.min(5, Math.floor(series.length / 2));
    const trend = series.length >= MIN.trendGames && k >= 3
      ? (() => { const recent = mean(series.slice(-k).map((s) => s.accuracy)), previous = mean(series.slice(-2 * k, -k).map((s) => s.accuracy)); return { k, recent, previous, delta: recent - previous }; })()
      : null;
    const labelCounts = new Map();
    for (const move of mine) labelCounts.set(move.label || 'Sem classificação', (labelCounts.get(move.label || 'Sem classificação') || 0) + 1);
    const overview = {
      games: nGames, moves: mine.length, accuracy: accuracies.length ? mean(accuracies.map((game) => game.accuracy)) : null, avgLoss,
      outcomes, scorePct: decided ? (outcomes.win + outcomes.draw / 2) / decided : null, decided,
      seriousPerGame: serious.length / nGames, seriousCount: serious.length,
      goodShare: mine.filter((move) => GOOD.includes(move.kind)).length / mine.length,
      labels: [...labelCounts.entries()].map(([label, count]) => ({ label, count, share: count / mine.length })),
      avgDepth: depths.length ? mean(depths) : null, minDepth: depths.length ? Math.min(...depths) : null
    };

    // Fases
    const phases = PHASES.map((name) => {
      const items = mine.filter((move) => move.phase === name);
      return {
        name, moves: items.length, games: new Set(items.map((move) => move.game.id)).size,
        avgLoss: mean(items.map((move) => move.loss)), accuracy: mean(items.map((move) => move.accuracy)),
        seriousPer100: items.length ? items.filter(isSerious).length / items.length * 100 : null, totalLoss: sum(items.map((move) => move.loss))
      };
    });
    const reliablePhases = phases.filter((phase) => phase.moves >= MIN.phaseMoves && phase.games >= MIN.phaseGames);
    const weakestPhase = [...reliablePhases].sort((a, b) => b.avgLoss - a.avgLoss)[0] || null;
    const bestPhase = [...reliablePhases].sort((a, b) => a.avgLoss - b.avgLoss)[0] || null;
    const phaseIsWeak = weakestPhase && weakestPhase.avgLoss >= avgLoss * 1.25 && weakestPhase.avgLoss - avgLoss >= 0.01;
    const phaseIsStrong = bestPhase && bestPhase.avgLoss <= avgLoss * 0.8 && avgLoss - bestPhase.avgLoss >= 0.01 && bestPhase !== weakestPhase;

    // Temas de erro (só lances com imprecisão, erro ou erro grave)
    const concerningLoss = sum(concerning.map((move) => move.loss));
    const themeGroups = new Map();
    for (const move of concerning) {
      const key = move.theme || 'unknown';
      if (!themeGroups.has(key)) themeGroups.set(key, []);
      themeGroups.get(key).push(move);
    }
    const errorThemes = [...themeGroups.entries()].map(([theme, items]) => {
      const info = themes[theme] || {};
      const loss = sum(items.map((move) => move.loss));
      return {
        theme, label: theme === 'unknown' ? 'Sem causa registrada (análise antiga ou incompleta)' : info.label || theme,
        habit: info.habit || '', question: info.question || '', count: items.length, games: new Set(items.map((move) => move.game.id)).size,
        loss, share: concerningLoss ? loss / concerningLoss : 0, actionable: !NOT_ACTIONABLE.includes(theme),
        examples: items.slice().sort((a, b) => b.loss - a.loss).slice(0, 3).map((move) => ref(move.game, move))
      };
    }).sort((a, b) => b.loss - a.loss);

    // Cores e aberturas (só com jogador identificado)
    let colors = null, openings = null;
    if (mode === 'player') {
      colors = ['w', 'b'].map((side) => {
        const items = games.filter((game) => game.playerSide === side);
        const sideMoves = mine.filter((move) => move.side === side);
        const wins = items.filter((game) => game.outcome === 'win').length, draws = items.filter((game) => game.outcome === 'draw').length;
        const done = items.filter((game) => game.outcome).length;
        return {
          side, games: items.length, wins, draws, losses: done - wins - draws, scorePct: done ? (wins + draws / 2) / done : null,
          accuracy: items.some((game) => game.accuracy !== null) ? mean(items.filter((game) => game.accuracy !== null).map((game) => game.accuracy)) : null,
          avgLoss: mean(sideMoves.map((move) => move.loss)), moves: sideMoves.length
        };
      });
      const byOpening = new Map();
      for (const game of games) {
        if (!game.opening) continue;
        const key = `${game.playerSide}|${game.opening.family}`;
        if (!byOpening.has(key)) byOpening.set(key, []);
        byOpening.get(key).push(game);
      }
      openings = [...byOpening.entries()].map(([, items]) => {
        const wins = items.filter((game) => game.outcome === 'win').length, draws = items.filter((game) => game.outcome === 'draw').length;
        const done = items.filter((game) => game.outcome).length;
        const early = items.flatMap((game) => game.mine.filter((move) => move.index <= 20));
        const names = new Map();
        for (const game of items) names.set(game.opening.name, (names.get(game.opening.name) || 0) + 1);
        const scorePct = done ? (wins + draws / 2) / done : null;
        return {
          side: items[0].playerSide, family: items[0].opening.family, example: [...names.entries()].sort((a, b) => b[1] - a[1])[0][0],
          games: items.length, wins, draws, losses: done - wins - draws, scorePct, earlyLoss: mean(early.map((move) => move.loss)), earlyMoves: early.length,
          accuracy: items.some((game) => game.accuracy !== null) ? mean(items.filter((game) => game.accuracy !== null).map((game) => game.accuracy)) : null,
          weak: items.length >= MIN.openingGames && scorePct !== null && scorePct <= 0.34,
          solid: items.length >= MIN.openingGames && scorePct !== null && scorePct >= 0.67
        };
      }).sort((a, b) => b.games - a.games);
    }

    // Tempo de relógio
    const clockGames = games.filter((game) => game.hasClock);
    let time = null;
    if (clockGames.length >= MIN.clockGames) {
      const timed = mine.filter((move) => move.game.hasClock);
      const trouble = timed.filter((move) => move.inTrouble), normal = timed.filter((move) => !move.inTrouble);
      const fast = normal.filter((move) => move.spent <= 3), slow = normal.filter((move) => move.spent > 3);
      const rate = (items, test) => (items.length ? items.filter(test).length / items.length : null);
      time = {
        games: clockGames.length, moves: timed.length, troubleMoves: trouble.length, troubleShare: trouble.length / timed.length,
        troubleAvgLoss: mean(trouble.map((move) => move.loss)), normalAvgLoss: mean(normal.map((move) => move.loss)),
        troubleSeriousRate: rate(trouble, isSerious), normalSeriousRate: rate(normal, isSerious),
        seriousInTroubleShare: timed.filter(isSerious).length ? timed.filter((move) => isSerious(move) && move.inTrouble).length / timed.filter(isSerious).length : null,
        fastMoves: fast.length, fastErrorRate: rate(fast, isConcerning), slowErrorRate: rate(slow, isConcerning),
        timeLosses: clockGames.filter((game) => game.outcome === 'loss' && /on time|tempo/i.test(game.termination)).length,
        avgSpentOpening: mean(timed.filter((move) => move.phase === 'Abertura').map((move) => move.spent)),
        limitExample: clockGames[0].troubleLimit
      };
    }

    // Vantagens
    let advantage = null;
    if (mode === 'player') {
      const had = games.filter((game) => game.peak !== null && game.peak >= ADVANTAGE && game.outcome);
      const wasted = games.filter((game) => game.wasted);
      advantage = {
        had: had.length, wasted: wasted.length, converted: had.filter((game) => game.outcome === 'win').length,
        conversion: had.length ? had.filter((game) => game.outcome === 'win').length / had.length : null,
        timeLosses: wasted.filter((game) => game.wasted.timeLoss).length,
        comebacks: games.filter((game) => game.comeback).length,
        collapses: wasted.filter((game) => game.wasted.collapse).map((game) => ({ ...ref(game, game.wasted.collapse), timeLoss: game.wasted.timeLoss, outcome: game.outcome }))
          .sort((a, b) => b.loss - a.loss).slice(0, 3),
        collapseLoss: sum(wasted.filter((game) => game.wasted.collapse).map((game) => game.wasted.collapse.loss))
      };
    }

    // Momentos mais caros (no máximo dois por partida)
    const perGame = new Map();
    const costly = serious.slice().sort((a, b) => b.loss - a.loss).filter((move) => {
      const used = perGame.get(move.game.id) || 0;
      if (used >= 2) return false;
      perGame.set(move.game.id, used + 1);
      return true;
    }).slice(0, 5).map((move) => ref(move.game, move));

    // Partidas para rever
    const review = games.filter((game) => game.accuracy !== null && game.mine.length >= 10).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((game) => {
      const key = game.mine.slice().sort((a, b) => b.loss - a.loss)[0];
      return {
        recordId: game.id, title: game.title, time: game.time, outcome: game.outcome, side: game.playerSide, accuracy: game.accuracy,
        wasted: Boolean(game.wasted), key: key ? ref(game, key) : null
      };
    });

    // Prioridades de treino: cada uma com evidência medida e uma sugestão separada.
    const priorities = [];
    const perGameLoss = (loss) => loss / nGames;
    for (const group of errorThemes.filter((item) => item.count >= MIN.themeMoves && item.theme !== 'unknown' && item.theme !== 'lost-position').slice(0, 2)) {
      const positional = group.theme === 'positional';
      if (positional && group.count < 5) continue;
      priorities.push({
        id: `theme:${group.theme}`, kind: 'tema', title: positional ? 'Muitos erros sem causa tática demonstrada' : `Padrão recorrente: ${group.label}`,
        evidence: [
          `${plural(group.count, 'lance', 'lances')} em ${plural(group.games, 'partida', 'partidas')} com imprecisão, erro ou erro grave tiveram este tema.`,
          `Respondem por ${pct(group.share)} da chance esperada perdida nos seus erros (≈ ${one(perGameLoss(group.loss) * 100)} pontos percentuais por partida).`,
          ...(positional ? ['As variantes do motor não demonstram uma causa tática nesses lances; trate como hipótese de estudo, não como diagnóstico.'] : [])
        ],
        action: group.habit || 'Revise os lances de exemplo e procure o que o motor preferia.', question: group.question,
        examples: group.examples, weight: perGameLoss(group.loss) * (positional ? 0.5 : 1), confidence: confidenceFor(group.count), sample: `${group.count} lances`
      });
    }
    if (phaseIsWeak) {
      priorities.push({
        id: `phase:${weakestPhase.name}`, kind: 'fase', title: `Fase mais fraca: ${weakestPhase.name.toLowerCase()}`,
        evidence: [
          `Perda média de ${one(weakestPhase.avgLoss * 100)}% por lance na fase, contra ${one(avgLoss * 100)}% no conjunto (${plural(weakestPhase.moves, 'lance', 'lances')} em ${plural(weakestPhase.games, 'partida', 'partidas')}).`,
          `${one(weakestPhase.seriousPer100)} erros ou erros graves a cada 100 lances nesta fase.`
        ],
        action: PHASE_ACTION[weakestPhase.name], examples: mine.filter((move) => move.phase === weakestPhase.name && isSerious(move)).sort((a, b) => b.loss - a.loss).slice(0, 2).map((move) => ref(move.game, move)),
        weight: (weakestPhase.avgLoss - avgLoss) * weakestPhase.moves / nGames, confidence: confidenceFor(Math.floor(weakestPhase.moves / 5)), sample: `${weakestPhase.moves} lances`
      });
    }
    if (time && time.troubleMoves >= MIN.troubleMoves && time.troubleAvgLoss >= time.normalAvgLoss * 1.5 && time.troubleAvgLoss - time.normalAvgLoss >= 0.015) {
      priorities.push({
        id: 'time:trouble', kind: 'tempo', title: 'Erros com pouco tempo no relógio',
        evidence: [
          `${pct(time.troubleShare)} dos seus lances foram jogados com pouco tempo (${Math.round(time.limitExample)} s ou menos, ou 12% do tempo base).`,
          `Nesses lances, ${pct(time.troubleSeriousRate)} foram erros ou erros graves, contra ${pct(time.normalSeriousRate)} nos demais.`,
          ...(time.timeLosses ? [`${plural(time.timeLosses, 'derrota por tempo', 'derrotas por tempo')} entre as partidas com relógio.`] : [])
        ],
        action: 'Reserve tempo para as posições críticas e jogue rápido o que é óbvio. Com o relógio curto, prefira lances simples e seguros a complicações.',
        examples: [], weight: (time.troubleAvgLoss - time.normalAvgLoss) * time.troubleMoves / time.games, confidence: confidenceFor(Math.floor(time.troubleMoves / 3)), sample: `${time.troubleMoves} lances`
      });
    }
    if (advantage && advantage.wasted >= MIN.wastedGames) {
      priorities.push({
        id: 'advantage:wasted', kind: 'conversão', title: 'Vantagens que não viraram vitória',
        evidence: [
          `Você chegou a ter vantagem clara (chance esperada acima de 80%) em ${plural(advantage.had, 'partida', 'partidas')} e ganhou ${advantage.converted} (${pct(advantage.conversion)}).`,
          `Nas ${advantage.wasted} que escaparam${advantage.timeLosses ? `, ${plural(advantage.timeLosses, 'foi derrota por tempo', 'foram derrotas por tempo')}` : ''}, o lance que mais custou aparece nos exemplos.`
        ],
        action: 'Quando estiver melhor, simplifique: troque peças, evite complicações e confira as ameaças do adversário antes de cada ataque.',
        examples: advantage.collapses, weight: advantage.collapseLoss / nGames, confidence: confidenceFor(advantage.wasted * 2), sample: `${advantage.wasted} partidas`
      });
    }
    if (openings) {
      const weak = openings.filter((item) => item.weak).sort((a, b) => b.games - a.games)[0];
      if (weak) {
        priorities.push({
          id: `opening:${weak.side}:${weak.family}`, kind: 'abertura', title: `Abertura com mau resultado: ${weak.family} (${weak.side === 'w' ? 'brancas' : 'pretas'})`,
          evidence: [
            `${plural(weak.games, 'partida', 'partidas')}: ${weak.wins} vitória${weak.wins === 1 ? '' : 's'}, ${weak.draws} empate${weak.draws === 1 ? '' : 's'}, ${weak.losses} derrota${weak.losses === 1 ? '' : 's'} (${pct(weak.scorePct)} dos pontos).`,
            ...(weak.accuracy !== null ? [`Precisão estimada média nessas partidas: ${one(weak.accuracy)}%.`] : [])
          ],
          action: 'Reveja essas partidas e escolha uma linha-padrão contra os desvios que mais aparecem. Se a abertura não rende, considere trocá-la por uma mais simples.',
          examples: [], weight: Math.max(0, 0.5 - weak.scorePct) * weak.games / nGames * 0.25 + Math.max(0, (weak.earlyLoss || 0) - avgLoss) * weak.earlyMoves / nGames,
          confidence: confidenceFor(weak.games * 2), sample: `${weak.games} partidas`
        });
      }
    }
    if (colors && colors.every((item) => item.games >= MIN.colorGames && item.accuracy !== null)) {
      const [weak, strong] = colors[0].accuracy < colors[1].accuracy ? [colors[0], colors[1]] : [colors[1], colors[0]];
      if (strong.accuracy - weak.accuracy >= 5) {
        const name = weak.side === 'w' ? 'brancas' : 'pretas';
        priorities.push({
          id: `color:${weak.side}`, kind: 'cor', title: `Mais erros com as ${name}`,
          evidence: [`Precisão estimada de ${one(weak.accuracy)}% com as ${name} (${plural(weak.games, 'partida', 'partidas')}) contra ${one(strong.accuracy)}% com as ${weak.side === 'w' ? 'pretas' : 'brancas'} (${plural(strong.games, 'partida', 'partidas')}).`],
          action: `Revise as partidas com as ${name} e procure se os erros vêm da abertura ou do meio-jogo.`,
          examples: [], weight: Math.max(0, weak.avgLoss - strong.avgLoss) * weak.moves / nGames, confidence: confidenceFor(Math.min(weak.games, strong.games)), sample: `${weak.games + strong.games} partidas`
        });
      }
    }
    priorities.sort((a, b) => b.weight - a.weight);

    // Pontos fortes
    const strengths = [];
    if (phaseIsStrong) strengths.push({ id: 'phase', title: `${bestPhase.name} é a sua fase mais sólida`, evidence: `Perda média de ${one(bestPhase.avgLoss * 100)}% por lance, contra ${one(avgLoss * 100)}% no conjunto (${bestPhase.moves} lances).` });
    if (advantage && advantage.had >= 3 && advantage.conversion >= 0.75) strengths.push({ id: 'conversion', title: 'Você converte bem as vantagens', evidence: `Ganhou ${advantage.converted} de ${advantage.had} partidas em que chegou a ter vantagem clara (${pct(advantage.conversion)}).` });
    if (advantage && advantage.comebacks >= 1) strengths.push({ id: 'comeback', title: 'Você sabe reagir em posições difíceis', evidence: `${plural(advantage.comebacks, 'vitória', 'vitórias')} depois de ter ficado com menos de 25% de chance esperada.` });
    if (openings) {
      const solid = openings.filter((item) => item.solid).sort((a, b) => b.games - a.games)[0];
      if (solid) strengths.push({ id: 'opening', title: `Boa abertura: ${solid.family} (${solid.side === 'w' ? 'brancas' : 'pretas'})`, evidence: `${plural(solid.games, 'partida', 'partidas')}, ${pct(solid.scorePct)} dos pontos.` });
    }
    const standout = mine.filter((move) => ['brilliant', 'great'].includes(move.kind)).sort((a, b) => (a.kind === 'brilliant' ? -1 : 1) - (b.kind === 'brilliant' ? -1 : 1))[0];
    if (standout) {
      const total = mine.filter((move) => ['brilliant', 'great'].includes(move.kind)).length;
      strengths.push({ id: 'standout', title: `${plural(total, 'lance', 'lances')} brilhante${total === 1 ? '' : 's'} ou ótimo${total === 1 ? '' : 's'}`, evidence: 'Lances difíceis de achar que o motor destaca.', example: ref(standout.game, standout) });
    }

    const notes = [];
    if (counts.thirdParty) notes.push(`${plural(counts.thirdParty, 'partida', 'partidas')} sem o perfil configurado foram deixadas de fora.`);
    if (counts.incomplete) notes.push(`${plural(counts.incomplete, 'análise está', 'análises estão')} incompleta${counts.incomplete === 1 ? '' : 's'}; os números usam só os lances classificados.`);
    if (overview.minDepth && overview.minDepth < 12) notes.push(`Há análises com profundidade ${overview.minDepth}; análises rasas oscilam mais e podem mudar os rótulos.`);
    if (nGames < 5) notes.push('Poucas partidas: padrões só aparecem de forma confiável a partir de umas 10 partidas analisadas.');

    return {
      empty: false, mode, counts, speed: speedFilter, periodDays: Number(options.periodDays) || 0,
      overview, trend, series, phases, weakestPhase: phaseIsWeak ? weakestPhase : null, errorThemes, colors, openings, time, advantage,
      costly, review, priorities: priorities.slice(0, 4), strengths: strengths.slice(0, 4), notes,
      clock: { games: clockGames.length, total: nGames }
    };
  }

  return { compute, moveAccuracy, gameAccuracy, parseClocks, parseTimeControl, openingOf, MIN };
}));
