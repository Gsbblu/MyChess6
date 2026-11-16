// Testes do módulo da Visão geral (insights.js) com partidas sintéticas.
// Verificam a precisão estimada, a leitura de relógio/abertura, os limiares de amostra mínima, o
// agrupamento por tema, vantagens desperdiçadas e o isolamento do perfil do jogador.
// Requer Node.js; não usa navegador. Uso: node tests/test_insights.js
'use strict';
const Insights = require('../insights.js');
const Coach = require('../coach.js');

const resultados = [];
const verificar = (nome, ok, detalhe = '') => resultados.push({ nome, ok: Boolean(ok), detalhe });
const perto = (a, b, tol) => Math.abs(a - b) <= tol;
const THEMES = Coach.THEMES;
const NOW = Date.UTC(2026, 10, 15, 12);

const FEN_MEIO = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_FINAL = '4k3/4p3/8/8/8/8/4P3/R3K3 w - - 0 40';
const kindLabel = { best: 'Melhor', excellent: 'Excelente', good: 'Bom', inaccuracy: 'Imprecisão', mistake: 'Erro', blunder: 'Erro grave' };

// Monta um registro como o aplicativo o salva. `fazer(index, side, minhaVez)` devolve { loss, kind, theme } do lance.
function registro({ id, eu = 'me', cor = 'w', resultado, dia, tc = '300', plies = 40, abertura = 'Italian-Game-Giuoco-Piano-4.c3-Nf6', fazer, avalia, relogio = true, termination = '' }) {
  const adversario = 'rival';
  const headers = {
    White: cor === 'w' ? eu : adversario, Black: cor === 'w' ? adversario : eu, Result: resultado, Date: `2026.11.${String(dia).padStart(2, '0')}`,
    TimeControl: tc, WhiteElo: '1200', BlackElo: '1200', ECO: 'C50', ECOUrl: `https://www.chess.com/openings/${abertura}`, Termination: termination
  };
  const results = [{ index: 0, fen: FEN_MEIO, turn: 'w', score: { type: 'cp', value: 20 }, depth: 14 }];
  let pgn = '';
  for (let i = 1; i <= plies; i += 1) {
    const side = i % 2 === 1 ? 'w' : 'b', turn = side === 'w' ? 'b' : 'w';
    const minhaVez = side === cor;
    const info = (minhaVez ? fazer(i, side) : null) || { loss: 0.005, kind: 'best', theme: null };
    const brancas = avalia ? avalia(i) : 20;
    results.push({
      index: i, fen: i > 24 ? FEN_FINAL : FEN_MEIO, turn, depth: 14, score: { type: 'cp', value: turn === 'w' ? brancas : -brancas },
      playedMove: { side, san: 'Nf3', moveNumber: Math.ceil(i / 2) },
      quality: { kind: info.kind, label: kindLabel[info.kind], loss: info.loss, lesson: info.theme ? { theme: info.theme, explanation: 'verified' } : { theme: 'sound', explanation: 'verified' } }
    });
    if (relogio) { const resta = Math.max(3, 300 - 18 * Math.ceil(i / 2)); pgn += ` {[%clk 0:${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}.0]}`; }
  }
  return { id, pgn: `[Event "x"]\n\n1. e4${pgn} *`, headers, moves: plies, depth: 14, savedAt: NOW, results };
}

