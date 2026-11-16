/*
 * MyChess · Treinador (análise didática de lances)
 *
 * Módulo puro (sem DOM) que transforma duas análises do Stockfish — a da posição ANTES do lance e a da
 * posição DEPOIS dele — numa "lição" estruturada. Ele não escreve texto livre a partir de palpites:
 * toda afirmação pertence a uma de três categorias, mantidas separadas na saída.
 *
 *   facts        Fatos calculados. Vêm (a) das regras do xadrez, aplicando lances legais à posição
 *                ("rules"), (b) de uma variante do motor reproduzida lance a lance com validação de
 *                legalidade ("line"), ou (c) das próprias avaliações do motor ("engine").
 *   heuristics   Indícios posicionais (desenvolvimento, centro, roque...). São medidas simples e
 *                verificáveis, mas NÃO demonstram por que o motor prefere outro lance.
 *   uncertainty  O que as linhas calculadas não permitem afirmar.
 *
 * Nada aqui infere a intenção de quem jogou. Se nenhum fato explica a perda, a lição diz isso.
 *
 * Uso: const coach = MyChessCoach.create(regras, { expected });
 *      const lesson = coach.buildLesson({ before, after, played, quality });
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MyChessCoach = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION = 1;
  const VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  const PIECE_PT = { P: ['peão', 'o'], N: ['cavalo', 'o'], B: ['bispo', 'o'], R: ['torre', 'a'], Q: ['dama', 'a'], K: ['rei', 'o'] };
  const CENTER = [27, 28, 35, 36]; // d5, e5, d4, e4
  const SOURCE_LABEL = { rules: 'Regras do xadrez', line: 'Variante do motor', engine: 'Avaliação do motor' };
  const GOOD_KINDS = ['best', 'excellent', 'good', 'great', 'brilliant'];

  const THEMES = {
    'mate-allowed': {
      label: 'Mate permitido',
      question: 'Quais xeques o adversário tem depois do seu lance? Algum deles termina em mate?',
      habit: 'Antes de confirmar, liste os xeques do adversário e confira se o seu rei tem casas de fuga ou defensores.'
    },
    'mate-missed': {
      label: 'Mate não encontrado',
      question: 'Quais xeques você tem nesta posição? Siga cada um até a resposta forçada do adversário.',
      habit: 'Examine todos os xeques candidatos, inclusive os que entregam material, e siga a resposta forçada até o fim.'
    },
    'piece-hanging': {
      label: 'Peça deixada em prise',
      question: 'Que peças adversárias atacam a casa de chegada? Depois do lance, quantos atacantes e defensores haverá ali?',
      habit: 'Depois de escolher o lance, conte atacantes e defensores da casa de chegada e de qualquer peça que o lance deixou de proteger.'
    },
    'threat-ignored': {
      label: 'Ameaça do adversário ignorada',
      question: 'O que o adversário ameaça capturar nesta posição? O seu lance trata essa ameaça?',
      habit: 'A cada lance, pergunte primeiro “o que o adversário quer fazer?” e confirme que o seu lance responde a isso.'
    },
    'tactic-allowed': {
      label: 'Tática permitida ao adversário',
      question: 'Quais capturas e xeques o adversário ganha depois do seu lance? Calcule a resposta mais forçada até a última recaptura.',
      habit: 'Depois do lance candidato, liste capturas e xeques do adversário e siga a sequência até a última recaptura.'
    },
    'material-missed': {
      label: 'Material não aproveitado',
      question: 'Quais capturas e ameaças você tem aqui? Alguma delas ganha material depois das recapturas?',
      habit: 'Inclua as capturas entre os lances candidatos e calcule até a última recaptura, não só o primeiro lance.'
    },
    'fork-missed': {
      label: 'Garfo não aproveitado',
      question: 'Existe um lance que ataque duas peças ao mesmo tempo? Confira se o atacante pode capturá-las legalmente.',
      habit: 'Procure casas de onde uma peça ataca dois alvos e verifique se o adversário consegue defender os dois.'
    },
    'lost-position': {
      label: 'Posição já perdida',
      question: 'Esta posição já estava perdida antes do lance? Qual foi o lance anterior que a deixou assim?',
      habit: 'Quando a posição já está perdida, a lição está um lance antes: volte e procure onde a vantagem passou para o adversário.'
    },
    positional: {
      label: 'Preferência posicional do motor',
      question: 'Compare seu lance com as alternativas: qual peça ainda está mal colocada e que casas importantes cada lance controla?',
      habit: 'Quando não há tática, compare planos: desenvolvimento, controle do centro, segurança do rei e atividade das peças.'
    },
    sound: {
      label: 'Lance sólido',
      question: 'Qual ideia torna este lance útil aqui, e que resposta forte do adversário você calculou?',
      habit: 'Continue conferindo as respostas forçadas do adversário: o motor aprovou este lance, mas o hábito é o que se repete.'
    }
  };

  function create(rules, options = {}) {
    const { positionFromFen, currentFen, applyMove, legalMoves, allLegalMoves, inCheck, attacked, moveToSan, parseUciMove, color, squareName } = rules;
    const opponent = (side) => (side === 'w' ? 'b' : 'w');
    const sideName = (side) => (side === 'w' ? 'as brancas' : 'as pretas');
    const kindOf = (piece) => piece.toUpperCase();
    const valueOf = (piece) => VALUE[kindOf(piece)] || 0;
    const clonePosition = (pos) => ({ ...pos, board: pos.board.slice() });
    const fmt = (number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(number);

    function pieceText(piece, square) {
      const [name, gender] = PIECE_PT[kindOf(piece)];
      return `${gender === 'a' ? 'a' : 'o'} ${name} ${color(piece) === 'w' ? 'branc' : 'pret'}${gender === 'a' ? 'a' : 'o'} em ${squareName(square)}`;
    }

    function pieceNoun(piece) {
      const [name, gender] = PIECE_PT[kindOf(piece)];
      return `${gender === 'a' ? 'a' : 'o'} ${name}`;
    }

    const threatened = (piece) => `ameaçad${PIECE_PT[kindOf(piece)][1] === 'a' ? 'a' : 'o'}`;

    function pieceOf(piece) {
      const [name, gender] = PIECE_PT[kindOf(piece)];
      return `${gender === 'a' ? 'da' : 'do'} ${name}`;
    }

    // Pontos de material (peão 1, peça menor 3, torre 5, dama 9), com o equivalente quando é exato.
    function materialText(points) {
      const n = Math.abs(Math.round(points));
      const names = { 1: 'um peão', 2: 'dois peões', 3: 'uma peça menor', 5: 'uma torre', 9: 'uma dama' };
      return names[n] ? `${names[n]} (${n} ponto${n === 1 ? '' : 's'})` : `${n} pontos de material`;
    }

    // Pontuação do motor na ótica de `side` (centipeões; mates viram ±10000 menos a distância).
    function centipawnsFor(score, turn, side) {
      if (!score) return null;
      const factor = turn === 'w' ? 1 : -1;
      let whiteValue;
      if (score.type === 'mate') {
        const mate = score.value * factor, distance = Math.min(999, Math.abs(mate));
        whiteValue = score.value === 0 ? (turn === 'w' ? -10000 : 10000) : mate > 0 ? 10000 - distance * 10 : -10000 + distance * 10;
      } else whiteValue = score.value * factor;
      return side === 'w' ? whiteValue : -whiteValue;
    }

    function evalText(score, turn, side) {
      const cp = centipawnsFor(score, turn, side);
      if (cp === null) return 'indisponível';
      if (score.type === 'mate') {
        const distance = Math.abs(score.value);
        return cp > 0 ? `mate em ${distance} a favor d${sideName(side)}` : `mate em ${distance} contra ${sideName(side)}`;
      }
      const pawns = cp / 100;
      return `${pawns > 0 ? '+' : pawns < 0 ? '−' : ''}${Math.abs(pawns).toFixed(1)}`;
    }

    const expected = options.expected || ((score, turn, side) => {
      const cp = centipawnsFor(score, turn, side);
      return cp === null ? null : 1 / (1 + Math.exp(-Math.max(-9000, Math.min(9000, cp)) / 400));
    });

    const sentence = (text) => (/^(a|o) /.test(text) ? text.charAt(0).toUpperCase() + text.slice(1) : text);
    const uciOf = (played) => `${squareName(played.from)}${squareName(played.to)}${played.promotion ? String(played.promotion).toLowerCase() : ''}`;
    const sameBoardState = (a, b) => a.trim().split(/\s+/).slice(0, 4).join(' ') === b.trim().split(/\s+/).slice(0, 4).join(' ');
    const tokensOf = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);

    // Reproduz uma variante lance a lance. Para na primeira jogada ilegal e marca `broken`.
    function replay(fen, tokens, maxPlies = 40) {
      let pos;
      try { pos = positionFromFen(fen); } catch { return null; }
      const start = clonePosition(pos), steps = [];
      let broken = false;
      for (const token of tokens.slice(0, maxPlies)) {
        const move = parseUciMove(pos, token);
        if (!move) { broken = true; break; }
        const side = pos.turn, piece = pos.board[move.from];
        const captured = move.enPassant ? pos.board[move.to + (side === 'w' ? 8 : -8)] : pos.board[move.to];
        const next = applyMove(pos, move);
        const check = inCheck(next, next.turn);
        const hasReply = allLegalMoves(next).length > 0;
        steps.push({
          token, move, side, piece, captured, san: moveToSan(pos, move), number: pos.fullmove,
          check, mate: check && !hasReply, stalemate: !check && !hasReply, before: pos, after: next
        });
        pos = next;
      }
      return { start, steps, end: pos, broken, plies: steps.length };
    }

    function formatLine(rep, maxPlies = 8) {
      const parts = [];
      rep.steps.slice(0, maxPlies).forEach((step, index) => {
        if (step.side === 'w') parts.push(`${step.number}. ${step.san}`);
        else parts.push(index === 0 ? `${step.number}… ${step.san}` : step.san);
      });
      return parts.join(' ') + (rep.steps.length > maxPlies ? ' …' : '');
    }

    // Melhor ganho líquido (em pontos) de quem tem a vez ao capturar em `square`, com recapturas
    // legais (cravadas respeitadas). Pode desistir: nunca é negativo. Só considera esta casa.
    function exchange(pos, square, limit = 10) {
      const victim = pos.board[square];
      if (victim === '.' || kindOf(victim) === 'K' || limit <= 0) return { gain: 0, first: null };
      let best = { gain: 0, first: null };
      for (let from = 0; from < 64; from += 1) {
        const piece = pos.board[from];
        if (piece === '.' || color(piece) !== pos.turn) continue;
        for (const move of legalMoves(pos, from)) {
          if (move.to !== square) continue;
          const value = valueOf(victim) + (move.promotion ? VALUE[kindOf(move.promotion)] - 1 : 0);
          const net = value - exchange(applyMove(pos, move), square, limit - 1).gain;
          if (net > best.gain) best = { gain: net, first: move };
        }
      }
      return best;
    }

    // Peças de `side` (exceto o rei) que quem tem a vez (o adversário de `side`) ganharia capturando.
    function hangingPieces(pos, side) {
      const found = [];
      for (let square = 0; square < 64; square += 1) {
        const piece = pos.board[square];
        if (piece === '.' || color(piece) !== side || kindOf(piece) === 'K') continue;
        const result = exchange(pos, square);
        if (result.gain >= 1 && result.first) found.push({ square, piece, gain: result.gain, first: result.first, san: moveToSan(pos, result.first) });
      }
      return found.sort((a, b) => b.gain - a.gain);
    }

    // Maior ganho imediato disponível a quem tem a vez em `pos` (captura pendente no fim de uma variante).
    function pendingGain(pos) {
      let best = 0;
      for (let square = 0; square < 64; square += 1) {
        const piece = pos.board[square];
        if (piece === '.' || color(piece) === pos.turn) continue;
        best = Math.max(best, exchange(pos, square).gain);
      }
      return best;
    }

    // Saldo material da variante na ótica de `side`, só com capturas e promoções demonstradas.
    function lineMaterial(rep, side) {
      let delta = 0, promotions = 0;
      const captures = [];
      for (const step of rep.steps) {
        if (step.captured !== '.') {
          captures.push(step);
          delta += step.side === side ? valueOf(step.captured) : -valueOf(step.captured);
        }
        if (step.move.promotion) {
          promotions += 1;
          const gain = VALUE[kindOf(step.move.promotion)] - 1;
          delta += step.side === side ? gain : -gain;
        }
      }
      const terminal = allLegalMoves(rep.end).length === 0;
      const pending = terminal ? 0 : pendingGain(rep.end);
      return { delta, captures, promotions, pending, settled: terminal || pending < 1, plies: rep.plies };
    }

    function captureList(info, limit = 4) {
      return info.captures.slice(0, limit).map((step) => step.san).join(', ') + (info.captures.length > limit ? '…' : '');
    }

    // Garfo demonstrado: o primeiro lance da variante pousa uma peça que, em lances legais, captura dois
    // ou mais alvos valiosos ou indefesos (ou um alvo com xeque), e a variante confirma ganho líquido.
    function verifiedFork(rep, side) {
      const first = rep.steps[0];
      if (!first || first.side !== side || kindOf(first.piece) === 'K') return null;
      const after = first.after, landing = first.move.to, attackerValue = valueOf(first.piece);
      const targets = legalMoves(after, landing, side).filter((move) => {
        const target = after.board[move.to];
        return target !== '.' && color(target) !== side && kindOf(target) !== 'K' &&
          (valueOf(target) > attackerValue || !attacked(after, move.to, opponent(side)));
      }).map((move) => move.to);
      const unique = [...new Set(targets)];
      const giveCheck = first.check;
      if (unique.length < 2 && !(unique.length === 1 && giveCheck)) return null;
      const material = lineMaterial(rep, side);
      const captured = rep.steps.slice(1, 4).find((step) => step.side === side && unique.includes(step.move.to) && step.captured !== '.');
      if (!captured || !material.settled || material.delta < 1) return null;
      return { piece: first.piece, landing, targets: unique, capture: captured.san, material, check: giveCheck };
    }

    // ---- Indícios posicionais (heurísticas) -------------------------------------------------------

    function centerControl(pos, side) {
      return CENTER.filter((square) => attacked(pos, square, side)).length;
    }

    function undevelopedMinors(pos, side) {
      const home = side === 'w' ? [57, 58, 61, 62] : [1, 2, 5, 6];
      return home.filter((square) => ['N', 'B'].includes(kindOf(pos.board[square])) && pos.board[square] !== '.' && color(pos.board[square]) === side).length;
    }

    function pawnFileOpen(pos, file) {
      for (let row = 0; row < 8; row += 1) if (kindOf(pos.board[row * 8 + file]) === 'P') return false;
      return true;
    }

    function pawnStructure(pos, side) {
      const mine = [], theirs = [];
      for (let square = 0; square < 64; square += 1) {
        const piece = pos.board[square];
        if (piece === '.' || kindOf(piece) !== 'P') continue;
        (color(piece) === side ? mine : theirs).push(square);
      }
      const files = new Array(8).fill(0);
      mine.forEach((square) => { files[square % 8] += 1; });
      const isolated = mine.filter((square) => !(files[square % 8 - 1] > 0) && !(files[square % 8 + 1] > 0));
      const passed = mine.filter((square) => {
        const file = square % 8, row = Math.floor(square / 8);
        return !theirs.some((enemy) => Math.abs(enemy % 8 - file) <= 1 && (side === 'w' ? Math.floor(enemy / 8) < row : Math.floor(enemy / 8) > row));
      });
      return { doubled: files.filter((count) => count >= 2).length, isolated, passed };
    }

    // Peões do próprio lado diretamente à frente do rei (até duas casas) nas três colunas vizinhas.
    function kingShield(pos, side) {
      const king = pos.board.findIndex((piece) => piece !== '.' && kindOf(piece) === 'K' && color(piece) === side);
      if (king < 0) return 0;
      const file = king % 8, row = Math.floor(king / 8), direction = side === 'w' ? -1 : 1;
      let shield = 0;
      for (let delta = -1; delta <= 1; delta += 1) {
        const target = file + delta;
        if (target < 0 || target > 7) continue;
        for (let step = 1; step <= 2; step += 1) {
          const r = row + direction * step;
          if (r < 0 || r > 7) break;
          const piece = pos.board[r * 8 + target];
          if (piece !== '.' && kindOf(piece) === 'P' && color(piece) === side) { shield += 1; break; }
        }
      }
      return shield;
    }

    function positionalIdeas(pos, move) {
      const side = pos.turn, piece = pos.board[move.from], kind = kindOf(piece), next = applyMove(pos, move);
      const ideas = [];
      if (move.castle) ideas.push({ id: 'castle', polarity: 'plus', text: 'faz o roque: leva o rei para um canto mais protegido e aproxima a torre do jogo' });
      if (['N', 'B'].includes(kind) && undevelopedMinors(next, side) < undevelopedMinors(pos, side)) {
        ideas.push({ id: 'develop', polarity: 'plus', text: `desenvolve ${pieceNoun(piece)} (peças menores ainda na casa inicial: ${undevelopedMinors(pos, side)} → ${undevelopedMinors(next, side)})` });
      }
      const centerBefore = centerControl(pos, side), centerAfter = centerControl(next, side);
      if (kind === 'P' && CENTER.includes(move.to)) ideas.push({ id: 'center-pawn', polarity: 'plus', text: `ocupa o centro com um peão em ${squareName(move.to)}` });
      else if (centerAfter > centerBefore) ideas.push({ id: 'center-control', polarity: 'plus', text: `aumenta o controle do centro (casas centrais atacadas: ${centerBefore} → ${centerAfter} de 4)` });
      if (!['P', 'K'].includes(kind) && !move.castle) {
        const before = legalMoves(pos, move.from).length, after = legalMoves(next, move.to, side).length;
        if (after >= before + 3) ideas.push({ id: 'mobility', polarity: 'plus', text: `amplia a mobilidade ${pieceOf(piece)} (lances legais disponíveis a ela: ${before} → ${after})` });
      }
      if (kind === 'R' && move.to % 8 !== move.from % 8 && pawnFileOpen(next, move.to % 8)) {
        ideas.push({ id: 'open-file', polarity: 'plus', text: `coloca a torre numa coluna sem peões (${'abcdefgh'[move.to % 8]})` });
      }
      if (kind === 'K' && !move.castle && pos.castling.split('').some((right) => (side === 'w' ? right === right.toUpperCase() : right === right.toLowerCase()))) {
        ideas.push({ id: 'king-walk', polarity: 'minus', text: 'move o rei e abre mão do direito de rocar' });
      }
      // Estrutura de peões do lado que joga (antes → depois do lance).
      const structureBefore = pawnStructure(pos, side), structureAfter = pawnStructure(next, side);
      if (structureAfter.doubled > structureBefore.doubled) ideas.push({ id: 'doubled-pawns', polarity: 'minus', text: `cria peões dobrados (colunas com dois ou mais peões: ${structureBefore.doubled} → ${structureAfter.doubled})` });
      if (structureAfter.isolated.length > structureBefore.isolated.length) ideas.push({ id: 'isolated-pawn', polarity: 'minus', text: `aumenta o número de peões isolados, sem peões amigos nas colunas vizinhas (${structureBefore.isolated.length} → ${structureAfter.isolated.length})` });
      const newPassed = structureAfter.passed.filter((square) => !structureBefore.passed.includes(square) && square !== move.from);
      if (structureAfter.passed.length > structureBefore.passed.length && newPassed.length) ideas.push({ id: 'passed-pawn', polarity: 'plus', text: `cria um peão passado em ${squareName(newPassed[0])} (sem peões adversários à frente nas colunas vizinhas)` });
      // Escudo de peões do rei.
      const shieldBefore = kingShield(pos, side), shieldAfter = kingShield(next, side);
      if (shieldBefore >= 2 && shieldAfter < shieldBefore) ideas.push({ id: 'king-shield', polarity: 'minus', text: `enfraquece a proteção do rei: peões à frente dele ${shieldBefore} → ${shieldAfter}` });
      return ideas;
    }

    // ---- Lição ------------------------------------------------------------------------------------

    function emptyLesson(input, reason) {
      const { played, quality } = input;
      return {
        version: VERSION, mover: played?.side, moveNumber: played?.moveNumber, san: played?.san,
        kind: quality?.kind, label: quality?.label, lossPoints: quality?.loss == null ? null : Math.round(quality.loss * 1000) / 10,
        headline: quality?.label ? `${quality.label}. ${reason}` : reason,
        theme: 'positional', themeLabel: THEMES.positional.label, explanation: 'unconfirmed',
        facts: [], heuristics: [], uncertainty: [reason], alternative: null, equivalent: [], positives: [],
        evaluation: null, lines: { played: '', best: '' },
        questions: questionsFor('positional', played?.san), takeaway: THEMES.positional.habit, valid: false
      };
    }

    function questionsFor(theme, san, positive = false) {
      const info = THEMES[positive ? 'sound' : theme] || THEMES.positional;
      return {
        decision: `Lembre o que você pretendia e então pergunte: ${info.question}`,
        review: `Volte uma jogada para a posição antes de ${san}. Lembre o que pretendia e então pergunte: ${info.question}`
      };
    }

    function buildLesson(input) {
      const { before, after, played, quality } = input;
      if (!before?.fen || !after?.fen || !played || !quality) return emptyLesson(input, 'Faltam dados do motor para explicar este lance.');
      let root;
      try { root = positionFromFen(before.fen); } catch { return emptyLesson(input, 'A posição de origem do lance não pôde ser lida.'); }
      const side = played.side, other = opponent(side), playedUci = uciOf(played);
      const move = parseUciMove(root, playedUci);
      if (!move || root.turn !== side) return emptyLesson(input, 'O lance não é legal na posição analisada; nenhuma explicação foi gerada.');
      const afterPos = applyMove(root, move);
      if (!sameBoardState(currentFen(afterPos), after.fen)) return emptyLesson(input, 'A posição analisada depois do lance não confere com o lance jogado; nenhuma explicação foi gerada.');

      const good = GOOD_KINDS.includes(quality.kind);
      const lossPoints = quality.loss == null ? null : Math.round(quality.loss * 1000) / 10;
      const facts = [], heuristics = [], uncertainty = [], positives = [];
      const addFact = (fact) => facts.push(fact);

      const bestToken = before.bestMove && before.bestMove !== '(none)' && before.bestMove !== '0000' ? before.bestMove : '';
      const bestMove = bestToken ? parseUciMove(root, bestToken) : null;
      const bestSan = bestMove ? moveToSan(root, bestMove) : (before.best && before.best !== 'Nenhum lance legal' ? before.best : '');
      const sameAsBest = Boolean(bestMove) && bestToken === playedUci;
      const comparable = Number.isFinite(before.depth) && before.depth === after.depth;

      const playedRep = replay(before.fen, [playedUci, ...tokensOf(after.pvUci)]);
      const bestRep = bestToken ? replay(before.fen, tokensOf(before.pvUci).length ? tokensOf(before.pvUci) : [bestToken]) : null;
      if (playedRep?.broken) uncertainty.push('Parte da variante do motor após o lance não pôde ser reproduzida com lances legais; usei apenas o trecho validado.');
      const playedMaterial = playedRep ? lineMaterial(playedRep, side) : null;
      const bestMaterial = bestRep && !bestRep.broken ? lineMaterial(bestRep, side) : null;

      // 1) Mates ----------------------------------------------------------------------------------
      const afterCp = centipawnsFor(after.score, after.turn, side);
      const beforeCp = centipawnsFor(before.score, before.turn, side);
      const last = playedRep?.steps[playedRep.steps.length - 1];
      const lostBefore = beforeCp !== null && beforeCp <= -9000 && before.score.type === 'mate';
      if (last?.mate && last.side === other && (good || lostBefore)) {
        addFact({ id: 'already-lost', source: 'line', weight: 40, positive: false, neutral: true,
          text: `Mesmo com o melhor lance, o motor via mate forçado contra ${sideName(side)} nesta posição. A variante após ${played.san} termina em xeque-mate: ${formatLine(playedRep)}. A posição já estava perdida; o mate não é consequência só deste lance.`,
          short: 'não é a causa do mate: a posição já estava perdida para mate forçado' });
      } else if (last?.mate && last.side === other) {
        addFact({ id: 'mate-allowed', source: 'line', weight: 100, positive: false,
          text: `A variante do motor após ${played.san} termina em xeque-mate contra ${sideName(side)}: ${formatLine(playedRep)}.`,
          short: `permite um mate demonstrado pela variante (${formatLine(playedRep, 6)})` });
      } else if (!good && !lostBefore && afterCp !== null && afterCp <= -9000 && after.score.type === 'mate' && after.score.value !== 0) {
        addFact({ id: 'mate-allowed', source: 'engine', weight: 90, positive: false,
          text: `Depois de ${played.san}, o motor encontra mate forçado em ${Math.abs(after.score.value)} contra ${sideName(side)}. A variante exibida é curta demais para reproduzir todo o mate.`,
          short: `permite um mate forçado em ${Math.abs(after.score.value)}, segundo o motor` });
      }
      const bestLast = bestRep?.steps[bestRep.steps.length - 1];
      if (bestLast?.mate && bestLast.side === side) {
        if (sameAsBest) {
          addFact({ id: 'found-mate', source: 'line', weight: 100, positive: true,
            text: `Este lance inicia um mate forçado demonstrado pela variante: ${formatLine(bestRep)}.`, short: 'inicia um mate forçado demonstrado pela variante' });
        } else {
          addFact({ id: 'mate-missed', source: 'line', weight: 95, positive: false,
            text: `Havia mate forçado com ${bestSan}: ${formatLine(bestRep)}.`, short: `perde o mate forçado que havia com ${bestSan}` });
        }
      } else if (beforeCp !== null && beforeCp >= 9000 && before.score.type === 'mate' && !sameAsBest && afterCp !== null && afterCp < 9000) {
        addFact({ id: 'mate-missed', source: 'engine', weight: 85, positive: false,
          text: `Antes do lance, o motor via mate forçado em ${Math.abs(before.score.value)} para ${sideName(side)}; o lance jogado desfez essa sequência.`,
          short: `desfaz o mate forçado que o motor via em ${Math.abs(before.score.value)}` });
      } else if (sameAsBest && beforeCp !== null && beforeCp >= 9000 && before.score.type === 'mate') {
        addFact({ id: 'found-mate', source: 'engine', weight: 80, positive: true,
          text: `Este lance mantém o mate forçado que o motor via em ${Math.abs(before.score.value)} lance(s).`, short: 'mantém o mate forçado' });
      }

      // 2) Peças capturáveis (casa a casa, com recapturas legais) -----------------------------------
      const hangingAfter = hangingPieces(afterPos, side);
      let threatsBefore = [];
      if (!inCheck(root, side)) {
        const threatPos = clonePosition(root); threatPos.turn = other; threatPos.ep = -1;
        threatsBefore = hangingPieces(threatPos, side);
      }
      const replyToken = tokensOf(after.pvUci)[0];
      const replyStep = playedRep && playedRep.steps.length > 1 ? playedRep.steps[1] : null;
      const capturedByMove = move.enPassant ? root.board[move.to + (side === 'w' ? 8 : -8)] : root.board[move.to];
      const capturedValue = capturedByMove !== '.' ? valueOf(capturedByMove) : 0;
      const movingPiece = root.board[move.from];
      const movedHanging = hangingAfter.find((item) => item.square === move.to);
      if (movedHanging && movedHanging.gain - capturedValue >= 1 && good) {
        const net = movedHanging.gain - capturedValue;
        addFact({ id: 'sacrifice', source: 'rules', weight: 56, positive: true,
          text: `${pieceText(movingPiece, move.to)} fica em risco de captura: pela contagem de capturas legais na casa ${squareName(move.to)}, ${sideName(side)} entregam ${materialText(net)}. Mesmo assim o motor aprova o lance, então há uma compensação (ataque, mate, atividade ou recuperação do material depois) que esta contagem de material não mede.`,
          short: `entrega material (${materialText(net)} pela contagem de capturas), mas o motor sustenta o lance` });
      } else if (movedHanging && movedHanging.gain - capturedValue >= 1) {
        const net = movedHanging.gain - capturedValue;
        const corroborated = Boolean(replyStep && replyStep.move.to === move.to && replyStep.captured !== '.');
        addFact({ id: 'piece-hanging', source: 'rules', weight: corroborated ? 82 : 66, positive: false, corroborated,
          text: `${pieceText(movingPiece, move.to)}, a peça que acabou de se mover, fica em risco de captura. ` +
            (capturedValue
              ? `Somando o que o lance capturou, ${materialText(capturedValue)}, e as recapturas legais na casa ${squareName(move.to)}, ${sideName(side)} terminam com ${materialText(net)} a menos. `
              : `Na troca em ${squareName(move.to)}, com recapturas legais, ${sideName(other)} ganham ${materialText(net)}. `) +
            (corroborated ? `O motor confirma com ${replyStep.san} como resposta principal.` : 'A resposta principal do motor não é essa captura, então pode haver uma compensação que esta checagem não enxerga.'),
          short: `deixa ${pieceNoun(movingPiece)} em ${squareName(move.to)} em risco de captura, com perda líquida de ${materialText(net)}` });
      }
      for (const item of good ? [] : hangingAfter) {
        if (item.square === move.to) continue;
        const wasThreatened = threatsBefore.find((threat) => threat.square === item.square && threat.piece === item.piece);
        const corroborated = Boolean(replyStep && replyStep.move.to === item.square && replyStep.captured !== '.');
        if (wasThreatened) {
          addFact({ id: 'threat-ignored', source: 'rules', weight: corroborated ? 72 : 60, positive: false, corroborated,
            text: `Antes do lance, ${pieceText(item.piece, item.square)} já estava ${threatened(item.piece)}: ${sideName(other)} ganhariam ${materialText(item.gain)} com ${item.san}. O lance não resolveu essa ameaça.` +
              (corroborated ? ` O motor responde justamente com ${replyStep.san}.` : ''),
            short: `não resolve a ameaça contra ${pieceNoun(item.piece)} em ${squareName(item.square)}` });
        } else if (!wasThreatened) {
          addFact({ id: 'piece-hanging', source: 'rules', weight: corroborated ? 78 : 62, positive: false, corroborated,
            text: `Depois do lance, ${pieceText(item.piece, item.square)} fica em risco: ${sideName(other)} ganham ${materialText(item.gain)} com ${item.san}; antes do lance essa peça não estava nessa situação.` +
              (corroborated ? ` O motor confirma com ${replyStep.san}.` : ''),
            short: `deixa ${pieceNoun(item.piece)} em ${squareName(item.square)} em risco de captura` });
        }
        if (facts.filter((f) => f.id === 'piece-hanging' || f.id === 'threat-ignored').length >= 2) break;
      }
      const escapedFrom = threatsBefore.find((threat) => threat.square === move.from);
      if (escapedFrom && !movedHanging && good) {
        addFact({ id: 'escaped-threat', source: 'rules', weight: 55, positive: true,
          text: `Antes do lance, ${pieceText(escapedFrom.piece, escapedFrom.square)} estava ${threatened(escapedFrom.piece)} (${sideName(other)} ganhariam ${materialText(escapedFrom.gain)}); o lance a leva para uma casa onde essa captura deixa de ser vantajosa.`,
          short: 'tira uma peça ameaçada de uma casa em que seria capturada com ganho' });
      }

      // 3) Material nas variantes (só quando a variante termina sem captura pendente) -----------------
      if (playedMaterial && playedMaterial.captures.length + playedMaterial.promotions > 0) {
        if (!playedMaterial.settled) uncertainty.push(`A variante após ${played.san} termina com uma captura ainda pendente; por isso não afirmo o saldo final de material dela.`);
        else if (!good && comparable && bestMaterial?.settled && !sameAsBest && bestMaterial.delta - playedMaterial.delta >= 1) {
          const diff = bestMaterial.delta - playedMaterial.delta;
          const lostIt = playedMaterial.delta <= -1;
          addFact({ id: lostIt ? 'tactic-allowed' : 'material-missed', source: 'line', weight: lostIt ? 68 : 60, positive: false,
            text: `Comparando variantes na mesma profundidade (${before.depth}): após ${played.san}, o saldo material demonstrado é ${playedMaterial.delta > 0 ? '+' : playedMaterial.delta < 0 ? '−' : ''}${Math.abs(playedMaterial.delta)} (capturas da variante: ${captureList(playedMaterial) || 'nenhuma'}); após ${bestSan}, é ${bestMaterial.delta > 0 ? '+' : bestMaterial.delta < 0 ? '−' : ''}${Math.abs(bestMaterial.delta)} (capturas da variante: ${captureList(bestMaterial) || 'nenhuma'}). A diferença é de ${materialText(diff)}.`,
            short: `termina a variante com ${materialText(diff)} a menos que ${bestSan}` });
        } else if (!good && !sameAsBest && !bestMaterial && playedMaterial.delta <= -1) {
          addFact({ id: 'tactic-allowed', source: 'line', weight: 52, positive: false,
            text: `Na variante do motor após ${played.san}, ${sideName(side)} terminam com ${materialText(playedMaterial.delta)} a menos. Capturas da variante: ${captureList(playedMaterial)}. Não há variante comparável do melhor lance para confirmar que essa perda vem do lance escolhido.`,
            short: `leva a uma variante em que ${sideName(side)} terminam com ${materialText(playedMaterial.delta)} a menos` });
        } else if (good && playedMaterial.delta >= 1 && playedMaterial.captures.some((step) => step.side === side)) {
          addFact({ id: 'won-material', source: 'line', weight: 60, positive: true,
            text: `A variante do motor após ${played.san} mantém um ganho de ${materialText(playedMaterial.delta)}. Capturas da variante: ${captureList(playedMaterial)}.`,
            short: `leva a uma variante com ganho de ${materialText(playedMaterial.delta)}` });
        }
      } else if (playedMaterial && !playedMaterial.settled) {
        uncertainty.push(`Há uma captura pendente no fim da variante após ${played.san}; conclusões sobre trocas além dela não são possíveis.`);
      }

      // 4) Garfos demonstrados ---------------------------------------------------------------------
      const bestFork = bestRep && !bestRep.broken ? verifiedFork(bestRep, side) : null;
      const playedFork = playedRep && !playedRep.broken ? verifiedFork(playedRep, side) : null;
      const forkShown = sameAsBest ? (bestFork || playedFork) : null;
      if (bestFork && !sameAsBest && !good) {
        addFact({ id: 'fork-missed', source: 'line', weight: 58, positive: false,
          text: `${bestSan} cria um ataque duplo: ${pieceNoun(bestFork.piece)} em ${squareName(bestFork.landing)} passa a atacar ${bestFork.targets.map(squareName).join(' e ')}${bestFork.check ? ' e dá xeque ao mesmo tempo' : ''}, e a variante confirma ganho com ${bestFork.capture} (saldo de ${materialText(bestFork.material.delta)} a favor).`,
          short: `deixa passar ${bestSan}, que criava um ataque duplo confirmado pela variante` });
      } else if (forkShown) {
        addFact({ id: 'fork-found', source: 'line', weight: 62, positive: true,
          text: `O lance cria um ataque duplo (${pieceNoun(forkShown.piece)} em ${squareName(forkShown.landing)} ataca ${forkShown.targets.map(squareName).join(' e ')}${forkShown.check ? ' e dá xeque ao mesmo tempo' : ''}), e a variante confirma o ganho com ${forkShown.capture}.`,
          short: 'cria um ataque duplo que a variante confirma' });
      }

      // 5) Resposta principal do adversário (xeque / captura) ----------------------------------------
      if (!good && !sameAsBest && replyStep && !facts.some((f) => f.id === 'mate-allowed' || f.corroborated)) {
        if (replyStep.check) {
          addFact({ id: 'check-reply', source: 'line', weight: 30, positive: false,
            text: `A resposta principal do motor, ${replyStep.san}, dá xeque.`, short: `permite o xeque ${replyStep.san} como resposta principal` });
        } else if (replyStep.captured !== '.' && replyStep.move.to === move.to) {
          addFact({ id: 'reply-capture', source: 'line', weight: 28, positive: false,
            text: `A resposta principal do motor, ${replyStep.san}, captura ${pieceNoun(replyStep.captured)} que acabou de chegar a ${squareName(move.to)}.`,
            short: `permite a captura ${replyStep.san} em ${squareName(move.to)}` });
        }
      }

      // 6) Ranking entre as variantes calculadas (MultiPV) --------------------------------------------
      const variations = Array.isArray(before.variations) ? before.variations.filter(Boolean) : [];
      const equivalent = [];
      if (variations.length >= 2 && comparable) {
        const bestExpected = expected(variations[0].score || before.score, before.turn, side);
        variations.forEach((variation, index) => {
          const first = tokensOf(variation.pv)[0], candidate = first ? parseUciMove(root, first) : null;
          if (!candidate) return;
          const value = expected(variation.score, before.turn, side);
          if (index > 0 && value !== null && bestExpected !== null && bestExpected - value <= 0.02 && first !== playedUci) {
            equivalent.push({ san: moveToSan(root, candidate), uci: first, evaluation: evalText(variation.score, before.turn, side) });
          }
        });
        const rank = variations.findIndex((variation) => tokensOf(variation.pv)[0] === playedUci);
        if (rank >= 1) {
          addFact({ id: 'played-rank', source: 'engine', weight: 20, positive: good,
            text: `${played.san} foi a ${rank + 1}ª melhor linha calculada pelo motor (${evalText(variations[rank].score, before.turn, side)}), contra ${evalText(variations[0].score, before.turn, side)} do melhor lance.`,
            short: `foi a ${rank + 1}ª melhor linha do motor` });
        } else if (rank < 0 && !sameAsBest && quality.kind !== 'best') {
          uncertainty.push(`${played.san} não está entre as ${variations.length} melhores linhas calculadas; não há avaliação direta dele na lista de alternativas, apenas a da posição depois dele.`);
        }
      }

      // 7) Avaliações (contexto) ------------------------------------------------------------------------
      let evaluation = null;
      if (comparable && before.score && after.score) {
        evaluation = { depth: before.depth, side, bestText: evalText(before.score, before.turn, side), playedText: evalText(after.score, after.turn, side) };
        evaluation.text = `Avaliação do motor para ${sideName(side)} (profundidade ${before.depth}): melhor lance da posição ${evaluation.bestText}; depois de ${played.san}, ${evaluation.playedText}.`;
        addFact({ id: 'evaluation', source: 'engine', weight: 10, positive: good, text: evaluation.text, short: '' });
      }

      // 8) Indícios posicionais: só quando nenhuma causa tática foi demonstrada ---------------------------
      const demonstrated = (fact) => Boolean(fact) && (fact.source !== 'rules' || fact.corroborated);
      const causal = facts.filter((fact) => !fact.positive && fact.weight >= 52);
      // Posição já perdida para mate: nenhuma causa tática menor deve ser a manchete.
      const primaryNegative = lostBefore && facts.some((fact) => fact.id === 'already-lost') ? null : causal.sort((a, b) => b.weight - a.weight)[0] || null;
      const positiveFacts = facts.filter((fact) => fact.positive && fact.weight >= 52).sort((a, b) => b.weight - a.weight);
      if (!demonstrated(primaryNegative)) {
        for (const idea of positionalIdeas(root, move)) heuristics.push({ id: idea.id, subject: 'played', polarity: idea.polarity, text: `${played.san} ${idea.text}.` });
        if (bestMove && !sameAsBest) {
          for (const idea of positionalIdeas(root, bestMove).filter((item) => item.polarity !== 'minus').slice(0, 2)) heuristics.push({ id: idea.id, subject: 'best', polarity: idea.polarity, text: `A alternativa ${bestSan} ${idea.text}.` });
        }
      }

      // 9) Incertezas e tema --------------------------------------------------------------------------
      const alreadyLostFact = facts.find((fact) => fact.id === 'already-lost');
      if (!good && !primaryNegative && !alreadyLostFact) {
        uncertainty.push('As variantes calculadas não demonstram uma causa concreta (material, xeque ou mate) para a diferença. A preferência do motor pode vir de fatores posicionais de longo prazo que este treinador não mede; os indícios abaixo são apenas sugestões.');
      }
      if (quality.loss != null && quality.loss < 0.05 && !sameAsBest) uncertainty.push(`A diferença para o melhor lance é pequena (${fmt(lossPoints)} pontos percentuais); em posições assim vários lances são razoáveis.`);
      if (!comparable) uncertainty.push('As duas análises têm profundidades diferentes; comparações de variantes e de avaliações foram omitidas.');
      const decisive = facts.some((fact) => !fact.positive && demonstrated(fact) && fact.weight >= 60);
      if (playedRep && tokensOf(after.pvUci).length < 2 && !decisive) uncertainty.push('A variante do motor depois do lance é curta; não dá para seguir trocas além dela.');
      if (Number(before.depth) > 0 && Number(before.depth) < 14 && !good && !decisive) uncertainty.push(`A análise usa profundidade ${before.depth}. Refaça em profundidade maior para confirmar antes de tirar conclusões.`);

      let theme = good ? 'sound' : alreadyLostFact ? 'lost-position' : 'positional';
      if (primaryNegative && !good) theme = { 'mate-allowed': 'mate-allowed', 'mate-missed': 'mate-missed', 'piece-hanging': 'piece-hanging', 'threat-ignored': 'threat-ignored', 'tactic-allowed': 'tactic-allowed', 'material-missed': 'material-missed', 'fork-missed': 'fork-missed' }[primaryNegative.id] || theme;
      if (good) for (const fact of positiveFacts) positives.push({ id: fact.id, kind: 'fact', text: fact.short });
      if (good) for (const idea of heuristics.filter((h) => h.subject === 'played' && h.polarity !== 'minus')) positives.push({ id: idea.id, kind: 'heuristic', text: idea.text });

      const alreadyLost = facts.find((fact) => fact.id === 'already-lost');
      const explanation = good ? (positiveFacts.some(demonstrated) || alreadyLost ? 'verified' : positiveFacts.length || heuristics.some((h) => h.subject === 'played') ? 'partial' : 'unconfirmed')
        : primaryNegative ? (demonstrated(primaryNegative) ? 'verified' : 'partial') : alreadyLost ? 'verified' : (heuristics.length ? 'partial' : 'unconfirmed');

      // Manchete curta: veredito + a causa verificada mais forte (ou a ausência dela).
      let headline;
      const lossText = lossPoints === null ? '' : ` (perda estimada de ${fmt(lossPoints)} pontos percentuais de chance)`;
      if (good) {
        const base = quality.kind === 'best' ? 'Coincide com o melhor lance do motor' : quality.kind === 'brilliant' ? 'Sacrifício que o motor sustenta' : quality.kind === 'great' ? 'Lance que o motor destaca como difícil de achar' : `Lance aprovado pelo motor${lossPoints ? ` (${fmt(lossPoints)} pontos percentuais abaixo do melhor)` : ''}`;
        headline = alreadyLost
          ? `${quality.label}. ${base}, mas a posição já estava perdida: mesmo este lance termina em mate forçado na variante.`
          : positiveFacts.length
          ? `${quality.label}. ${base}; verificado: ${played.san} ${positiveFacts[0].short}.`
          : `${quality.label}. ${base}; as variantes calculadas não destacam um tema tático simples${heuristics.some((h) => h.subject === 'played') ? ', e há indícios posicionais abaixo' : ''}.`;
      } else if (alreadyLost && !primaryNegative) {
        headline = `${quality.label}${lossText}. A posição já estava perdida para mate forçado antes do lance; ${played.san} não é a causa, e ${bestSan || 'a alternativa do motor'} apenas resistia mais.`;
      } else if (primaryNegative) {
        headline = demonstrated(primaryNegative)
          ? `${quality.label}${lossText}. Causa verificada: ${played.san} ${primaryNegative.short}.`
          : `${quality.label}${lossText}. Indício forte pelas regras do xadrez: ${played.san} ${primaryNegative.short}; o motor não confirma isso na variante principal.`;
      } else {
        headline = `${quality.label}${lossText}. O motor prefere ${bestSan || 'outro lance'}, mas as variantes calculadas não demonstram uma causa concreta.`;
      }

      const alternative = bestMove && !sameAsBest ? {
        san: bestSan, uci: bestToken, line: bestRep && bestRep.steps.length ? formatLine(bestRep, 10) : '',
        evaluation: before.score ? evalText(before.score, before.turn, side) : ''
      } : null;

      const themeInfo = THEMES[theme];
      return {
        version: VERSION, valid: true, mover: side, moveNumber: played.moveNumber, san: played.san,
        kind: quality.kind, label: quality.label, lossPoints, headline,
        theme, themeLabel: themeInfo.label, explanation,
        facts: facts.slice().sort((a, b) => b.weight - a.weight).map(({ id, source, weight, text, short, positive, corroborated }) => ({ id, source, sourceLabel: SOURCE_LABEL[source], weight, text: sentence(text), short, positive, corroborated: Boolean(corroborated) })),
        heuristics, uncertainty, alternative, equivalent, positives, evaluation,
        lines: { played: playedRep && playedRep.steps.length ? formatLine(playedRep, 10) : '', best: bestRep && bestRep.steps.length ? formatLine(bestRep, 10) : '' },
        questions: questionsFor(theme, played.san, good), takeaway: themeInfo.habit
      };
    }

    return {
      buildLesson, replay, exchange, hangingPieces, lineMaterial, verifiedFork, positionalIdeas, formatLine, materialText,
      centipawnsFor, themes: THEMES, goodKinds: GOOD_KINDS
    };
  }

  return { create, VERSION, THEMES, SOURCE_LABEL };
}));