const cenarios = {
  formulas() {
    verificar('Precisão: lance perfeito vale ~100%', perto(Insights.moveAccuracy(0), 100, 0.01), Insights.moveAccuracy(0));
    verificar('Precisão: perda de 10 pontos percentuais fica entre 60 e 70%', Insights.moveAccuracy(0.1) > 60 && Insights.moveAccuracy(0.1) < 70, Insights.moveAccuracy(0.1));
    verificar('Precisão: erro grave derruba mais que a média simples (média harmônica)', Insights.gameAccuracy([0, 0, 0, 0, 0.5]) < (100 * 4 + Insights.moveAccuracy(0.5)) / 5);
    verificar('Relógio: lê [%clk] em ordem', JSON.stringify(Insights.parseClocks('1. e4 {[%clk 0:09:58.3]} e5 {[%clk 1:00:01]}')) === JSON.stringify([598.3, 3601]));
    const tc = (valor) => Insights.parseTimeControl(valor).speed;
    verificar('Ritmo: 60 é bullet, 180+2 é blitz, 300 é blitz, 600 é rápida, 1/86400 é por correspondência',
      tc('60') === 'bullet' && tc('180+2') === 'blitz' && tc('300') === 'blitz' && tc('600') === 'rapid' && tc('1/86400') === 'daily', [tc('60'), tc('180+2'), tc('300'), tc('600'), tc('1/86400')].join());
    const abertura = Insights.openingOf({ ECOUrl: 'https://www.chess.com/openings/Sicilian-Defense-Open-Najdorf-Variation-6.Be3-e5-7.Nb3', ECO: 'B90' });
    verificar('Abertura: lê o nome do endereço e agrupa pela família', abertura.name === 'Sicilian Defense Open Najdorf Variation' && abertura.family === 'Sicilian Defense', JSON.stringify(abertura));
    verificar('Abertura: sem nome usa o código ECO', Insights.openingOf({ ECO: 'A45' }).family === 'ECO A45');
    verificar('Abertura: sem dados devolve nulo', Insights.openingOf({}) === null);
  },

  relatorioCompleto() {
    // 10 partidas do perfil "me": 5 de brancas, 5 de pretas. Em todas, lances 15-20 (pouco tempo) com erros "piece-hanging".
    const registros = [];
    for (let n = 1; n <= 10; n += 1) {
      const cor = n % 2 ? 'w' : 'b';
      const perdida = n <= 4; // as 4 primeiras: vantagem de +700 e depois o resultado não é vitória
      registros.push(registro({
        id: `g${n}`, cor, dia: n, resultado: perdida ? (cor === 'w' ? '0-1' : '1-0') : (cor === 'w' ? '1-0' : '0-1'),
        abertura: cor === 'b' && n <= 6 ? 'Sicilian-Defense-Open-Najdorf-Variation-6.Be3' : 'Italian-Game-Giuoco-Piano-4.c3',
        termination: n === 1 ? 'rival won on time' : 'rival won by checkmate',
        avalia: (i) => (perdida ? (i < 20 ? 700 : -300) : 20) * (cor === 'w' ? 1 : -1),
        fazer: (i) => {
          const numero = Math.ceil(i / 2);
          if (numero >= 15 && numero <= 18) return { loss: 0.25, kind: 'blunder', theme: 'piece-hanging' };
          if (n === 2 && numero === 5) return { loss: 0.12, kind: 'mistake', theme: 'threat-ignored' };
          if (n === 3 && numero === 6) return { loss: 0.12, kind: 'mistake', theme: 'threat-ignored' };
          return { loss: 0.01, kind: 'excellent', theme: null };
        }
      }));
    }
    const r = Insights.compute(registros, { profile: 'ME', now: NOW, themes: THEMES });
    verificar('Considera as 10 partidas e identifica o jogador (sem diferenciar maiúsculas)', !r.empty && r.mode === 'player' && r.counts.considered === 10, JSON.stringify(r.counts));
    verificar('Resultados: 6 vitórias e 4 derrotas', r.overview.outcomes.win === 6 && r.overview.outcomes.loss === 4, JSON.stringify(r.overview.outcomes));
    verificar('Só os lances do jogador entram (20 por partida)', r.overview.moves === 200, r.overview.moves);
    const tema = r.errorThemes.find((t) => t.theme === 'piece-hanging');
    verificar('Tema recorrente: peça em prise com 40 lances em 10 partidas', tema && tema.count === 40 && tema.games === 10, JSON.stringify(tema && { c: tema.count, g: tema.games }));
    verificar('Tema recorrente tem exemplos com lance, partida e posição', tema.examples.length === 3 && tema.examples.every((e) => e.recordId && Number.isInteger(e.index) && e.text), JSON.stringify(tema.examples[0]));
    const prioridades = r.priorities.map((p) => p.id);
    verificar('Prioridade de tema aparece', prioridades.includes('theme:piece-hanging'), prioridades.join());
    verificar('Tema com só 2 lances ("ameaça ignorada") NÃO vira prioridade (amostra mínima)', !prioridades.includes('theme:threat-ignored'), prioridades.join());
    verificar('Há relógio em todas as partidas e os lances 15-20 contam como pouco tempo', r.time && r.time.games === 10 && r.time.troubleMoves > 0 && r.time.troubleShare > 0.2, JSON.stringify(r.time));
    verificar('Prioridade de tempo aparece (erros concentrados com pouco relógio)', prioridades.includes('time:trouble'), prioridades.join());
    verificar('Vantagens: 4 partidas desperdiçadas, conversão 0%', r.advantage.wasted === 4 && r.advantage.had === 4 && r.advantage.conversion === 0, JSON.stringify(r.advantage));
    verificar('Vantagens: derrota por tempo é identificada pelo cabeçalho', r.advantage.timeLosses === 1, r.advantage.timeLosses);
    verificar('Prioridade de vantagem desperdiçada aparece', prioridades.includes('advantage:wasted'), prioridades.join());
    const najdorf = r.openings.find((o) => o.family === 'Sicilian Defense');
    verificar('Aberturas agrupadas por família e cor', najdorf && najdorf.side === 'b' && najdorf.games === 3, JSON.stringify(najdorf));
    verificar('Cores: 5 partidas de cada', r.colors.every((c) => c.games === 5), JSON.stringify(r.colors.map((c) => c.games)));
    verificar('No máximo 4 prioridades, cada uma com evidência e sugestão separadas', r.priorities.length <= 4 && r.priorities.every((p) => p.evidence.length && p.action && p.confidence), JSON.stringify(r.priorities.map((p) => p.id)));
    verificar('Prioridades ordenadas por peso', r.priorities.every((p, i) => i === 0 || r.priorities[i - 1].weight >= p.weight), r.priorities.map((p) => p.weight.toFixed(3)).join());
    verificar('Momentos mais caros: no máximo 2 por partida e 5 no total', r.costly.length === 5 && Object.values(r.costly.reduce((m, c) => ({ ...m, [c.recordId]: (m[c.recordId] || 0) + 1 }), {})).every((n) => n <= 2), JSON.stringify(r.costly.map((c) => c.recordId)));
    verificar('Partidas para rever: 3, da menor precisão para a maior', r.review.length === 3 && r.review[0].accuracy <= r.review[1].accuracy, JSON.stringify(r.review.map((x) => x.accuracy)));
    verificar('Tendência: calculada com 10 partidas (5 recentes vs 5 anteriores)', r.trend && r.trend.k === 5, JSON.stringify(r.trend));
    const fases = Object.fromEntries(r.phases.map((p) => [p.name, p.moves]));
    verificar('Fases: lances 1-10 abertura, depois meio-jogo e final', fases['Abertura'] === 100 && fases['Meio-jogo'] > 0 && fases['Final'] > 0, JSON.stringify(fases));
  },

  filtros() {
    const base = [];
    for (let n = 1; n <= 4; n += 1) base.push(registro({ id: `a${n}`, dia: 1 + n, resultado: '1-0', fazer: () => ({ loss: 0.01, kind: 'excellent' }) }));
    base.push(registro({ id: 'antiga', dia: 1, resultado: '1-0', tc: '60', fazer: () => ({ loss: 0.01, kind: 'excellent' }) }));
    const velha = registro({ id: 'velha', dia: 1, resultado: '1-0', fazer: () => ({ loss: 0.01, kind: 'excellent' }) });
    velha.headers.Date = '2025.01.01';
    base.push(velha);
    const total = Insights.compute(base, { profile: 'me', now: NOW, themes: THEMES });
    verificar('Sem filtro: considera as 6 partidas', total.counts.considered === 6, JSON.stringify(total.counts));
    const periodo = Insights.compute(base, { profile: 'me', now: NOW, periodDays: 30, themes: THEMES });
    verificar('Período de 30 dias usa a data da partida e descarta a de 2025', periodo.counts.considered === 5, JSON.stringify(periodo.counts));
    const bullet = Insights.compute(base, { profile: 'me', now: NOW, speed: 'bullet', themes: THEMES });
    verificar('Filtro de ritmo: só a partida bullet', bullet.counts.considered === 1, JSON.stringify(bullet.counts));
    const nenhuma = Insights.compute(base, { profile: 'me', now: NOW, speed: 'daily', themes: THEMES });
    verificar('Filtro sem partidas devolve relatório vazio, não erro', nenhuma.empty === true && nenhuma.counts.considered === 0);
  },

  perfil() {
    const minhas = [1, 2].map((n) => registro({ id: `m${n}`, dia: n, resultado: '1-0', fazer: () => ({ loss: 0.01, kind: 'excellent' }) }));
    const terceiros = registro({ id: 't1', eu: 'outro', dia: 3, resultado: '1-0', fazer: () => ({ loss: 0.4, kind: 'blunder' }) });
    const misto = Insights.compute([...minhas, terceiros], { profile: 'me', now: NOW, themes: THEMES });
    verificar('Com o perfil presente, partidas de terceiros ficam de fora e são contadas', misto.mode === 'player' && misto.counts.considered === 2 && misto.counts.thirdParty === 1, JSON.stringify(misto.counts));
    const sem = Insights.compute([terceiros], { profile: 'me', now: NOW, themes: THEMES });
    verificar('Sem nenhuma partida do perfil, considera os dois lados e não inventa cores/aberturas/vantagens', sem.mode === 'both' && sem.colors === null && sem.openings === null && sem.advantage === null, JSON.stringify({ m: sem.mode }));
    verificar('Modo "ambos os lados" soma os lances das duas cores', sem.overview.moves === 40, sem.overview.moves);
  },

  amostraPequena() {
    const poucas = [registro({ id: 'u1', dia: 1, resultado: '0-1', fazer: (i) => (i === 21 ? { loss: 0.3, kind: 'blunder', theme: 'piece-hanging' } : { loss: 0.01, kind: 'excellent' }) })];
    const r = Insights.compute(poucas, { profile: 'me', now: NOW, themes: THEMES });
    verificar('Uma partida só: nenhuma prioridade (amostra mínima)', r.priorities.length === 0, JSON.stringify(r.priorities.map((p) => p.id)));
    verificar('Uma partida só: avisa que há poucas partidas e não calcula tendência', r.notes.some((n) => /Poucas partidas/.test(n)) && r.trend === null);
    verificar('Uma partida só: não afirma aberturas fracas nem pontos fortes de abertura', r.openings.every((o) => !o.weak && !o.solid));
  },

  semRelogioEDadosAntigos() {
    const antiga = registro({ id: 'x1', dia: 1, resultado: '1-0', relogio: false, fazer: (i) => (i === 7 ? { loss: 0.3, kind: 'blunder', theme: null } : { loss: 0.01, kind: 'excellent' }) });
    delete antiga.results[7].quality.lesson; // registro salvo antes do treinador atual: sem lição
    const r = Insights.compute([antiga, { id: 'quebrado', headers: {}, results: 'não é lista' }, null], { profile: 'me', now: NOW, themes: THEMES });
    verificar('Sem comentários [%clk], a seção de tempo não aparece', r.time === null && r.clock.games === 0, JSON.stringify(r.clock));
    verificar('Registros malformados são ignorados sem erro', r.counts.considered === 1);
    const antigo = r.errorThemes.find((t) => t.theme === 'unknown');
    verificar('Lance salvo sem lição do treinador cai em "sem causa registrada" e nunca vira prioridade', antigo && !r.priorities.some((p) => p.id === 'theme:unknown'));
  },

  lancesDestaque() {
    const r = Insights.compute([registro({ id: 'b1', dia: 1, resultado: '1-0', fazer: (i) => (i === 9 ? { loss: 0, kind: 'brilliant' } : { loss: 0.01, kind: 'excellent' }) })], { profile: 'me', now: NOW, themes: THEMES });
    const destaque = r.strengths.find((s) => s.id === 'standout');
    verificar('Lance brilhante vira ponto forte com link para o lance', destaque && destaque.example.index === 9, JSON.stringify(destaque));
  }
};

for (const [nome, fn] of Object.entries(cenarios)) {
  try { fn(); } catch (erro) { verificar(`Cenário "${nome}" executou sem erro`, false, erro.stack.split('\n').slice(0, 4).join(' | ')); }
}
let falhas = 0;
for (const r of resultados) { if (!r.ok) falhas += 1; console.log(`${r.ok ? 'OK' : 'FALHA'}: ${r.nome}${!r.ok && r.detalhe ? `\n  ${r.detalhe}` : ''}`); }
if (falhas) { console.error(`${falhas} verificação(ões) da Visão geral falharam.`); process.exit(1); }
console.log('Todos os cenários da Visão geral passaram.');
