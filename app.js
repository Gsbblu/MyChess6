(() => {
  const initial = () => ({ board: 'rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR'.split(''), turn: 'w', castling: 'KQkq', ep: -1, halfmove: 0, fullmove: 1 });
  const clone = (position) => ({ ...position, board: position.board.slice() });
  const white = (piece) => piece !== '.' && piece === piece.toUpperCase();
  const color = (piece) => white(piece) ? 'w' : 'b';
  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const idx = (r, c) => r * 8 + c;
  const squareName = (square) => `${'abcdefgh'[square % 8]}${8 - Math.floor(square / 8)}`;
  const cloneMove = (move) => move ? { ...move } : null;

  const boardElement = document.querySelector('#chessboard');
  const boardWrapElement = document.querySelector('.board-wrap');
  const boardLayoutElement = document.querySelector('.board-layout');
  const boardEvalMeter = document.querySelector('.eval-meter');
  const boardSizeInput = document.querySelector('#board-size');
  const boardSizeValue = document.querySelector('#board-size-value');
  const rankLabels = document.querySelector('.rank-labels');
  const fileLabels = document.querySelector('.file-labels');
  const turnLabel = document.querySelector('#turn-indicator');
  const gameClocks = document.querySelector('#game-clocks');
  const whiteClock = document.querySelector('#white-clock');
  const blackClock = document.querySelector('#black-clock');
  const moveCount = document.querySelector('#move-count');
  const moveDock = document.querySelector('#move-dock');
  const fenLabel = document.querySelector('#fen-label');
  const positionName = document.querySelector('#position-name');
  const moveListElement = document.querySelector('#move-list');
  const gameDetails = document.querySelector('#game-details');
  const gameOutcomeIndicator = document.querySelector('#game-outcome-indicator');
  const importStatus = document.querySelector('#import-status');
  const pgnFile = document.querySelector('#pgn-file');
  const chessComSearch = document.querySelector('#chesscom-search');
  const chessComUsername = document.querySelector('#chesscom-username');
  const chessComMonth = document.querySelector('#chesscom-month');
  const chessComTimeClass = document.querySelector('#chesscom-timeclass');
  const chessComStatus = document.querySelector('#chesscom-status');
  const chessComGames = document.querySelector('#chesscom-games');
  const savedGamesList = document.querySelector('#saved-games');
  const savedCount = document.querySelector('#saved-count');
  const savedStatus = document.querySelector('#saved-status');
  const cloudProgressStatus = document.querySelector('#cloud-progress-status');
  const libraryTab = document.querySelector('#library-tab');
  const insightsTab = document.querySelector('#insights-tab');
  const libraryPanel = document.querySelector('#library-panel');
  const insightsPanel = document.querySelector('#insights-panel');
  const insightsPeriod = document.querySelector('#insights-period');
  const insightsCustomPeriodWrap = document.querySelector('#insights-custom-period-wrap');
  const insightsCustomPeriod = document.querySelector('#insights-custom-period');
  const insightsStatus = document.querySelector('#insights-status');
  const insightsSpeed = document.querySelector('#insights-speed');
  const insightsBody = document.querySelector('#insights-body');
  let insightsRefreshTimer = 0;
  let insightsRefreshId = 0;
  const analyzeButton = document.querySelector('#analyze-position');
  const cancelAnalysisButton = document.querySelector('#cancel-analysis');
  const engineStatusText = document.querySelector('#engine-status-text');
  const analysisPlaceholder = document.querySelector('#analysis-placeholder');
  const analysisResults = document.querySelector('#analysis-results');
  const analysisProgress = document.querySelector('#analysis-progress');
  const progressLabel = document.querySelector('#progress-label');
  const progressStats = document.querySelector('#progress-stats');
  const progressBar = document.querySelector('#analysis-progress-bar');
  const bestMoveLabel = document.querySelector('#best-move');
  const principalVariation = document.querySelector('#principal-variation');
  const bestMovesPanel = document.querySelector('#best-moves-panel');
  const bestMovesList = document.querySelector('#best-moves-list');
  const bestMovesMeta = document.querySelector('#best-moves-meta');
  const gameReviewQuality = document.querySelector('#game-review-quality');
  const gameReviewContext = document.querySelector('#game-review-context');
  const gameReviewBadge = document.querySelector('#game-review-badge');
  const gameReviewExplanation = document.querySelector('#game-review-explanation');
  const moveAnalysisGroup = document.querySelector('#move-analysis-group');
  const moveExplanationPanel = document.querySelector('#move-explanation-panel');
  const superAnalysisActions = document.querySelector('#super-analysis-actions');
  const runSiteSuperAnalysisButton = document.querySelector('#run-site-super-analysis');
  const openSuperAnalysisButton = document.querySelector('#open-super-analysis');
  const superAnalysisChallenge = document.querySelector('#super-analysis-challenge');
  const superAnalysisResult = document.querySelector('#super-analysis-result');
  const superAnalysisStatus = document.querySelector('#super-analysis-status');
  const gameReviewQuestion = document.querySelector('#game-review-question');
  const exerciseFeedback = document.querySelector('#exercise-feedback');
  const revealExerciseButton = document.querySelector('#reveal-exercise');
  const punishmentWalkthrough = document.querySelector('#punishment-walkthrough');
  const punishmentStatus = document.querySelector('#punishment-status');
  const punishmentStepButton = document.querySelector('#punishment-step');
  const bestMoveCaption = document.querySelector('#best-move-caption');
  const gameReviewDepth = document.querySelector('#game-review-depth');
  const moveAlternatives = document.querySelector('#move-alternatives');
  const moveAlternativesContext = document.querySelector('#move-alternatives-context');
  const moveAlternativesList = document.querySelector('#move-alternatives-list');
  const variationBanner = document.querySelector('#variation-banner');
  const exitVariationButton = document.querySelector('#exit-variation');
  const evaluationNumber = document.querySelector('#eval-number');
  const evaluationSide = document.querySelector('#eval-side');
  const evaluationBar = document.querySelector('.eval-bar');
  const evaluationFill = document.querySelector('.eval-bar span');
  const evaluationBarLabel = document.querySelector('#eval-bar-value');
  const analysisModes = [...document.querySelectorAll('.mode-tab')];
  const analysisPaneTab = document.querySelector('#analysis-view-tab-stockfish');
  const guidedPaneTab = document.querySelector('#analysis-view-tab-guided');
  const analysisPane = document.querySelector('#analysis-view-stockfish');
  const guidedPane = document.querySelector('#analysis-view-guided');
  const depthDialog = document.querySelector('#depth-dialog');
  const depthDialogForm = depthDialog.querySelector('form');
  const analyzeGameButton = document.querySelector('#analyze-game');
  const gameAnalysisPanel = document.querySelector('#game-analysis');
  const runGuidedGameAnalysisButton = document.querySelector('#run-guided-game-analysis');
  const guidedGameChallenge = document.querySelector('#guided-game-challenge');
  const guidedGameResult = document.querySelector('#guided-game-result');
  const guidedGameMoves = document.querySelector('#guided-game-moves');
  const guidedGameStepContext = document.querySelector('#guided-game-step-context');
  const guidedGameStepTitle = document.querySelector('#guided-game-step-title');
  const guidedGameStatus = document.querySelector('#guided-game-status');
  const gameProgressLabel = document.querySelector('#game-progress-label');
  const gameProgressCount = document.querySelector('#game-progress-count');
  const gameProgressBar = document.querySelector('#game-progress');
  const gameAnalysisRows = document.querySelector('#game-analysis-rows');
  const gameSummary = document.querySelector('#game-summary');
  const gameSummaryStatus = document.querySelector('#game-summary-status');
  const gameSummaryOverview = document.querySelector('#game-summary-overview');
  const gameSummaryMetrics = document.querySelector('#game-summary-metrics');
  const gameSummaryCoach = document.querySelector('#game-summary-coach');
  const gameSummaryOpening = document.querySelector('#game-summary-opening');
  const gameSummaryQualities = document.querySelector('#game-summary-qualities');
  const gameSummaryPhases = document.querySelector('#game-summary-phases');
  const gameSummaryThemes = document.querySelector('#game-summary-themes');
  const gameSummaryStrategy = document.querySelector('#game-summary-strategy');
  const gameSummaryTurningPoints = document.querySelector('#game-summary-turning-points');
  const advantageChart = document.querySelector('#advantage-chart');
  const advantageChartStatus = document.querySelector('#advantage-chart-status');
  const chartCurrentEval = document.querySelector('#chart-current-eval');
  const chartPointTooltip = document.querySelector('#chart-point-tooltip');
  const chartTooltipSymbol = document.querySelector('#chart-point-tooltip-symbol');
  const chartTooltipQuality = document.querySelector('#chart-point-tooltip-quality');
  const chartTooltipMove = document.querySelector('#chart-point-tooltip-move');
  const chartTooltipEvaluation = document.querySelector('#chart-point-tooltip-evaluation');
  let chartSelectPointAt = null;
  function hideChartPointTooltip() { chartPointTooltip.hidden = true; }
  function showChartPointTooltip(point, moveLabel) {
    const mark = point.index === 0 ? { symbol: '·', title: 'Posição inicial', kind: 'unknown' } : qualityMark(point.result.quality);
    chartTooltipSymbol.textContent = mark.symbol;
    chartTooltipSymbol.className = `chart-point-tooltip-symbol quality-mark-${mark.kind}`;
    chartTooltipQuality.textContent = point.result.quality?.label || mark.title;
    chartTooltipMove.textContent = moveLabel;
    chartTooltipEvaluation.textContent = point.evaluation;
    chartPointTooltip.hidden = false;
    const matrix = advantageChart.getScreenCTM?.();
    if (!matrix || !advantageChart.createSVGPoint) return;
    const marker = advantageChart.createSVGPoint(); marker.x = point.x; marker.y = point.y;
    const screen = marker.matrixTransform(matrix);
    const chartRect = advantageChart.closest('.advantage-chart-card').getBoundingClientRect();
    const tooltipWidth = chartPointTooltip.offsetWidth;
    const left = Math.max(tooltipWidth / 2 + 8, Math.min(chartRect.width - tooltipWidth / 2 - 8, screen.x - chartRect.left));
    const top = screen.y - chartRect.top;
    const placeBelow = top < chartPointTooltip.offsetHeight + 22;
    chartPointTooltip.classList.toggle('is-below', placeBelow);
    chartPointTooltip.style.left = `${left}px`;
    chartPointTooltip.style.top = `${top}px`;
  }
  advantageChart.addEventListener('click', (event) => {
    if (!chartSelectPointAt || !advantageChart.getScreenCTM || !advantageChart.createSVGPoint) return;
    const matrix = advantageChart.getScreenCTM(); if (!matrix) return;
    const point = advantageChart.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    chartSelectPointAt(local.x, local.y);
  });
  const whiteRatingInput = document.querySelector('#white-rating');
  const blackRatingInput = document.querySelector('#black-rating');
  const navButtons = {
    first: document.querySelector('#first-move'), previous: document.querySelector('#prev-move'),
    next: document.querySelector('#next-move'), last: document.querySelector('#last-move')
  };

  let position = initial();
  let flipped = false;
  let selected = -1;
  let legalTargets = [];
  let lastMove = null;
  let history = [{ position: clone(position), move: null }];
  let historyIndex = 0;
  let gameHeaders = {};
  let gameResult = '*';
  let engineWorker = null;
  let engineState = 'disconnected';
  let engineTimer = 0;
  let engineName = 'Stockfish';
  let selectedDepth = 10;
  let pendingAnalysis = null;
  let activeAnalysis = null;
  let analysisStopping = false;
  let analysisSerial = 0;
  let gameBatch = null;
  let gameReviewResults = [];
  const siteSuperAnalysisCache = new Map();
  const guidedGameAnalysisCache = new Map();
  let siteSuperAnalysisResultKey = '';
  let siteSuperAnalysisRequestId = 0;
  let siteSuperAnalysisTurnstileWidget = null;
  let siteSuperAnalysisBusy = false;
  let siteSuperAnalysisAbortController = null;
  let siteSuperAnalysisRequestMode = 'move';
  let siteSuperAnalysisActiveKey = '';
  let guidedGamePaneAvailable = false;
  let guidedGameCriticalIndexes = new Set();
  let guidedGameMoveButtons = [];
  let guidedGameOverview = '';
  let guidedGameMoveComments = new Map();
  let currentBoardQuality = null;
  let gameSummaryRenderedCount = -1;
  let variationSession = null;
  let variationNeedsAnalysis = false;
  let loadedPgnGame = false;
  let loadedPgnSource = '';
  let activeGameSource = null;
  let chessComArchiveList = [];
  let chessComGamesCache = [];
  let chessComShownGames = 24;
  let autoChessComBusy = false;
  let autoChessComQueue = [];
  let selectedRatingMode = 'rapid';
  let insightsVisible = false;
  let cloudLastSeenGameUrl = '';
  let cloudSnapshotKey = '';
  let cloudRemoteRevision = '';
  let cloudRemoteGameIds = [];
  let cloudRemoteSummary = null;
  let cloudImportBusy = false;
  let savedGamesShown = 40;
  try {
    cloudRemoteRevision = localStorage.getItem('mychess6-cloud-revision') || '';
    const cachedIds = JSON.parse(localStorage.getItem('mychess6-cloud-game-ids') || '[]');
    cloudRemoteGameIds = Array.isArray(cachedIds) ? cachedIds.filter((id) => typeof id === 'string') : [];
    const cachedSummary = JSON.parse(localStorage.getItem('mychess6-cloud-summary') || 'null');
    cloudRemoteSummary = cachedSummary && typeof cachedSummary === 'object' ? cachedSummary : null;
  } catch { /* o site continua funcionando se o armazenamento local estiver indisponível */ }
  window.MyChess6Cloud = {
    lastSeenGameUrl: '', backfillArchiveUrl: '', backfillComplete: false,
    archiveUrl: '', archiveState: 'idle', archiveRemaining: 0
  };
  let libraryDbPromise = null;
  const analysisCache = new Map();
  const analysisCacheLimit = 256;
  let pointerDrag = null;
  let pointerMoveFrame = 0;
  let queuedPointerPosition = null;
  const requestUiFrame = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 16));
  const cancelUiFrame = window.cancelAnimationFrame?.bind(window) || window.clearTimeout.bind(window);
  let suppressSquareClick = false;
  // The annotation layer is independent from the board's move-selection state.
  let manualArrows = [];
  let highlightedSquare = -1;
  let manualGesture = null;
  let arrowAnalysis = null;
  let stockfishArrowsEnabled = false;
  let manualAnnotationFen = currentFen(position);
  let keyboardMarkFrom = -1;
  let exerciseState = null;
  let punishmentPlayback = null;
  let boardFocusSquare = 52;
  let pendingMoveAnimation = null;
  let activeMoveAnimationCleanup = null;
  let compactPieceMode = false;

  const pieceAssetUrl = (piece) => {
    const colorCode = white(piece) ? 'w' : 'b';
    const folder = compactPieceMode ? 'compact/' : '';
    const version = compactPieceMode ? 'compact-1' : 'chessboart-2';
    return `public/assets/chessboart/pieces/${folder}${colorCode}${piece.toUpperCase()}.svg?v=${version}`;
  };

  const pieceArtwork = (piece) => {
    if (piece === '.') return '';
    return `<img class="piece piece-${white(piece) ? 'white' : 'black'}" src="${pieceAssetUrl(piece)}" alt="" aria-hidden="true" draggable="false">`;
  };
  const pieceMarkup = pieceArtwork;

  function attacked(pos, target, byColor) {
    const tr = Math.floor(target / 8), tc = target % 8;
    const pawnSourceRow = tr + (byColor === 'w' ? 1 : -1);
    for (const dc of [-1, 1]) {
      if (inside(pawnSourceRow, tc + dc)) {
        const piece = pos.board[idx(pawnSourceRow, tc + dc)];
        if (piece === (byColor === 'w' ? 'P' : 'p')) return true;
      }
    }
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const r = tr + dr, c = tc + dc;
      if (inside(r, c) && pos.board[idx(r,c)] === (byColor === 'w' ? 'N' : 'n')) return true;
    }
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      let r = tr + dr, c = tc + dc, distance = 1;
      while (inside(r,c)) {
        const piece = pos.board[idx(r,c)];
        if (piece !== '.') {
          if (color(piece) === byColor) {
            const kind = piece.toUpperCase();
            if (kind === 'Q' || (kind === 'B' && dr !== 0 && dc !== 0) || (kind === 'R' && (dr === 0 || dc === 0)) || (kind === 'K' && distance === 1)) return true;
          }
          break;
        }
        r += dr; c += dc; distance += 1;
      }
    }
    return false;
  }

  function inCheck(pos, side) {
    const king = pos.board.indexOf(side === 'w' ? 'K' : 'k');
    return king < 0 || attacked(pos, king, side === 'w' ? 'b' : 'w');
  }

  function pseudoMoves(pos, from, sideOverride = pos.turn) {
    const piece = pos.board[from];
    if (piece === '.' || color(piece) !== sideOverride) return [];
    const kind = piece.toUpperCase(), side = sideOverride, row = Math.floor(from / 8), col = from % 8;
    const result = [];
    const add = (to, extras = {}) => result.push({ from, to, ...extras });
    const canLand = (to) => pos.board[to] === '.' || color(pos.board[to]) !== side;

    if (kind === 'P') {
      const direction = side === 'w' ? -1 : 1, startRow = side === 'w' ? 6 : 1, lastRow = side === 'w' ? 0 : 7;
      const nextRow = row + direction;
      if (inside(nextRow, col) && pos.board[idx(nextRow,col)] === '.') {
        if (nextRow === lastRow) for (const type of ['Q','R','B','N']) add(idx(nextRow,col), { promotion: side === 'w' ? type : type.toLowerCase() });
        else add(idx(nextRow,col));
        const twiceRow = row + 2 * direction;
        if (row === startRow && pos.board[idx(twiceRow,col)] === '.') add(idx(twiceRow,col), { doublePawn: true });
      }
      for (const dc of [-1,1]) {
        const r = row + direction, c = col + dc;
        if (!inside(r,c)) continue;
        const to = idx(r,c), target = pos.board[to];
        if ((target !== '.' && color(target) !== side) || (side === pos.turn && to === pos.ep)) {
          const extras = side === pos.turn && to === pos.ep && target === '.' ? { enPassant: true } : {};
          if (r === lastRow) for (const type of ['Q','R','B','N']) add(to, { ...extras, promotion: side === 'w' ? type : type.toLowerCase() });
          else add(to, extras);
        }
      }
      return result;
    }

    if (kind === 'N' || kind === 'K') {
      const offsets = kind === 'N' ? [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] : [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr,dc] of offsets) {
        const r = row + dr, c = col + dc;
        if (inside(r,c) && canLand(idx(r,c))) add(idx(r,c));
      }
      if (kind === 'K' && side === pos.turn && !inCheck(pos, side)) {
        const home = side === 'w' ? 60 : 4, rightShort = side === 'w' ? 'K' : 'k', rightLong = side === 'w' ? 'Q' : 'q';
        const rook = side === 'w' ? 'R' : 'r';
        if (from === home && pos.castling.includes(rightShort) && pos.board[home + 1] === '.' && pos.board[home + 2] === '.' && pos.board[home + 3] === rook && !attacked(pos, home + 1, side === 'w' ? 'b' : 'w') && !attacked(pos, home + 2, side === 'w' ? 'b' : 'w')) add(home + 2, { castle: 'short' });
        if (from === home && pos.castling.includes(rightLong) && pos.board[home - 1] === '.' && pos.board[home - 2] === '.' && pos.board[home - 3] === '.' && pos.board[home - 4] === rook && !attacked(pos, home - 1, side === 'w' ? 'b' : 'w') && !attacked(pos, home - 2, side === 'w' ? 'b' : 'w')) add(home - 2, { castle: 'long' });
      }
      return result;
    }

    const directions = kind === 'B' ? [[-1,-1],[-1,1],[1,-1],[1,1]] : kind === 'R' ? [[-1,0],[1,0],[0,-1],[0,1]] : [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (const [dr,dc] of directions) {
      let r = row + dr, c = col + dc;
      while (inside(r,c)) {
        const to = idx(r,c), target = pos.board[to];
        if (target === '.') add(to);
        else { if (color(target) !== side) add(to); break; }
        r += dr; c += dc;
      }
    }
    return result;
  }

  function applyMove(pos, move) {
    const next = clone(pos), piece = next.board[move.from], captured = move.enPassant ? next.board[move.to + (pos.turn === 'w' ? 8 : -8)] : next.board[move.to];
    next.board[move.from] = '.';
    if (move.enPassant) next.board[move.to + (pos.turn === 'w' ? 8 : -8)] = '.';
    next.board[move.to] = move.promotion || piece;
    if (move.castle) {
      const rookFrom = move.castle === 'short' ? move.to + 1 : move.to - 2;
      const rookTo = move.castle === 'short' ? move.to - 1 : move.to + 1;
      next.board[rookTo] = next.board[rookFrom]; next.board[rookFrom] = '.';
    }
    let rights = next.castling;
    const removeRights = (chars) => { for (const char of chars) rights = rights.replace(char, ''); };
    if (piece === 'K') removeRights('KQ'); if (piece === 'k') removeRights('kq');
    if (move.from === 0 || move.to === 0) removeRights('q'); if (move.from === 7 || move.to === 7) removeRights('k');
    if (move.from === 56 || move.to === 56) removeRights('Q'); if (move.from === 63 || move.to === 63) removeRights('K');
    next.castling = rights;
    next.ep = move.doublePawn ? (move.from + move.to) / 2 : -1;
    next.halfmove = piece.toUpperCase() === 'P' || captured !== '.' ? 0 : pos.halfmove + 1;
    if (pos.turn === 'b') next.fullmove += 1;
    next.turn = pos.turn === 'w' ? 'b' : 'w';
    return next;
  }

  function legalMoves(pos, from, sideOverride = color(pos.board[from])) {
    const movingSide = sideOverride;
    return pseudoMoves(pos, from, movingSide).filter((move) => !inCheck(applyMove(pos, move), movingSide));
  }

  function allLegalMoves(pos) {
    const moves = [];
    pos.board.forEach((piece, from) => { if (piece !== '.' && color(piece) === pos.turn) moves.push(...legalMoves(pos, from)); });
    return moves;
  }

  function currentFen(pos) {
    const rows = [];
    for (let row = 0; row < 8; row += 1) {
      let line = '', empty = 0;
      for (let col = 0; col < 8; col += 1) {
        const piece = pos.board[idx(row,col)];
        if (piece === '.') empty += 1;
        else { if (empty) line += empty; line += piece; empty = 0; }
      }
      if (empty) line += empty;
      rows.push(line);
    }
    return `${rows.join('/')} ${pos.turn} ${pos.castling || '-'} ${pos.ep < 0 ? '-' : squareName(pos.ep)} ${pos.halfmove} ${pos.fullmove}`;
  }

  function positionFromFen(fen) {
    const fields = fen.trim().split(/\s+/);
    if (fields.length < 4) throw new Error('A posição FEN no PGN está incompleta.');
    const rows = fields[0].split('/');
    if (rows.length !== 8) throw new Error('A posição FEN precisa ter oito fileiras.');
    const board = [];
    for (const row of rows) {
      let count = 0;
      for (const char of row) {
        if (/^[1-8]$/.test(char)) { const spaces = Number(char); count += spaces; board.push(...'.'.repeat(spaces)); }
        else if (/^[prnbqkPRNBQK]$/.test(char)) { count += 1; board.push(char); }
        else throw new Error('A posição FEN contém uma peça inválida.');
      }
      if (count !== 8) throw new Error('Cada fileira da posição FEN precisa ter oito casas.');
    }
    if (fields[1] !== 'w' && fields[1] !== 'b') throw new Error('O lado a jogar na posição FEN é inválido.');
    if (board.filter((piece) => piece === 'K').length !== 1 || board.filter((piece) => piece === 'k').length !== 1) throw new Error('A posição FEN precisa conter exatamente um rei de cada cor.');
    const ep = fields[3] === '-' ? -1 : /^[a-h][36]$/.test(fields[3]) ? ('abcdefgh'.indexOf(fields[3][0]) + (8 - Number(fields[3][1])) * 8) : NaN;
    if (Number.isNaN(ep)) throw new Error('A casa en passant na posição FEN é inválida.');
    return { board, turn: fields[1], castling: fields[2] === '-' ? '' : fields[2], ep, halfmove: Number(fields[4] || 0), fullmove: Number(fields[5] || 1) };
  }

  function cleanMovetext(text) {
    let output = '', braceDepth = 0, variationDepth = 0, lineComment = false, comment = '', commentVariationDepth = 0;
    for (const char of text) {
      if (lineComment) { if (char === '\n') { lineComment = false; output += ' '; } continue; }
      if (braceDepth) {
        if (char === '{') braceDepth += 1;
        else if (char === '}') {
          braceDepth -= 1;
          if (!braceDepth) {
            const clock = comment.match(/\[%clk\s+([^\]]+)\]/i)?.[1]?.trim();
            if (clock && commentVariationDepth === 0) output += ` __CLOCK__${clock.replace(/\s+/g, '')} `;
            comment = '';
          }
        } else comment += char;
        continue;
      }
      if (char === '{') { braceDepth = 1; comment = ''; commentVariationDepth = variationDepth; output += ' '; continue; }
      if (char === ';') { lineComment = true; continue; }
      if (char === '(') { variationDepth += 1; continue; }
      if (char === ')' && variationDepth) { variationDepth -= 1; continue; }
      if (!variationDepth) output += char;
    }
    return output.replace(/\$\d+/g, ' ');
  }

  function formatClockAnnotation(value) {
    const parts = String(value || '').split(':');
    if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d+(?:\.\d+)?$/.test(part))) return '';
    const seconds = Math.floor(parts.length === 3
      ? Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2])
      : Number(parts[0]) * 60 + Number(parts[1]));
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds % 3600 / 60), remainder = seconds % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  function formatGameDateTime(date) {
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return '';
    const day = date.toLocaleDateString('pt-BR');
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${day} às ${time}`;
  }

  function pgnGameDateTime(headers) {
    const utcDate = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(headers?.UTCDate || '');
    const utcTime = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(headers?.UTCTime || '');
    if (utcDate && utcTime) {
      const [, year, month, day] = utcDate.map(Number);
      const [, hour, minute, second = '0'] = utcTime;
      const timestamp = new Date(Date.UTC(year, month - 1, day, Number(hour), Number(minute), Number(second)));
      if (timestamp.getUTCFullYear() === year && timestamp.getUTCMonth() === month - 1 && timestamp.getUTCDate() === day) return formatGameDateTime(timestamp);
    }
    return headers?.Date && headers.Date !== '????.??.??' ? headers.Date.replaceAll('.', '-') : '';
  }

  function sanToMove(pos, san) {
    let token = san.normalize('NFKC').trim().replace(/[‐‑‒–—−]/g, '-').replace(/[!?+#]+$/g, '').replace(/e\.p\.$/i, '').trim();
    const castleToken = token.toUpperCase().replace(/0/g, 'O').replace(/-/g, '');
    if (castleToken === 'OO' || castleToken === 'OOO') {
      const long = castleToken.length === 3;
      const from = pos.turn === 'w' ? 60 : 4, to = from + (long ? -2 : 2);
      return legalMoves(pos, from).find((move) => move.to === to && move.castle) || null;
    }
    token = token.replace(/([a-h][18])=?([QRBNqrbn])$/, (_, square, piece) => `${square}=${piece.toUpperCase()}`); // "e8Q" → "e8=Q"
    const promotionMatch = token.match(/=([QRBN])$/i);
    const promotion = promotionMatch ? promotionMatch[1].toUpperCase() : '';
    if (promotionMatch) token = token.slice(0, promotionMatch.index);
    const destinationMatch = token.match(/([a-h][1-8])$/i);
    if (!destinationMatch) return null;
    const to = 'abcdefgh'.indexOf(destinationMatch[1][0].toLowerCase()) + (8 - Number(destinationMatch[1][1])) * 8;
    let prefix = token.slice(0, destinationMatch.index), pieceType = 'P';
    if (/^[KQRBN]/.test(prefix)) { pieceType = prefix[0]; prefix = prefix.slice(1); }
    const capture = prefix.includes('x'); prefix = prefix.replace(/x/g, '');
    if (!/^[a-h]?[1-8]?$/.test(prefix)) return null;
    const fromFile = /[a-h]/.test(prefix) ? 'abcdefgh'.indexOf(prefix.match(/[a-h]/)[0]) : -1;
    const fromRank = /[1-8]/.test(prefix) ? Number(prefix.match(/[1-8]/)[0]) : -1;
    const candidates = [], looseCandidates = []; // looseCandidates: lances que só divergem do "x" (alguns programas o omitem)
    pos.board.forEach((piece, from) => {
      if (piece === '.' || color(piece) !== pos.turn || piece.toUpperCase() !== pieceType) return;
      if (fromFile >= 0 && from % 8 !== fromFile) return;
      if (fromRank >= 0 && 8 - Math.floor(from / 8) !== fromRank) return;
      for (const move of legalMoves(pos, from)) {
        if (move.to !== to) continue;
        const isCapture = pos.board[to] !== '.' || move.enPassant;
        const actualPromotion = move.promotion ? move.promotion.toUpperCase() : '';
        if (actualPromotion !== promotion) continue;
        if (capture !== Boolean(isCapture)) { looseCandidates.push(move); continue; }
        candidates.push(move);
      }
    });
    if (candidates.length === 1) return candidates[0];
    return !candidates.length && looseCandidates.length === 1 && !pieceTypeIsPawnWithoutFile(pieceType, prefix) ? looseCandidates[0] : null;
  }

  // Peão sem coluna de origem ("d5") nunca pode ser tomado como captura implícita; "ed5" pode.
  function pieceTypeIsPawnWithoutFile(pieceType, prefix) { return pieceType === 'P' && !/[a-h]/.test(prefix); }

  // Posição FEN colada sozinha (sem lances): abre o tabuleiro livre naquela posição.
  const fenOnlyPattern = /^\s*[prnbqkPRNBQK1-8]+(?:\/[prnbqkPRNBQK1-8]+){7}\s+[wb](?:\s|$)/;
  function positionFromUserFen(fen) {
    const pos = positionFromFen(fen);
    if (pos.board.some((piece, square) => piece.toUpperCase() === 'P' && (square < 8 || square > 55))) throw new Error('A posição FEN é ilegal: há peão na primeira ou na última fileira.');
    if (inCheck(pos, pos.turn === 'w' ? 'b' : 'w')) throw new Error('A posição FEN é ilegal: o lado que não joga está em xeque.');
    return pos;
  }

  // Um arquivo PGN pode ter várias partidas. Só a primeira é carregada, e os cabeçalhos das demais
  // não podem se misturar aos dela (ratings, FEN inicial, jogadores).
  function isolateFirstGame(source) {
    const lines = source.split(/\r?\n/);
    const headerLine = /^\s*\[[A-Za-z0-9_]+\s+"/;
    let seenMovetext = false, cut = lines.length;
    for (let i = 0; i < lines.length; i += 1) {
      if (headerLine.test(lines[i])) { if (seenMovetext) { cut = i; break; } }
      else if (lines[i].trim()) seenMovetext = true;
    }
    const rest = lines.slice(cut).join('\n');
    const extra = (rest.match(/^\s*\[Event\s+"/gm) || []).length || (cut < lines.length ? 1 : 0);
    return { text: lines.slice(0, cut).join('\n'), extra };
  }

  function parsePgn(source) {
    source = source.replace(/^\uFEFF/, '');
    if (!source.trim()) throw new Error('O conteúdo PGN está vazio.');
    const firstGame = isolateFirstGame(source);
    source = firstGame.text;
    const headers = {};
    const movetext = source.replace(/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\s*\]\s*$/gm, (_, key, value) => {
      headers[key] = value.replace(/\\"/g, '"').replace(/\\\\/g, '\\'); return ' ';
    });
    const startPosition = headers.SetUp === '1' && headers.FEN ? positionFromUserFen(headers.FEN) : initial();
    const tokens = cleanMovetext(movetext).split(/\s+/).filter(Boolean);
    const resultTokens = new Set(['1-0', '0-1', '1/2-1/2', '*']);
    const parsedHistory = [{ position: clone(startPosition), move: null, san: '', side: startPosition.turn, moveNumber: startPosition.fullmove }];
    let current = clone(startPosition), result = headers.Result || '*', ply = 0;
    for (const rawToken of tokens) {
      if (rawToken.startsWith('__CLOCK__')) {
        const clock = formatClockAnnotation(rawToken.slice('__CLOCK__'.length));
        if (clock && parsedHistory.length > 1) parsedHistory.at(-1).clock = clock;
        continue;
      }
      let token = rawToken.replace(/^\d+(?:\.{1,3}|…)/, '');
      if (!token || /^\d+(?:\.{1,3}|…)$/.test(token)) continue;
      if (/^e\.p\.$/i.test(token)) continue;
      if (resultTokens.has(token)) { result = token; break; }
      token = token.replace(/^(?:\.\.\.|…)/, '');
      if (!token) continue;
      const move = sanToMove(current, token);
      if (!move) {
        const castleToken = token.normalize('NFKC').toUpperCase().replace(/[‐‑‒–—−]/g, '-').replace(/0/g, 'O').replace(/-/g, '');
        if (castleToken === 'OO' || castleToken === 'OOO') {
          throw new Error(`O roque “${rawToken}” (lance ${ply + 1}) não é legal na posição reconstruída. Confira os lances anteriores, o lado a jogar e os direitos de roque no PGN.`);
        }
        throw new Error(`Não consegui interpretar o lance “${rawToken}” (lance ${ply + 1}). Confira a notação PGN.`);
      }
      const side = current.turn, moveNumber = current.fullmove;
      current = applyMove(current, move); ply += 1;
      parsedHistory.push({ position: clone(current), move: cloneMove(move), san: token, side, moveNumber });
    }
    if (ply === 0) throw new Error('Não encontrei lances válidos no PGN.');
    return { history: parsedHistory, headers, result, extraGames: firstGame.extra };
  }

  function moveToSan(pos, move) {
    const piece = pos.board[move.from], kind = piece.toUpperCase();
    if (move.castle) return move.castle === 'short' ? 'O-O' : 'O-O-O';
    const capture = pos.board[move.to] !== '.' || move.enPassant;
    let san = kind === 'P' ? '' : kind;
    if (kind !== 'P') {
      const alternatives = allLegalMoves(pos).filter((other) => other.to === move.to && other.from !== move.from && pos.board[other.from].toUpperCase() === kind);
      if (alternatives.length) {
        const sameFile = alternatives.some((other) => other.from % 8 === move.from % 8);
        const sameRank = alternatives.some((other) => Math.floor(other.from / 8) === Math.floor(move.from / 8));
        san += !sameFile ? 'abcdefgh'[move.from % 8] : !sameRank ? String(8 - Math.floor(move.from / 8)) : squareName(move.from);
      }
    } else if (capture) san += 'abcdefgh'[move.from % 8];
    if (capture) san += 'x';
    san += squareName(move.to);
    if (move.promotion) san += `=${move.promotion.toUpperCase()}`;
    const next = applyMove(pos, move), replies = allLegalMoves(next);
    if (inCheck(next, next.turn)) san += replies.length ? '+' : '#';
    return san;
  }

  const qualityMarks = {
    brilliant: '✦', great: '👍', best: '♛', excellent: '⚡', good: '✓',
    inaccuracy: '?!', mistake: '?', blunder: '??', missed: '×', unknown: '—'
  };

  function qualityKindForDisplay(quality) {
    return quality?.label === 'Chance perdida' ? 'missed' : quality?.kind || 'unknown';
  }

  function qualityMark(quality) {
    if (!quality) return { symbol: '·', title: 'Ainda não analisado', kind: 'pending' };
    const kind = qualityKindForDisplay(quality);
    return { symbol: qualityMarks[kind] || '·', title: quality.label, kind };
  }

  function updateMoveQualityMark(index, quality) {
    const button = moveListElement.querySelector(`[data-move-index="${index}"]`);
    if (!button) return;
    const mark = qualityMark(quality);
    const symbol = button.querySelector('.move-quality-symbol');
    if (!symbol) return;
    symbol.replaceChildren();
    const icon = createBoardQualityIcon(mark.kind);
    if (icon) symbol.append(icon); else symbol.textContent = mark.symbol;
    symbol.className = `move-quality-symbol quality-mark-${mark.kind}`;
    symbol.title = mark.title;
    button.setAttribute('aria-label', `Ir para ${button.dataset.moveNumber}${button.dataset.moveSide === 'w' ? ' brancas' : ' pretas'}: ${button.dataset.moveSan}. Qualidade: ${mark.title}.`);
  }

  function boardQualitySymbol(quality) {
    if (quality?.label === 'Chance perdida') return '×';
    return ({ brilliant: '★', great: '👍', best: '♛', excellent: '⚡', good: '✓', inaccuracy: '?!', mistake: '?', blunder: '??', missed: '×' })[quality?.kind] || '✓';
  }

  function createBoardQualityIcon(kind) {
    const paths = {
      brilliant: 'M12 1.8 14.9 8l6.8.8-5 4.7 1.3 6.7-6-3.4-6 3.4 1.2-6.7-5-4.7L9 8z',
      great: 'M2 10h4v11H2zM22 10c0-1.1-.9-2-2-2h-6.3l1-4.6V3c0-.4-.2-.8-.5-1.1L13 1 6.6 7.5C6.2 7.9 6 8.4 6 9v10c0 1.1.9 2 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7z',
      best: 'M3 19h18v2H3zm2-3L3 5l5 4 4-7 4 7 5-4-2 11z',
      excellent: 'M13.5 1 4 14h6l-.8 9L20 10h-6z',
      good: 'm9.2 16.2-4.1-4.1-1.8 1.8 5.9 5.9L21 8l-1.8-1.8z'
    };
    const path = paths[kind];
    if (!path) return null;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList.add('board-quality-icon');
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', path);
    icon.append(shape);
    return icon;
  }

  function setGameReviewQualityBadge(quality) {
    const kind = qualityKindForDisplay(quality);
    const panelKinds = ['best', 'excellent', 'good', 'great', 'brilliant', 'inaccuracy', 'mistake', 'blunder', 'missed', 'unknown'];
    gameReviewQuality.classList.remove(...panelKinds.map((item) => `quality-panel-${item}`));
    gameReviewQuality.classList.add(`quality-panel-${kind}`);
    gameReviewBadge.className = `move-quality-badge quality-${kind}`;
    gameReviewBadge.replaceChildren();
    const icon = createBoardQualityIcon(kind);
    if (icon) gameReviewBadge.append(icon);
    else {
      const symbol = document.createElement('span');
      symbol.className = 'quality-card-symbol';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = boardQualitySymbol({ ...quality, kind });
      gameReviewBadge.append(symbol);
    }
    const label = document.createElement('span');
    label.textContent = quality.label;
    gameReviewBadge.append(label);
  }

  function renderBoardQualityMarker() {
    boardElement.querySelectorAll('.board-quality-marker').forEach((marker) => marker.remove());
    boardElement.querySelectorAll('.quality-reviewed-square').forEach((square) => square.classList.remove('quality-reviewed-square'));
    const reviewed = gameReviewResults[historyIndex];
    const entry = reviewed?.quality && reviewed?.playedMove
      ? { fen: currentFen(position), move: reviewed.playedMove, quality: reviewed.quality }
      : currentBoardQuality;
    if (!entry?.quality || entry.fen !== currentFen(position) || !entry.move) return;
    const square = boardElement.querySelector(`[data-square="${entry.move.to}"]`);
    if (!square) return;
    square.classList.add('quality-reviewed-square');
    const marker = document.createElement('span');
    const markerKind = entry.quality.label === 'Chance perdida' ? 'missed' : entry.quality.kind;
    marker.className = `board-quality-marker quality-${markerKind}`;
    const icon = createBoardQualityIcon(markerKind);
    if (icon) marker.append(icon);
    else marker.textContent = boardQualitySymbol(entry.quality);
    marker.title = `Qualidade do lance ${entry.move.san}: ${entry.quality.label}`;
    marker.setAttribute('aria-label', marker.title);
    square.setAttribute('aria-label', `${square.getAttribute('aria-label')}. Qualidade do lance ${entry.move.san}: ${entry.quality.label}.`);
    square.append(marker);
  }

  function renderMoveList() {
    moveListElement.replaceChildren();
    const players = [gameHeaders.White, gameHeaders.Black].filter((player) => player && player !== '?').join(' × ');
    const event = gameHeaders.Event && gameHeaders.Event !== '?' ? gameHeaders.Event : '';
    gameDetails.textContent = [event, players, variationSession ? 'Modo de variação' : gameResult !== '*' ? gameResult : 'Partida local'].filter(Boolean).join(' · ');
    const outcome = getPlayerOutcome(gameHeaders, gameResult);
    gameOutcomeIndicator.hidden = !outcome;
    gameOutcomeIndicator.replaceChildren();
    if (outcome) gameOutcomeIndicator.append(createOutcomeBadge(outcome));
    const groups = new Map();
    history.slice(1).forEach((entry, offset) => {
      const key = entry.moveNumber;
      if (!groups.has(key)) groups.set(key, { number: key, white: null, black: null });
      groups.get(key)[entry.side === 'w' ? 'white' : 'black'] = { entry, index: offset + 1 };
    });
    if (!groups.size) {
      const empty = document.createElement('p'); empty.className = 'move-list-empty';
      empty.textContent = 'Importe uma partida PGN para ver e navegar pelos lances.'; moveListElement.append(empty); return;
    }
    for (const group of groups.values()) {
      const pair = document.createElement('div'); pair.className = 'move-pair';
      const number = document.createElement('span'); number.className = 'move-number'; number.textContent = `${group.number}${group.white ? '.' : '…'}`; pair.append(number);
      for (const side of ['white', 'black']) {
        const item = group[side];
        if (!item) continue;
        const button = document.createElement('button'); button.type = 'button'; button.className = 'move-entry';
        const reviewed = gameReviewResults[item.index]?.quality;
        const mark = qualityMark(reviewed);
        button.dataset.moveIndex = String(item.index); button.dataset.moveNumber = String(group.number);
        button.dataset.moveSide = item.entry.side; button.dataset.moveSan = item.entry.san;
        const san = document.createElement('span'); san.className = 'move-entry-san'; san.textContent = item.entry.san;
        const symbol = document.createElement('span'); symbol.className = `move-quality-symbol quality-mark-${mark.kind}`;
        const qualityIcon = createBoardQualityIcon(mark.kind);
        if (qualityIcon) symbol.append(qualityIcon); else symbol.textContent = mark.symbol;
        symbol.title = mark.title; symbol.setAttribute('aria-hidden', 'true');
        button.append(san, symbol);
        button.setAttribute('aria-label', `Ir para ${group.number}${side === 'white' ? ' brancas' : ' pretas'}: ${item.entry.san}. Qualidade: ${mark.title}.`);
        button.setAttribute('aria-pressed', String(item.index === historyIndex));
        if (item.index === historyIndex) button.classList.add('current');
        button.addEventListener('click', () => goTo(item.index)); pair.append(button);
      }
      moveListElement.append(pair);
    }
  }

  function renderBestMoves(analysis) {
    arrowAnalysis = analysis?.fen && analysis.fen === currentFen(position) ? analysis : null;
    renderBoardArrows();
    bestMovesList.replaceChildren();
    if (!analysis?.fen) { bestMovesPanel.hidden = true; updateMoveAnalysisPanels(); return; }
    let root;
    try { root = positionFromFen(analysis.fen); } catch { bestMovesPanel.hidden = true; updateMoveAnalysisPanels(); return; }
    const candidates = [];
    const add = (token, pv, score) => {
      const first = String(token || String(pv || '').trim().split(/\s+/)[0] || '');
      if (!first || candidates.some((entry) => entry.token === first)) return;
      const move = parseUciMove(root, first);
      if (!move) return;
      candidates.push({ token: first, san: moveToSan(root, move), pv: pv || first, score: score || null });
    };
    add(analysis.bestMove, analysis.pvUci || analysis.pv, analysis.score);
    for (const line of analysis.variations || []) {
      const pv = String(line.pv || '').trim();
      add(pv.split(/\s+/)[0], pv, line.score);
      if (candidates.length >= 3) break;
    }
    if (!candidates.length) { bestMovesPanel.hidden = true; updateMoveAnalysisPanels(); return; }
    candidates.slice(0, 3).forEach((candidate, index) => {
      const item = document.createElement('li'); item.className = `best-move-option best-move-option-${index + 1}`;
      const heading = document.createElement('div'); heading.className = 'best-move-option-heading';
      const rank = document.createElement('span'); rank.className = 'best-move-rank'; rank.textContent = String(index + 1);
      const san = document.createElement('strong'); san.textContent = candidate.san;
      const evaluation = document.createElement('span'); evaluation.className = 'best-move-evaluation';
      const score = candidate.score || (index === 0 ? analysis.score : null);
      evaluation.textContent = score ? formatEvaluationForSide(score, analysis.turn || root.turn, root.turn) : '—';
      heading.append(rank, san, evaluation);
      const line = document.createElement('p'); line.textContent = formatPrincipalVariation(analysis.fen, candidate.pv);
      item.append(heading, line); bestMovesList.append(item);
    });
    bestMovesMeta.textContent = candidates.length > 1 ? `${candidates.length} linhas · Stockfish` : 'Stockfish';
    bestMovesPanel.hidden = false;
    updateMoveAnalysisPanels();
  }

  function renderGameClocks() {
    const hasClockData = history.some((entry) => entry.clock);
    gameClocks.hidden = !hasClockData;
    if (!hasClockData) return;
    const initialTime = String(gameHeaders.TimeControl || '').split(':')[0].match(/(?:\d+\/)?(\d+)(?:\+\d+)?/)?.[1];
    let whiteTime = initialTime ? formatClockAnnotation(`0:${initialTime}`) : '';
    let blackTime = whiteTime;
    for (const entry of history.slice(1, historyIndex + 1)) {
      if (!entry.clock) continue;
      if (entry.side === 'w') whiteTime = entry.clock;
      else blackTime = entry.clock;
    }
    whiteClock.textContent = whiteTime || '—:——';
    blackClock.textContent = blackTime || '—:——';
    whiteClock.closest('.game-clock').classList.toggle('active', position.turn === 'w');
    blackClock.closest('.game-clock').classList.toggle('active', position.turn === 'b');
  }

  function render() {
    const moveAnimation = pendingMoveAnimation;
    pendingMoveAnimation = null;
    activeMoveAnimationCleanup?.();
    const sourceSquareBeforeRender = moveAnimation ? boardElement.querySelector(`[data-square="${moveAnimation.from}"]`) : null;
    const sourcePieceBeforeRender = sourceSquareBeforeRender?.querySelector('.piece');
    const sourceRectBeforeRender = sourcePieceBeforeRender?.getBoundingClientRect();
    const movingPieceClone = sourcePieceBeforeRender?.cloneNode(true);
    const active = document.activeElement;
    const refocusSquare = active?.closest?.('.chessboard') && active.dataset?.square !== undefined ? Number(active.dataset.square) : null;
    const refocusMove = Boolean(active?.classList?.contains('move-entry'));
    const dockFocus = active && moveDock.contains(active) ? active : null;
    boardElement.replaceChildren();
    const rows = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
    const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
    const legalTargetSquares = new Set(legalTargets.map((move) => move.to));
    for (const row of rows) {
      const rowElement = document.createElement('div'); rowElement.className = 'board-row'; rowElement.setAttribute('role', 'row'); boardElement.append(rowElement);
      for (const col of cols) {
      const square = idx(row,col), piece = position.board[square], button = document.createElement('button');
      button.type = 'button'; button.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      button.dataset.square = square; button.setAttribute('role', 'gridcell'); button.tabIndex = square === boardFocusSquare ? 0 : -1;
      button.setAttribute('aria-label', `${squareName(square)}${piece === '.' ? ', vazia' : `, ${pieceName(piece)}`}`);
      button.innerHTML = pieceMarkup(piece);
      if (square === selected) button.classList.add('selected');
      if (legalTargetSquares.has(square)) button.classList.add(position.board[square] === '.' ? 'legal-target' : 'legal-capture');
      if (lastMove && (square === lastMove.from || square === lastMove.to)) button.classList.add('last-move');
      rowElement.append(button);
    }
    }
    const arrowLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowLayer.classList.add('board-arrow-layer');
    arrowLayer.setAttribute('viewBox', '0 0 800 800');
    arrowLayer.setAttribute('aria-hidden', 'true');
    boardElement.append(arrowLayer);
    renderBoardArrows(arrowLayer);
    if (movingPieceClone && sourceRectBeforeRender && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      const destinationSquare = boardElement.querySelector(`[data-square="${moveAnimation.to}"]`);
      const destinationPiece = destinationSquare?.querySelector('.piece');
      const destinationRect = destinationSquare?.getBoundingClientRect();
      if (destinationSquare && destinationPiece && destinationRect) {
        const animationLayer = document.createElement('div');
        animationLayer.className = 'move-animation-layer';
        const layerRect = boardWrapElement.getBoundingClientRect();
        const startX = sourceRectBeforeRender.left - layerRect.left;
        const startY = sourceRectBeforeRender.top - layerRect.top;
        const endX = destinationRect.left - layerRect.left + (destinationRect.width - sourceRectBeforeRender.width) / 2;
        const endY = destinationRect.top - layerRect.top + (destinationRect.height - sourceRectBeforeRender.height) / 2;
        movingPieceClone.style.cssText = `position:absolute;left:${startX}px;top:${startY}px;width:${sourceRectBeforeRender.width}px;height:${sourceRectBeforeRender.height}px;z-index:1;pointer-events:none;transition:none;`;
        movingPieceClone.style.willChange = 'transform';
        boardWrapElement.append(animationLayer);
        animationLayer.append(movingPieceClone);
        destinationPiece.style.visibility = 'hidden';
        let cleaned = false;
        const cleanup = () => {
          if (cleaned) return;
          cleaned = true;
          movingPieceClone.remove();
          animationLayer.remove();
          if (destinationPiece.isConnected) destinationPiece.style.visibility = '';
          if (activeMoveAnimationCleanup === cleanup) activeMoveAnimationCleanup = null;
        };
        activeMoveAnimationCleanup = cleanup;
        const animation = movingPieceClone.animate([
          { transform: 'translate(0, 0)' },
          { transform: `translate(${endX - startX}px, ${endY - startY}px)` }
        ], { duration: 280, easing: 'cubic-bezier(.2,.7,.25,1)' });
        animation.onfinish = cleanup;
        animation.oncancel = cleanup;
      }
    }
    rankLabels.replaceChildren(...rows.map((row) => { const label = document.createElement('span'); label.textContent = String(8 - row); return label; }));
    fileLabels.replaceChildren(...cols.map((col) => { const label = document.createElement('span'); label.textContent = 'abcdefgh'[col]; return label; }));
    turnLabel.lastChild.textContent = position.turn === 'w' ? ' Vez das brancas' : ' Vez das pretas';
    const legal = allLegalMoves(position), checked = inCheck(position, position.turn);
    if (!legal.length) turnLabel.lastChild.textContent = checked ? ' Xeque-mate' : ' Afogamento';
    positionName.textContent = historyIndex === 0 ? 'POSIÇÃO INICIAL' : `APÓS ${historyIndex} ${historyIndex === 1 ? 'LANCE' : 'LANCES'}`;
    moveCount.textContent = `Posição ${historyIndex} / ${history.length - 1}`;
    moveDock.hidden = history.length < 2;
    document.body.classList.toggle('has-game', history.length >= 2);
    fenLabel.textContent = currentFen(position);
    variationBanner.hidden = !variationSession;
    renderGameClocks();
    renderMoveList();
    navButtons.first.disabled = historyIndex === 0; navButtons.previous.disabled = historyIndex === 0;
    navButtons.next.disabled = historyIndex >= history.length - 1; navButtons.last.disabled = historyIndex >= history.length - 1;
    bestMoveCaption.textContent = `MELHOR LANCE · ${position.turn === 'w' ? 'BRANCAS' : 'PRETAS'} A JOGAR`;
    renderGameReviewAtCurrentPosition();
    renderBoardQualityMarker();
    updateAdvantageChartSelection();
    updateAnalysisControls();
    // Como o tabuleiro e a lista são recriados, devolve o foco a quem o tinha (teclado e leitor de tela).
    if (refocusSquare !== null) boardElement.querySelector(`[data-square="${refocusSquare}"]`)?.focus({ preventScroll: true });
    else if (refocusMove) moveListElement.querySelector('.move-entry.current')?.focus({ preventScroll: true });
    else if (dockFocus?.disabled) {
      const order = (dockFocus === navButtons.next || dockFocus === navButtons.last) ? [navButtons.previous, navButtons.next] : [navButtons.next, navButtons.previous];
      order.find((button) => !button.disabled)?.focus({ preventScroll: true });
    }
  }

  function renderBoardArrows(layer = boardElement.querySelector('.board-arrow-layer')) {
    if (!layer) return;
    const fen = currentFen(position);
    if (manualAnnotationFen !== fen) { manualAnnotationFen = fen; manualArrows = []; highlightedSquare = -1; }
    const namespace = 'http://www.w3.org/2000/svg';
    layer.querySelectorAll('.board-arrow-drawing').forEach((node) => node.remove());
    const squarePoint = (square) => {
      const row = Math.floor(square / 8), col = square % 8;
      const x = ((flipped ? 7 - col : col) + 0.5) * 100;
      const y = ((flipped ? 7 - row : row) + 0.5) * 100;
      return [x, y];
    };
    const drawArrow = (from, to, kind, label) => {
      if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from > 63 || to > 63) return;
      const [x1, y1] = squarePoint(from), [x2, y2] = squarePoint(to);
      const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
      const ux = dx / length, uy = dy / length;
      const unitsPerPixel = 800 / Math.max(1, boardElement.getBoundingClientRect().width);
      const headLength = 24 * unitsPerPixel, halfWidth = 12 * unitsPerPixel;
      const baseX = x2 - ux * headLength, baseY = y2 - uy * headLength;
      const lineOverlap = 1.5 * unitsPerPixel;
      const line = document.createElementNS(namespace, 'line');
      line.setAttribute('x1', String(x1)); line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(baseX + ux * lineOverlap));
      line.setAttribute('y2', String(baseY + uy * lineOverlap));
      line.setAttribute('class', `board-arrow-drawing board-arrow-${kind}`);
      line.setAttribute('aria-label', label);
      const px = -uy * halfWidth, py = ux * halfWidth;
      const head = document.createElementNS(namespace, 'path');
      head.setAttribute('d', `M ${x2} ${y2} L ${baseX + px} ${baseY + py} L ${baseX - px} ${baseY - py} Z`);
      head.setAttribute('class', `board-arrow-drawing board-arrow-head board-arrow-${kind}`);
      head.setAttribute('fill', kind === 'manual' ? '#e3a832' : kind === 'best' ? '#37d4a0' : '#62a9ee');
      head.setAttribute('stroke', 'none');
      layer.append(line, head);
    };
    if (highlightedSquare >= 0) {
      const [x, y] = squarePoint(highlightedSquare);
      const squareHighlight = document.createElementNS(namespace, 'rect');
      squareHighlight.setAttribute('x', String(x - 50)); squareHighlight.setAttribute('y', String(y - 50));
      squareHighlight.setAttribute('width', '100'); squareHighlight.setAttribute('height', '100');
      squareHighlight.setAttribute('class', 'board-arrow-drawing board-square-highlight'); layer.append(squareHighlight);
    }
    manualArrows.forEach(({ from, to }) => drawArrow(from, to, 'manual', 'Flecha manual'));
    const candidates = [];
    const add = (token, kind) => {
      const match = String(token || '').match(/^([a-h][1-8])([a-h][1-8])/);
      if (!match) return;
      const idxFrom = (8 - Number(match[1][1])) * 8 + match[1].charCodeAt(0) - 97;
      const idxTo = (8 - Number(match[2][1])) * 8 + match[2].charCodeAt(0) - 97;
      if (!candidates.some((item) => item.from === idxFrom && item.to === idxTo)) candidates.push({ from: idxFrom, to: idxTo, kind });
    };
    const visibleAnalysis = arrowAnalysis?.fen === fen ? arrowAnalysis : lookupAnalysis(fen, selectedDepth);
    if (stockfishArrowsEnabled && (visibleAnalysis?.fen === fen || visibleAnalysis?.bestMove)) {
      add(visibleAnalysis.bestMove || visibleAnalysis.pvUci || visibleAnalysis.pv, 'best');
      for (const variation of visibleAnalysis.variations || []) {
        add(String(variation.pv || '').trim().split(/\s+/)[0], 'alternative');
        if (candidates.length >= 3) break;
      }
    }
    candidates.forEach((move, index) => drawArrow(move.from, move.to, index ? 'alternative' : 'best', index ? `Alternativa ${index + 1} do Stockfish` : 'Melhor lance do Stockfish'));
  }

  function finishManualGesture(event, cancelled = false) {
    if (!manualGesture || manualGesture.pointerId !== event.pointerId) return;
    const gesture = manualGesture; manualGesture = null;
    clearTimeout(gesture.timer);
    if (cancelled || !gesture.armed) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.square');
    const to = target && boardElement.contains(target) ? Number(target.dataset.square) : gesture.from;
    if (to === gesture.from) highlightedSquare = highlightedSquare === to ? -1 : to;
    else {
      const existing = manualArrows.findIndex((arrow) => arrow.from === gesture.from && arrow.to === to);
      if (existing >= 0) manualArrows.splice(existing, 1);
      else manualArrows.push({ from: gesture.from, to });
    }
    suppressSquareClick = true;
    window.setTimeout(() => { suppressSquareClick = false; }, 250);
    renderBoardArrows();
  }

  function beginPointerDrag(event, square, origin) {
    const piece = position.board[square];
    if (event.button !== 0 || piece === '.' || color(piece) !== position.turn) return;
    pointerDrag = { pointerId: event.pointerId, from: square, origin, startX: event.clientX, startY: event.clientY, moved: false, target: null };
    selected = square; legalTargets = legalMoves(position, square);
    paintSelection(square);
    try { origin.setPointerCapture(event.pointerId); } catch {}
  }

  function paintSelection(square) {
    const targets = new Set(legalTargets.map((move) => move.to));
    for (const cell of boardElement.querySelectorAll('.square')) {
      const cellIndex = Number(cell.dataset.square);
      cell.classList.toggle('selected', cellIndex === square);
      const isTarget = targets.has(cellIndex);
      cell.classList.toggle('legal-target', isTarget && position.board[cellIndex] === '.');
      cell.classList.toggle('legal-capture', isTarget && position.board[cellIndex] !== '.');
    }
  }

  function updatePointerDrag(event) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    const dx = event.clientX - pointerDrag.startX, dy = event.clientY - pointerDrag.startY;
    if (!pointerDrag.moved && Math.hypot(dx, dy) < 7) return;
    pointerDrag.moved = true;
    event.preventDefault();
    queuedPointerPosition = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY };
    if (pointerMoveFrame) return;
    pointerMoveFrame = requestUiFrame(() => {
      pointerMoveFrame = 0;
      const point = queuedPointerPosition; queuedPointerPosition = null;
      if (!point || !pointerDrag || pointerDrag.pointerId !== point.pointerId) return;
      paintPointerDrag(point);
    });
  }

  function paintPointerDrag(point) {
    if (!pointerDrag || pointerDrag.pointerId !== point.pointerId) return;
    if (!pointerDrag.ghost) {
      const ghost = document.createElement('div'); ghost.className = 'piece-drag-ghost'; ghost.innerHTML = pieceMarkup(position.board[pointerDrag.from]);
      document.body.append(ghost); pointerDrag.ghost = ghost;
      document.body.classList.add('piece-pointer-dragging');
      pointerDrag.origin.classList.add('piece-being-dragged');
    }
    pointerDrag.ghost.style.transform = `translate3d(${point.clientX}px,${point.clientY}px,0) translate(-50%,-50%)`;
    const over = document.elementFromPoint(point.clientX, point.clientY)?.closest('.square');
    const targetIndex = over ? Number(over.dataset.square) : -1;
    if (pointerDrag.target && Number(pointerDrag.target.dataset.square) !== targetIndex) pointerDrag.target.classList.remove('drag-over');
    pointerDrag.target = over;
    if (over && legalTargets.some((move) => move.to === targetIndex)) over.classList.add('drag-over');
  }

  function finishPointerDrag(event, cancelled = false) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    if (pointerMoveFrame) cancelUiFrame(pointerMoveFrame);
    pointerMoveFrame = 0; queuedPointerPosition = null;
    const drag = pointerDrag; pointerDrag = null;
    document.body.classList.remove('piece-pointer-dragging');
    drag.ghost?.remove(); drag.origin.classList.remove('piece-being-dragged'); drag.target?.classList.remove('drag-over');
    if (cancelled) return;
    if (drag.moved) {
      suppressSquareClick = true;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.square');
      const to = target ? Number(target.dataset.square) : -1;
      const move = legalTargets.find((candidate) => candidate.from === drag.from && candidate.to === to);
      if (move) commitMove(move);
      else render();
      window.setTimeout(() => { suppressSquareClick = false; }, 200);
    }
  }

  window.addEventListener('pointermove', updatePointerDrag, { passive: false, capture: true });
  window.addEventListener('pointerup', (event) => finishPointerDrag(event), true);
  window.addEventListener('pointercancel', (event) => finishPointerDrag(event, true), true);
  window.addEventListener('pointerup', (event) => finishManualGesture(event), true);
  window.addEventListener('pointercancel', (event) => finishManualGesture(event, true), true);
  boardElement.addEventListener('click', (event) => {
    const squareElement = event.target?.closest?.('.square');
    if (!squareElement || !boardElement.contains(squareElement)) return;
    const square = Number(squareElement.dataset.square);
    boardFocusSquare = square;
    if (suppressSquareClick) { suppressSquareClick = false; return; }
    if (manualArrows.length || highlightedSquare >= 0) {
      manualArrows = []; highlightedSquare = -1; renderBoardArrows();
    }
    onSquareClick(square);
  });
  boardElement.addEventListener('pointerdown', (event) => {
    const squareElement = event.target?.closest?.('.square');
    if (!squareElement || !boardElement.contains(squareElement)) return;
    const square = Number(squareElement.dataset.square);
    if (event.button === 2) {
      manualGesture = { pointerId: event.pointerId, from: square, armed: true };
      event.preventDefault(); return;
    }
    if (event.pointerType === 'touch') {
      const gesture = manualGesture = { pointerId: event.pointerId, from: square, armed: false, startX: event.clientX, startY: event.clientY, timer: 0 };
      gesture.timer = window.setTimeout(() => {
        if (manualGesture === gesture) {
          gesture.armed = true; pointerDrag = null;
          selected = -1; legalTargets = []; paintSelection(-1);
        }
      }, 480);
    }
    beginPointerDrag(event, square, squareElement);
  });
  boardElement.addEventListener('pointermove', (event) => {
    if (!manualGesture || manualGesture.pointerId !== event.pointerId || event.pointerType !== 'touch') return;
    if (Math.hypot(event.clientX - manualGesture.startX, event.clientY - manualGesture.startY) > 10 && !manualGesture.armed) {
      clearTimeout(manualGesture.timer); manualGesture = null;
    }
  });
  boardElement.addEventListener('contextmenu', (event) => event.preventDefault());
  function pieceName(piece) {
    const names = { K:'rei branco', Q:'dama branca', R:'torre branca', B:'bispo branco', N:'cavalo branco', P:'peão branco', k:'rei preto', q:'dama preta', r:'torre preta', b:'bispo preto', n:'cavalo preto', p:'peão preto' };
    return names[piece] || 'peça';
  }

  function pieceArticle(piece) {
    return ['Q', 'R'].includes(piece.toUpperCase()) ? 'a' : 'o';
  }

  function selectSquare(square) {
    const piece = position.board[square];
    if (piece !== '.' && color(piece) === position.turn) { selected = square; legalTargets = legalMoves(position, square); }
    else { selected = -1; legalTargets = []; }
    render();
  }

  function onSquareClick(square) {
    if (selected >= 0) {
      const move = legalTargets.find((candidate) => candidate.to === square);
      if (move) { commitMove(move); return; }
    }
    selectSquare(square);
  }

  function commitMove(move, deferVariationAnalysis = false) {
    manualArrows = []; highlightedSquare = -1;
    if (exerciseActiveHere()) { recordExerciseGuess(move); return; }
    exerciseState = null;
    if (punishmentPlayback && !punishmentPlayback.applying) punishmentPlayback = null;
    // Um lance que já existe no PGN apenas avança pela partida. O primeiro
    // desvio cria uma linha hipotética e preserva o original automaticamente.
    if (loadedPgnGame && !variationSession) {
      const originalNextMove = history[historyIndex + 1]?.move;
      const followsOriginal = originalNextMove
        && move.from === originalNextMove.from
        && move.to === originalNextMove.to
        && (move.promotion || '') === (originalNextMove.promotion || '');
      if (followsOriginal) { goTo(historyIndex + 1); return; }
      beginVariationMode(false);
    }
    const exploring = Boolean(variationSession);
    invalidateAnalysis('A posição mudou; execute uma nova análise.');
    gameReviewResults = exploring ? gameReviewResults.slice(0, historyIndex + 1) : [];
    renderGameSummary(gameReviewResults);
    history = history.slice(0, historyIndex + 1);
    const side = position.turn, moveNumber = position.fullmove, san = moveToSan(position, move);
    position = applyMove(position, move); history.push({ position: clone(position), move: cloneMove(move), san, side, moveNumber });
    historyIndex = history.length - 1; lastMove = cloneMove(move); selected = -1; legalTargets = [];
    pendingMoveAnimation = { from: move.from, to: move.to };
    gameResult = '*';
    render();
    if (exploring) {
      variationNeedsAnalysis = true;
      if (!deferVariationAnalysis) analyzeVariationWhenReady();
    }
  }

  function goTo(index) {
    const scrollX = window.scrollX;
    const scrollYBefore = window.scrollY;
    const boardCard = boardElement.closest('.board-card');
    const boardRectBefore = boardCard?.getBoundingClientRect();
    const boardWasVisible = Boolean(boardRectBefore && boardRectBefore.bottom > 0 && boardRectBefore.top < window.innerHeight);
    index = Math.max(0, Math.min(index, history.length - 1));
    if (index === historyIndex) return;
    manualArrows = []; highlightedSquare = -1;
    const previousIndex = historyIndex;
    exerciseOnNavigate(index);
    // Navegar não deve interromper a análise da partida: o lote trabalha com instantâneos próprios.
    const batchRunning = Boolean(gameBatch || pendingAnalysis?.kind === 'game' || activeAnalysis?.kind === 'game') && !analysisStopping;
    if (!batchRunning) invalidateAnalysis('A posição mudou; execute uma nova análise.');
    historyIndex = Math.max(0, Math.min(index, history.length - 1));
    const traversedMove = history[index > previousIndex ? index : previousIndex]?.move;
    pendingMoveAnimation = traversedMove ? {
      from: index > previousIndex ? traversedMove.from : traversedMove.to,
      to: index > previousIndex ? traversedMove.to : traversedMove.from
    } : null;
    position = clone(history[historyIndex].position);
    lastMove = cloneMove(history[historyIndex].move); selected = -1; legalTargets = [];
    if (batchRunning && !gameReviewResults[historyIndex]) clearAnalysisView('A análise da partida continua; esta posição ainda não foi calculada.');
    render();
    syncGuidedGameMoveSelection();
    renderCurrentGuidedGameCommentary();
    // A revisão atualiza painéis com alturas diferentes; não deixe o scroll anchoring deslocar a página.
    void boardElement.offsetHeight;
    const boardRectAfter = boardCard?.getBoundingClientRect();
    const scrollY = boardWasVisible && boardRectBefore && boardRectAfter
      ? window.scrollY + boardRectAfter.top - boardRectBefore.top
      : scrollYBefore;
    if (window.scrollX !== scrollX || window.scrollY !== scrollY) {
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(scrollX, scrollY);
      root.style.scrollBehavior = previousBehavior;
    }
  }

  function showBoard() {
    const card = document.querySelector('.board-card');
    const rect = card.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) return;
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  // Exercício guiado: abre a posição ANTES do lance, esconde a classificação e a análise, aceita um palpite
  // no tabuleiro (sem alterar a partida) e só depois compara o palpite com o lance jogado e o motor.
  function exerciseActiveHere() {
    return Boolean(exerciseState && !exerciseState.revealed && historyIndex === exerciseState.moveIndex - 1
      && gameReviewResults[exerciseState.moveIndex] && gameReviewResults[exerciseState.moveIndex - 1]);
  }

  function exerciseFeedbackText() {
    const before = gameReviewResults[exerciseState.moveIndex - 1], after = gameReviewResults[exerciseState.moveIndex];
    const played = after?.playedMove?.san, guess = exerciseState.guess, best = before?.best;
    const hasBest = best && best !== 'Nenhum lance legal';
    const parts = [guess ? `Seu palpite: ${guess.san}.` : 'Você não indicou um palpite no tabuleiro.', `Lance jogado: ${played}.`];
    if (hasBest) parts.push(`Preferência do Stockfish nesta posição: ${best}.`);
    if (guess) {
      if (guess.san === played) parts.push('Seu palpite coincide com o lance jogado.');
      if (hasBest && guess.san === best) parts.push('Seu palpite coincide com a preferência do Stockfish.');
      if (guess.san !== played && !(hasBest && guess.san === best)) {
        // Só afirmo algo sobre o palpite se ele estiver entre as linhas que o motor calculou (MultiPV).
        const token = `${squareName(guess.from)}${squareName(guess.to)}`;
        const variations = (before?.variations || []).filter(Boolean);
        const rank = variations.findIndex((variation) => String(variation.pv || '').trim().split(/\s+/)[0]?.slice(0, 4) === token);
        if (rank >= 0) parts.push(`O motor calculou ${guess.san} como a ${rank + 1}ª melhor linha (${formatEvaluationForSide(variations[rank].score, before.turn, after.playedMove.side)}).`);
        else if (variations.length) parts.push(`${guess.san} não está entre as ${variations.length} melhores linhas calculadas; não há avaliação direta dele, o que não o torna ruim.`);
        else parts.push('Outros lances também podem ser bons: compare as avaliações antes de concluir.');
      }
    }
    return parts.join(' ');
  }

  function exerciseOnNavigate(index) {
    if (!exerciseState) return;
    const { moveIndex } = exerciseState;
    if (index === moveIndex) {
      if (!exerciseState.revealed) { exerciseState.revealed = true; exerciseState.feedback = exerciseFeedbackText(); }
      return;
    }
    if (index !== moveIndex - 1) exerciseState = null;
  }

  function startExercise(index) {
    if (!gameReviewResults[index] || !gameReviewResults[index - 1]) return;
    exerciseState = null;
    punishmentPlayback = null;
    goTo(index - 1);
    exerciseState = { moveIndex: index, revealed: false, guess: null, feedback: '' };
    render();
    showBoard();
  }

  function recordExerciseGuess(move) {
    exerciseState.guess = { san: moveToSan(position, move), from: move.from, to: move.to };
    selected = -1; legalTargets = []; lastMove = cloneMove(move);
    render();
  }

  function renderExercisePrompt() {
    const before = gameReviewResults[exerciseState.moveIndex - 1], after = gameReviewResults[exerciseState.moveIndex];
    const move = after.playedMove;
    clearAnalysisView(null);
    analysisPlaceholder.hidden = true; analysisResults.hidden = false; analysisProgress.hidden = true;
    analysisResults.classList.add('from-game-review', 'exercise-mode');
    gameReviewQuality.hidden = false;
    gameReviewContext.textContent = `EXERCÍCIO · ANTES DE ${move.moveNumber}${move.side === 'w' ? '.' : '…'} ${move.san}`;
    gameReviewBadge.hidden = true;
    gameReviewExplanation.textContent = exerciseState.guess
      ? `Seu palpite: ${exerciseState.guess.san}. Ele não altera a partida. Faça outro palpite ou revele a análise.`
      : 'Esta é a posição antes do lance. Toque no lance que você jogaria como palpite (a partida não é alterada) ou apenas pense e revele a análise.';
    gameReviewQuestion.hidden = false;
    gameReviewQuestion.textContent = after.quality?.lesson ? after.quality.lesson.questions.decision : 'Lembre o que você pretendia e pense nas respostas do adversário antes de revelar.';
    gameReviewDepth.textContent = 'A classificação e a avaliação ficam ocultas até você revelar.';
    moveAlternatives.hidden = true;
    updateMoveAnalysisPanels();
    revealExerciseButton.hidden = false;
    engineStatusText.textContent = 'Exercício guiado: a análise fica oculta até você revelar.';
  }

  function beginVariationMode(requireAnalyzedPosition = true) {
    exerciseState = null;
    punishmentPlayback = null;
    if (variationSession || (requireAnalyzedPosition && !gameReviewResults[historyIndex])) return false;
    variationSession = {
      history: history.slice(), reviewResults: gameReviewResults.slice(),
      headers: { ...gameHeaders }, result: gameResult, historyIndex,
      reportRows: [...gameAnalysisRows.children], reportHidden: gameAnalysisPanel.hidden,
      reportLabel: gameProgressLabel.textContent, reportCount: gameProgressCount.textContent,
      reportProgress: gameProgressBar.value
    };
    history = history.slice(0, historyIndex + 1);
    gameReviewResults = gameReviewResults.slice(0, historyIndex + 1);
    gameResult = '*';
    selected = -1; legalTargets = [];
    gameAnalysisRows.replaceChildren();
    gameAnalysisPanel.hidden = false;
    renderAdvantageChart(gameReviewResults);
    gameProgressLabel.textContent = 'Faça um lance no tabuleiro para começar a análise da linha alternativa.';
    gameProgressCount.textContent = '';
    gameProgressBar.value = 0;
    render();
    engineStatusText.textContent = 'Modo de variação ativo. Faça um lance no tabuleiro para explorar outra continuação.';
    return true;
  }

  function exitVariationMode() {
    exerciseState = null;
    punishmentPlayback = null;
    if (!variationSession) return;
    variationNeedsAnalysis = false;
    invalidateAnalysis('Variação encerrada.');
    const original = variationSession;
    variationSession = null;
    history = original.history;
    gameReviewResults = original.reviewResults;
    gameHeaders = original.headers;
    gameResult = original.result;
    gameAnalysisRows.replaceChildren(...original.reportRows);
    renderAdvantageChart(gameReviewResults);
    gameAnalysisPanel.hidden = original.reportHidden;
    gameProgressLabel.textContent = original.reportLabel;
    gameProgressCount.textContent = original.reportCount;
    gameProgressBar.value = original.reportProgress;
    historyIndex = original.historyIndex;
    position = clone(history[historyIndex].position);
    lastMove = cloneMove(history[historyIndex].move);
    selected = -1; legalTargets = [];
    render();
  }

  function analyzeVariationWhenReady() {
    if (!variationNeedsAnalysis || !variationSession || activeAnalysis || analysisStopping || pendingAnalysis) return;
    variationNeedsAnalysis = false;
    // Cada lance hipotético reanalisa a linha: reaproveita a profundidade já escolhida, sem perguntar de novo.
    requestGameAnalysis({ skipDepthPrompt: true });
  }

  exitVariationButton.addEventListener('click', exitVariationMode);

  function applyBoardSize() {
    activeMoveAnimationCleanup?.();
    const scale = Number(boardSizeInput.value) / 100;
    const layoutStyle = getComputedStyle(boardLayoutElement);
    const horizontalPadding = (parseFloat(layoutStyle.paddingLeft) || 0) + (parseFloat(layoutStyle.paddingRight) || 0);
    const gap = parseFloat(layoutStyle.columnGap) || 0;
    const meterVisible = getComputedStyle(boardEvalMeter).display !== 'none';
    const meterSpace = meterVisible ? boardEvalMeter.getBoundingClientRect().width + gap : 0;
    const maxWidth = window.innerWidth > 650 && window.innerWidth <= 850 ? 500 : 560;
    const availableWidth = Math.max(0, boardLayoutElement.clientWidth - horizontalPadding - meterSpace);
    const baseWidth = Math.min(maxWidth, availableWidth);
    boardWrapElement.style.flex = '0 0 auto';
    boardWrapElement.style.width = `${Math.round(baseWidth * scale)}px`;
    const useCompactPieces = scale < 0.9;
    if (useCompactPieces !== compactPieceMode) {
      compactPieceMode = useCompactPieces;
      boardWrapElement.classList.toggle('compact-piece-mode', compactPieceMode);
      for (const image of boardElement.querySelectorAll('.piece')) {
        const square = image.closest('.square');
        const piece = position.board[Number(square?.dataset.square)];
        if (piece && piece !== '.') image.src = pieceAssetUrl(piece);
      }
    }
    if (meterVisible) {
      const baseHeight = window.innerWidth <= 850
        ? Math.min(window.innerWidth * 0.5, 500)
        : Math.min(window.innerWidth * 0.42, 560);
      boardEvalMeter.style.height = `${Math.round(baseHeight * scale)}px`;
    }
    renderBoardArrows();
  }

  try {
    const savedSize = Number(window.localStorage.getItem('mychess6-board-size'));
    if (savedSize >= 70 && savedSize <= 100 && savedSize % 5 === 0) boardSizeInput.value = String(savedSize);
  } catch {}
  boardSizeValue.textContent = `${boardSizeInput.value}%`;
  applyBoardSize();
  boardSizeInput.addEventListener('input', () => {
    boardSizeValue.textContent = `${boardSizeInput.value}%`;
    applyBoardSize();
    try { window.localStorage.setItem('mychess6-board-size', boardSizeInput.value); } catch {}
  });
  window.addEventListener('resize', applyBoardSize, { passive: true });

  document.querySelector('#flip-board').addEventListener('click', () => { flipped = !flipped; render(); });
  const stockfishArrowsButton = document.querySelector('#toggle-stockfish-arrows');
  stockfishArrowsButton.addEventListener('click', () => {
    stockfishArrowsEnabled = !stockfishArrowsEnabled;
    stockfishArrowsButton.setAttribute('aria-pressed', String(stockfishArrowsEnabled));
    stockfishArrowsButton.title = stockfishArrowsEnabled ? 'Ocultar flechas do Stockfish' : 'Mostrar flechas do Stockfish';
    renderBoardArrows();
  });
  document.querySelector('#clear-board-markings').addEventListener('click', () => {
    manualArrows = []; highlightedSquare = -1; renderBoardArrows();
    document.querySelector('#board-marking-status').textContent = 'Marcações removidas.';
  });
  navButtons.first.addEventListener('click', () => goTo(0));
  navButtons.previous.addEventListener('click', () => goTo(historyIndex - 1));
  navButtons.next.addEventListener('click', () => goTo(historyIndex + 1));
  navButtons.last.addEventListener('click', () => goTo(history.length - 1));
  revealExerciseButton.addEventListener('click', () => {
    if (!exerciseState) return;
    exerciseState.revealed = true; exerciseState.feedback = exerciseFeedbackText();
    goTo(exerciseState.moveIndex);
  });

  punishmentStepButton.addEventListener('click', advancePunishmentLine);

  // Teclado no tabuleiro: as setas movem o foco entre as casas (padrão de grade do WAI-ARIA).
  boardElement.addEventListener('keydown', (event) => {
    const cell = event.target?.closest?.('.square');
    if (!cell) return;
    if (event.key === 'Escape' && keyboardMarkFrom >= 0) {
      keyboardMarkFrom = -1; document.querySelector('#board-marking-status').textContent = 'Desenho de flecha cancelado.'; event.preventDefault(); return;
    }
    if (event.key.toLowerCase() === 'm' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const square = Number(cell.dataset.square);
      if (keyboardMarkFrom < 0) {
        keyboardMarkFrom = square;
        document.querySelector('#board-marking-status').textContent = `Origem ${squareName(square)} selecionada. Pressione M em outra casa para desenhar, ou Escape para cancelar.`;
      } else {
        const from = keyboardMarkFrom; keyboardMarkFrom = -1;
        if (from === square) highlightedSquare = highlightedSquare === square ? -1 : square;
        else {
          const existing = manualArrows.findIndex((arrow) => arrow.from === from && arrow.to === square);
          if (existing >= 0) manualArrows.splice(existing, 1); else manualArrows.push({ from, to: square });
        }
        renderBoardArrows(); document.querySelector('#board-marking-status').textContent = `Marcação em ${squareName(square)} atualizada.`;
      }
      event.preventDefault(); return;
    }
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const deltas = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    const cells = [...boardElement.querySelectorAll('.square')];
    const at = cells.indexOf(cell);
    const row = Math.floor(at / 8) + delta[0], col = (at % 8) + delta[1];
    if (at < 0 || row < 0 || row > 7 || col < 0 || col > 7) return;
    const next = cells[row * 8 + col];
    cell.tabIndex = -1; next.tabIndex = 0; boardFocusSquare = Number(next.dataset.square); next.focus();
  });

  // Teclado para os lances: ← e → fora do tabuleiro; Shift + ← / → quando o foco está no tabuleiro.
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || history.length < 2) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('input, textarea, select, [contenteditable="true"], .advantage-chart')) return;
    const inBoard = Boolean(target?.closest('.chessboard'));
    if (inBoard !== event.shiftKey) return;
    const inMoves = inBoard || Boolean(target?.closest('.move-list, .move-dock'));
    if (event.key === 'ArrowLeft') goTo(historyIndex - 1);
    else if (event.key === 'ArrowRight') goTo(historyIndex + 1);
    else if (event.key === 'Home' && inMoves) goTo(0);
    else if (event.key === 'End' && inMoves) goTo(history.length - 1);
    else return;
    event.preventDefault();
  });

  function showImportStatus(message, type = '') {
    importStatus.textContent = message;
    importStatus.className = `import-status${type ? ` ${type}` : ''}`;
  }

  function libraryDb() {
    if (libraryDbPromise) return libraryDbPromise;
    libraryDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('mychess6-library', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('games', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir a biblioteca local.'));
    });
    return libraryDbPromise;
  }

  async function libraryRequest(mode, action, value) {
    const db = await libraryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('games', mode);
      const request = action === 'all' ? tx.objectStore('games').getAll()
        : action === 'keys' ? tx.objectStore('games').getAllKeys()
        : action === 'get' ? tx.objectStore('games').get(value)
          : action === 'delete' ? tx.objectStore('games').delete(value)
            : tx.objectStore('games').put(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha na biblioteca.'));
    });
  }

  async function libraryPutMany(records) {
    if (!records.length) return 0;
    const db = await libraryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('games', 'readwrite');
      const store = tx.objectStore('games');
      for (const record of records) store.put(record);
      tx.oncomplete = () => resolve(records.length);
      tx.onerror = () => reject(tx.error || new Error('Falha ao importar análises da nuvem.'));
      tx.onabort = () => reject(tx.error || new Error('A importação das análises foi interrompida.'));
    });
  }

  function renderCloudProgress(data) {
    const games = Array.isArray(data.games) ? data.games : [];
    const gameCount = Number(data.gameCount) || games.length;
    const cursor = (data.backfillArchiveUrl || '').match(/(\d{4}\/\d{2})$/)?.[1];
    const latestSavedAt = Number(data.latestSavedAt) || games.reduce((latest, game) => Math.max(latest, Number(game?.savedAt) || 0), 0);
    const lastUpdate = latestSavedAt ? ` · último lote ${new Date(latestSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '';
    const progress = data.backfillComplete
      ? 'Retropreenchimento de 2026 concluído'
      : `Retropreenchimento em andamento${cursor ? ` · arquivo ${cursor}` : ''}`;
    const pending = Number(data.pendingInArchive) || 0;
    const pendingLabel = !data.backfillComplete && pending > 0 ? ` · ${pending} partidas restantes neste arquivo` : '';
    cloudProgressStatus.textContent = `${gameCount} análises publicadas na nuvem · ${progress}${pendingLabel}${lastUpdate}.`;
  }

  async function importCloudLibrary() {
    if (cloudImportBusy) return 0;
    cloudImportBusy = true;
    try {
      let response, data, revision;
      try { response = await fetch('cloud-data/index.json', { cache: 'no-cache' }); }
      catch { return 0; }
      if (response.ok) {
        try { data = await response.json(); } catch { return 0; }
        revision = [response.headers.get('etag') || response.headers.get('last-modified') || '', data.revision || data.updatedAt || ''].join('|');
        if (revision && revision === cloudRemoteRevision && cloudRemoteGameIds.length && cloudRemoteSummary) {
          const localKeys = new Set(await libraryRequest('readonly', 'keys'));
          if (cloudRemoteGameIds.every((id) => localKeys.has(id))) {
            renderCloudProgress(cloudRemoteSummary);
            cloudLastSeenGameUrl = cloudRemoteSummary.lastSeenGameUrl || '';
            window.MyChess6Cloud.lastSeenGameUrl = cloudLastSeenGameUrl;
            window.MyChess6Cloud.backfillArchiveUrl = cloudRemoteSummary.backfillArchiveUrl || '';
            window.MyChess6Cloud.backfillComplete = cloudRemoteSummary.backfillComplete === true;
            return 0;
          }
        }
        if (Array.isArray(data.shards)) {
          const shardParts = await Promise.all(data.shards.map(async (shard) => {
            try {
              if (!shard || typeof shard.path !== 'string' || !/^games-[a-f0-9]{1,64}\.json$/.test(shard.path)) return null;
              const shardResponse = await fetch(`cloud-data/shards/${shard.path}`, { cache: 'no-cache' });
              if (!shardResponse.ok) return null;
              const part = await shardResponse.json();
              return Array.isArray(part) ? part : null;
            } catch { return null; }
          }));
          if (shardParts.some((part) => !Array.isArray(part))) return 0;
          const shardRecords = shardParts.flat();
          data.games = shardRecords;
        } else if (!Array.isArray(data.games)) {
          return 0;
        }
      } else {
        // Compatibility with the original single-file library during deployment.
        try { response = await fetch('cloud-data/games.json', { cache: 'no-cache' }); }
        catch { return 0; }
        if (!response.ok) return 0;
        try { data = await response.json(); } catch { return 0; }
      }
      revision ||= [response.headers.get('etag') || response.headers.get('last-modified') || '', data.revision || data.updatedAt || ''].join('|');
      if (revision && revision === cloudRemoteRevision && cloudRemoteGameIds.length && cloudRemoteSummary) {
        const localKeys = new Set(await libraryRequest('readonly', 'keys'));
        if (cloudRemoteGameIds.every((id) => localKeys.has(id))) {
          renderCloudProgress(cloudRemoteSummary);
          cloudLastSeenGameUrl = cloudRemoteSummary.lastSeenGameUrl || '';
          window.MyChess6Cloud.lastSeenGameUrl = cloudLastSeenGameUrl;
          window.MyChess6Cloud.backfillArchiveUrl = cloudRemoteSummary.backfillArchiveUrl || '';
          window.MyChess6Cloud.backfillComplete = cloudRemoteSummary.backfillComplete === true;
          return 0;
        }
      }
      const games = data.games;
      if (!Array.isArray(games)) return 0;
      renderCloudProgress(data);
      cloudLastSeenGameUrl = typeof data.lastSeenGameUrl === 'string' ? data.lastSeenGameUrl : '';
      window.MyChess6Cloud.lastSeenGameUrl = cloudLastSeenGameUrl;
      window.MyChess6Cloud.backfillArchiveUrl = typeof data.backfillArchiveUrl === 'string' ? data.backfillArchiveUrl : '';
      window.MyChess6Cloud.backfillComplete = data.backfillComplete === true;
      const latestSavedAt = games.reduce((latest, game) => Math.max(latest, Number(game?.savedAt) || 0), 0);
      const snapshotKey = [revision, games.length, data.backfillArchiveUrl || '', data.backfillComplete === true, data.lastSeenGameUrl || '', latestSavedAt].join('|');
      if (snapshotKey === cloudSnapshotKey && cloudRemoteGameIds.length) {
        const localKeys = new Set(await libraryRequest('readonly', 'keys'));
        if (cloudRemoteGameIds.every((id) => localKeys.has(id))) return 0;
      }
      const localRecords = await libraryRequest('readonly', 'all');
      const localById = new Map(localRecords.map((record) => [record.id, record]));
      const updates = [];
      for (const record of games) {
        if (!record || typeof record.id !== 'string' || typeof record.pgn !== 'string' || !Array.isArray(record.results)) continue;
        const local = localById.get(record.id);
        if (!local || Number(record.depth || 0) > Number(local.depth || 0)) {
          updates.push(record);
        }
      }
      await libraryPutMany(updates);
      const cloudIds = games.filter((record) => record && typeof record.id === 'string'
        && typeof record.pgn === 'string' && Array.isArray(record.results)).map((record) => record.id);
      const summary = {
        gameCount: games.length, backfillArchiveUrl: data.backfillArchiveUrl || '',
        backfillComplete: data.backfillComplete === true, pendingInArchive: Number(data.pendingInArchive) || 0,
        lastSeenGameUrl: data.lastSeenGameUrl || '', latestSavedAt
      };
      cloudSnapshotKey = snapshotKey;
      cloudRemoteRevision = revision;
      cloudRemoteGameIds = cloudIds;
      cloudRemoteSummary = summary;
      try {
        localStorage.setItem('mychess6-cloud-revision', revision);
        localStorage.setItem('mychess6-cloud-game-ids', JSON.stringify(cloudIds));
        localStorage.setItem('mychess6-cloud-summary', JSON.stringify(summary));
      } catch { /* o cache remoto é uma otimização, não um requisito */ }
      return updates.length;
    } finally { cloudImportBusy = false; }
  }

  function gameIdentity(pgn, source) {
    if (source?.url) return `chesscom:${source.url}`;
    let hash = 2166136261;
    for (let i = 0; i < pgn.length; i++) { hash ^= pgn.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return `pgn:${(hash >>> 0).toString(16)}`;
  }

  function qualityCounts(results) {
    const counts = {};
    for (const result of results || []) if (result?.quality?.label) counts[result.quality.label] = (counts[result.quality.label] || 0) + 1;
    return counts;
  }

  function recordTitle(record) {
    const headers = record.headers || {};
    return headers.White && headers.Black ? `${headers.White} × ${headers.Black}` : record.title || 'Partida sem nome';
  }

  function getPlayerOutcome(headers, result) {
    const player = chessComUsername.value.trim().toLowerCase();
    if (!player) return null;
    const white = (headers?.White || '').trim().toLowerCase();
    const black = (headers?.Black || '').trim().toLowerCase();
    if (white !== player && black !== player) return null;
    const score = result || headers?.Result || '*';
    if (score === '1/2-1/2') return 'draw';
    if (score !== '1-0' && score !== '0-1') return null;
    const playerWon = (score === '1-0' && white === player) || (score === '0-1' && black === player);
    return playerWon ? 'win' : 'loss';
  }

  function createOutcomeBadge(outcome) {
    const labels = { win: ['Vitória', '✓'], loss: ['Derrota', '×'], draw: ['Empate', '½'] };
    const [label, symbol] = labels[outcome];
    const badge = document.createElement('span');
    badge.className = `game-outcome-badge outcome-${outcome}`;
    badge.textContent = `${label} ${symbol}`;
    badge.title = label;
    badge.setAttribute('aria-label', label);
    return badge;
  }

  function recordRecency(record) {
    const headers = record.headers || {};
    for (const [rawDate, rawTime] of [
      [headers.UTCDate, headers.UTCTime],
      [headers.EndDate, headers.EndTime],
      [headers.Date, headers.StartTime]
    ]) {
      const date = String(rawDate || '').replaceAll('.', '-');
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) continue;
      const [, year, month, day] = match.map(Number);
      const dateValue = new Date(Date.UTC(year, month - 1, day));
      if (dateValue.getUTCFullYear() !== year || dateValue.getUTCMonth() !== month - 1 || dateValue.getUTCDate() !== day) continue;
      const time = String(rawTime || '00:00:00');
      const timestamp = Date.parse(`${date}T${/^\d{2}:\d{2}(?::\d{2})?$/.test(time) ? time : '00:00:00'}Z`);
      if (Number.isFinite(timestamp)) return timestamp;
    }
    return Number(record.savedAt) || 0;
  }

  // ---- Visão geral: o cálculo vive em insights.js (módulo puro); aqui só desenhamos o relatório. ----
  const insightsEngine = window.MyChessInsights;
  const SPEED_NAMES = { bullet: 'bullet', blitz: 'blitz', rapid: 'rápidas', daily: 'por correspondência' };
  const OUTCOME_NAMES = { win: 'Vitória', draw: 'Empate', loss: 'Derrota' };
  const decimal = (value, digits = 1) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  const percent = (fraction) => `${Math.round(fraction * 100)}%`;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function insightsBox(title, hint) {
    const box = node('section', 'insights-box');
    const heading = node('div', 'insights-box-heading'); heading.append(node('h4', '', title));
    if (hint) heading.append(node('span', 'insights-hint', hint));
    box.append(heading);
    return box;
  }

  function enableChartDragging(wrap) {
    wrap.setAttribute('role', 'region'); wrap.setAttribute('tabindex', '0');
    let inertiaFrame = 0;
    let dragStart = null;
    wrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0;
      wrap.classList.remove('is-gliding');
      dragStart = { pointerId: event.pointerId, x: event.clientX, lastX: event.clientX,
        lastTime: performance.now(), scrollLeft: wrap.scrollLeft, velocity: 0, moved: false };
      wrap.setPointerCapture(event.pointerId);
    });
    wrap.addEventListener('pointermove', (event) => {
      if (!dragStart || dragStart.pointerId !== event.pointerId) return;
      const distance = event.clientX - dragStart.x;
      if (Math.abs(distance) > 3) { dragStart.moved = true; wrap.classList.add('is-dragging'); }
      if (wrap.classList.contains('is-dragging')) {
        event.preventDefault();
        wrap.scrollLeft = dragStart.scrollLeft - distance;
        const now = performance.now(), elapsed = Math.max(1, now - dragStart.lastTime);
        const instantVelocity = -(event.clientX - dragStart.lastX) / elapsed;
        dragStart.velocity = dragStart.velocity * 0.65 + instantVelocity * 0.35;
        dragStart.lastX = event.clientX; dragStart.lastTime = now;
      }
    });
    const stopInertia = () => {
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0; wrap.classList.remove('is-gliding');
    };
    const startInertia = (velocity) => {
      if (Math.abs(velocity) < 0.08) return;
      wrap.classList.add('is-gliding');
      let previousTime = performance.now();
      const glide = (now) => {
        const elapsed = Math.min(32, now - previousTime); previousTime = now;
        const previousScroll = wrap.scrollLeft;
        wrap.scrollLeft += velocity * elapsed;
        velocity *= Math.pow(0.94, elapsed / 16);
        if (wrap.scrollLeft === previousScroll || Math.abs(velocity) < 0.025) stopInertia();
        else inertiaFrame = requestAnimationFrame(glide);
      };
      inertiaFrame = requestAnimationFrame(glide);
    };
    const endDrag = (event, cancelled = false) => {
      if (!dragStart || dragStart.pointerId !== event.pointerId) return;
      const { velocity, moved } = dragStart;
      dragStart = null;
      wrap.classList.remove('is-dragging');
      if (!cancelled && moved) startInertia(velocity);
    };
    wrap.addEventListener('pointerup', (event) => endDrag(event));
    wrap.addEventListener('pointercancel', (event) => endDrag(event, true));
    wrap.addEventListener('lostpointercapture', (event) => endDrag(event, true));
  }

  function ratingHistoryFor(records, profile, periodDays) {
    const groups = new Map([['bullet', []], ['blitz', []], ['rapid', []], ['daily', []]]);
    const cutoff = periodDays ? Date.now() - periodDays * 86400000 : 0;
    const username = String(profile || '').trim().toLowerCase();
    for (const record of records) {
      const headers = record.headers || {}, source = record.source || {};
      if (source.platform !== 'Chess.com' && !/chess\.com\/game\//i.test(source.url || '')) continue;
      const white = String(headers.White || '').trim().toLowerCase();
      const black = String(headers.Black || '').trim().toLowerCase();
      const playerSide = white === username ? 'w' : black === username ? 'b' : null;
      if (!playerSide) continue;
      let time = Number(record.savedAt) || 0;
      const dateText = [headers.UTCDate, headers.Date, headers.EndDate].find((value) => /^\d{4}\.\d{2}\.\d{2}$/.test(value || ''));
      if (dateText) {
        const [year, month, day] = dateText.split('.').map(Number);
        const clock = /^(\d{1,2}):(\d{2}):(\d{2})/.exec(headers.UTCTime || headers.EndTime || '');
        time = Date.UTC(year, month - 1, day, clock ? Number(clock[1]) : 12, clock ? Number(clock[2]) : 0, clock ? Number(clock[3]) : 0);
      }
      if (cutoff && time < cutoff) continue;
      const speed = ['bullet', 'blitz', 'rapid', 'daily'].includes(source.timeClass)
        ? source.timeClass : insightsEngine.parseTimeControl(headers.TimeControl).speed;
      if (!groups.has(speed)) continue;
      const rating = Number(headers[playerSide === 'w' ? 'WhiteElo' : 'BlackElo']);
      if (!Number.isFinite(rating) || rating < 1) continue;
      const opponent = String(playerSide === 'w' ? headers.Black : headers.White).trim() || 'adversário';
      groups.get(speed).push({ rating, time, opponent, id: record.id });
    }
    for (const points of groups.values()) points.sort((a, b) => a.time - b.time);
    return groups;
  }

  function ratingChart(mode, points) {
    const namespace = 'http://www.w3.org/2000/svg', height = 340, left = 66, right = 32, top = 36, bottom = 278;
    const width = Math.max(720, left + right + Math.max(0, points.length - 1) * 72);
    const values = points.map((point) => point.rating), rawStep = (Math.max(...values) - Math.min(...values)) / 4;
    const tickStep = [10, 25, 50, 100, 200, 500, 1000].find((step) => step >= rawStep) || 1000;
    const minRating = Math.floor(Math.min(...values) / tickStep) * tickStep - tickStep;
    const maxRating = Math.ceil(Math.max(...values) / tickStep) * tickStep + tickStep;
    const x = (index) => points.length === 1 ? (left + width - right) / 2 : left + index * (width - left - right) / (points.length - 1);
    const y = (rating) => top + (maxRating - rating) / (maxRating - minRating) * (bottom - top);
    const colors = { bullet: '#8dc8ed', blitz: '#b5d985', rapid: '#e0bd72', daily: '#c7a4ef' };
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
    svg.setAttribute('class', 'rating-chart-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Rating ${mode} em ${points.length} partidas, de ${points[0].rating} a ${points.at(-1).rating}.`);
    const make = (tag, attrs, content) => {
      const element = document.createElementNS(namespace, tag);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
      if (content !== undefined) element.textContent = content;
      return element;
    };
    svg.append(make('text', { x: 8, y: 18, class: 'rating-axis-title' }, 'Rating Chess.com'));
    for (let value = minRating; value <= maxRating; value += tickStep) {
      const py = y(value);
      svg.append(make('line', { x1: left, x2: width - right, y1: py, y2: py, class: 'rating-grid-line' }));
      svg.append(make('text', { x: left - 10, y: py + 5, 'text-anchor': 'end', class: 'rating-axis-label' }, String(value)));
    }
    svg.append(make('line', { x1: left, x2: left, y1: top, y2: bottom, class: 'rating-axis-line' }));
    svg.append(make('polyline', {
      points: points.map((point, index) => `${x(index).toFixed(1)},${y(point.rating).toFixed(1)}`).join(' '),
      class: 'rating-history-line', stroke: colors[mode]
    }));
    svg.append(make('text', { x: 8, y: 316, class: 'rating-axis-title' }, 'Data'));
    points.forEach((point, index) => {
      const px = x(index), py = y(point.rating), date = new Date(point.time);
      const dot = make('circle', { cx: px, cy: py, r: 5, class: 'rating-history-dot', fill: colors[mode] });
      dot.append(make('title', {}, `${date.toLocaleDateString('pt-BR')} · vs. ${point.opponent} · rating ${point.rating}`)); svg.append(dot);
      svg.append(make('text', { x: px, y: py - 11, 'text-anchor': 'middle', class: 'rating-point-label' }, String(point.rating)));
      svg.append(make('text', { x: px, y: 316, 'text-anchor': 'middle', class: 'rating-date-label' }, date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })));
    });
    const wrap = node('div', 'insight-spark-wrap rating-chart-scroll');
    wrap.setAttribute('aria-label', `Histórico de rating ${mode}; arraste para ver outras partidas.`);
    enableChartDragging(wrap); wrap.append(svg);
    requestAnimationFrame(() => { wrap.scrollLeft = wrap.scrollWidth; });
    return wrap;
  }

  function ratingHistoryPanel(records, profile, periodDays) {
    const groups = ratingHistoryFor(records, profile, periodDays);
    const names = { bullet: 'Bullet', blitz: 'Blitz', rapid: 'Rápidas', daily: 'Diárias' };
    const box = insightsBox('Rating no Chess.com', `${names[selectedRatingMode]} · rating acima e data abaixo de cada ponto · arraste com o botão esquerdo e solte para deslizar`);
    const controls = node('div', 'rating-mode-switch');
    controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Modo do rating');
    for (const [mode, points] of groups) {
      const button = node('button', `rating-mode-button${mode === selectedRatingMode ? ' selected' : ''}`, `${names[mode]} · ${points.length}`);
      button.type = 'button'; button.dataset.ratingMode = mode;
      button.setAttribute('aria-pressed', String(mode === selectedRatingMode));
      button.addEventListener('click', () => {
        selectedRatingMode = mode;
        const replacement = ratingHistoryPanel(records, profile, periodDays);
        box.replaceWith(replacement);
        replacement.querySelector(`[data-rating-mode="${mode}"]`)?.focus();
      });
      controls.append(button);
    }
    box.append(controls);
    const points = groups.get(selectedRatingMode) || [];
    if (!points.length) {
      box.append(node('p', 'insights-empty', 'Não encontrei ratings nas partidas do Chess.com neste filtro.'));
      return box;
    }
    box.append(ratingChart(selectedRatingMode, points));
    return box;
  }

  function sparkline(series) {
    const height = 78, pad = 8, pointSpacing = 16, width = Math.max(320, (series.length - 1) * pointSpacing + pad * 2), svgNs = 'http://www.w3.org/2000/svg';
    const wrap = node('div', 'insight-spark-wrap');
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height)); svg.setAttribute('class', 'insight-spark'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Precisão estimada nas ${series.length} partidas, da mais antiga à mais recente: ${series.map((item) => Math.round(item.accuracy)).join(', ')}.`);
    const values = series.map((item) => item.accuracy), low = Math.max(0, Math.min(...values) - 6), high = Math.min(100, Math.max(...values) + 6);
    const x = (i) => (series.length === 1 ? width / 2 : pad + i * (width - 2 * pad) / (series.length - 1));
    const y = (value) => height - pad - (high === low ? 0.5 : (value - low) / (high - low)) * (height - 2 * pad);
    const line = document.createElementNS(svgNs, 'polyline');
    line.setAttribute('points', series.map((item, i) => `${x(i).toFixed(1)},${y(item.accuracy).toFixed(1)}`).join(' ')); line.setAttribute('class', 'insight-spark-line');
    svg.append(line);
    series.forEach((item, i) => {
      const dot = document.createElementNS(svgNs, 'circle');
      dot.setAttribute('cx', x(i).toFixed(1)); dot.setAttribute('cy', y(item.accuracy).toFixed(1)); dot.setAttribute('r', '4'); dot.setAttribute('class', `insight-spark-dot outcome-${item.outcome || 'none'}`);
      const tip = document.createElementNS(svgNs, 'title'); tip.textContent = `${new Date(item.time).toLocaleDateString('pt-BR')} · ${item.outcome ? OUTCOME_NAMES[item.outcome] : 'sem resultado'} · ${decimal(item.accuracy)}%`;
      dot.append(tip); svg.append(dot);
    });
    wrap.append(svg);
    wrap.setAttribute('aria-label', `Gráfico rolável com ${series.length} partidas, da mais antiga à mais recente.`);
    enableChartDragging(wrap);
    const container = node('div', 'insight-spark-container');
    container.append(wrap);
    if (width > 480) container.append(node('span', 'insight-spark-hint', 'Arraste com o botão esquerdo e solte para o gráfico deslizar.'));
    requestAnimationFrame(() => { wrap.scrollLeft = wrap.scrollWidth; });
    return container;
  }

  function renderInsights(records) {
    const byId = new Map(records.map((record) => [record.id, record]));
    insightsBody.replaceChildren();
    const periodDays = insightsPeriod.value === 'custom'
      ? Math.min(3650, Math.max(1, Number.parseInt(insightsCustomPeriod.value, 10) || 30))
      : Number(insightsPeriod.value) || 0;
    const report = insightsEngine.compute(records, {
      profile: chessComUsername.value, periodDays, speed: insightsSpeed.value, themes: coach.themes,
      expected: (score, turn, side, rating) => expectedPoints(score, turn, side, rating)
    });
    const ratingPanel = ratingHistoryPanel(records, chessComUsername.value, periodDays);
    const openMove = (reference) => { const record = byId.get(reference.recordId); if (record) { openSavedRecord(record, reference.index); } };
    const moveButton = (reference, label) => {
      const button = node('button', 'secondary-button insight-link', label || `Ver ${reference.text}`); button.type = 'button';
      button.title = `Abre a partida no tabuleiro neste lance${reference.opponent ? ` (contra ${reference.opponent})` : ''}.`;
      button.addEventListener('click', () => openMove(reference));
      return button;
    };
    const filters = [report.periodDays ? `últimos ${report.periodDays} dias` : '', report.speed ? SPEED_NAMES[report.speed] : ''].filter(Boolean).join(', ');

    if (report.empty) {
      insightsStatus.textContent = report.counts.stored ? `Nenhuma partida analisada combina com o filtro${filters ? ` (${filters})` : ''}.` : 'Nenhuma análise salva ainda.';
      const empty = insightsBox('Seu diagnóstico começa na primeira análise');
      empty.append(node('p', 'insights-empty', report.counts.stored
        ? 'Mude o período ou o ritmo, ou analise mais partidas. Só entram partidas com lances classificados.'
        : 'Na aba Partidas, escolha uma partida sua e clique em Analisar. Quando a análise terminar ela é salva aqui e esta aba mostra precisão, padrões de erro, aberturas, tempo e o que treinar primeiro.'));
      insightsBody.append(ratingPanel, empty);
      return;
    }

    const { overview } = report;
    const who = report.mode === 'player' ? `de ${chessComUsername.value.trim() || 'você'}` : 'dos dois lados';
    insightsStatus.textContent = `Considerando ${overview.games} partida${overview.games === 1 ? '' : 's'} ${who} e ${overview.moves} lances classificados${filters ? ` · ${filters}` : ''}.${report.notes.length ? ` ${report.notes.join(' ')}` : ''}`;

    // 1. Diagnóstico
    const hero = node('div', 'insight-hero');
    const score = node('section', 'insights-box insight-score');
    score.append(node('span', 'insight-kicker', 'Precisão estimada'));
    score.append(node('strong', 'insight-big', overview.accuracy === null ? '—' : `${decimal(overview.accuracy)}%`));
    if (report.trend) {
      const delta = report.trend.delta, direction = Math.abs(delta) < 1 ? 'flat' : delta > 0 ? 'up' : 'down';
      score.append(node('span', `insight-trend trend-${direction}`, direction === 'flat' ? `Estável nas últimas ${report.trend.k} partidas` : `${delta > 0 ? '▲ +' : '▼ −'}${decimal(Math.abs(delta))} pontos nas últimas ${report.trend.k} partidas vs. as ${report.trend.k} anteriores`));
    } else score.append(node('span', 'insight-trend trend-flat', 'Tendência aparece com 6 partidas ou mais'));
    if (report.series.length) score.append(sparkline(report.series));
    hero.append(score);

    const results = insightsBox('Resultados e consistência');
    if (overview.decided) {
      const bar = node('div', 'insight-result-bar'); bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', `${overview.outcomes.win} vitórias, ${overview.outcomes.draw} empates, ${overview.outcomes.loss} derrotas`);
      for (const key of ['win', 'draw', 'loss']) if (overview.outcomes[key]) { const part = node('span', `result-${key}`, String(overview.outcomes[key])); part.style.flexGrow = String(overview.outcomes[key]); part.title = `${OUTCOME_NAMES[key]}: ${overview.outcomes[key]}`; bar.append(part); }
      results.append(bar);
      results.append(node('p', 'insight-line', `${percent(overview.scorePct)} dos pontos em ${overview.decided} partida${overview.decided === 1 ? '' : 's'} com resultado.`));
    }
    const facts = node('dl', 'insight-facts');
    const addFact = (label, value, note) => { const wrap = node('div'); wrap.append(node('dt', '', label), node('dd', '', value)); if (note) wrap.append(node('small', '', note)); facts.append(wrap); };
    addFact('Erros e erros graves', decimal(overview.seriousPerGame), 'por partida');
    addFact('Lances bons ou melhores', percent(overview.goodShare), 'Melhor, Excelente, Bom e destaques');
    addFact('Perda média', `${decimal(overview.avgLoss * 100)}%`, 'de chance esperada por lance');
    results.append(facts);
    hero.append(results);
    insightsBody.append(hero, ratingPanel);

    // 2. O que treinar primeiro
    const training = insightsBox('O que treinar primeiro', 'ordem estimada por impacto');
    if (!report.priorities.length) {
      training.append(node('p', 'insights-empty', 'Ainda não há amostra para apontar um padrão com segurança. Os limiares existem para não inventar diagnóstico: um tema precisa de 3 lances, uma fase de 15 lances em 3 partidas. Analise mais partidas e esta lista aparece.'));
    }
    const list = node('ol', 'insight-priorities');
    report.priorities.forEach((item, position) => {
      const card = node('li', 'insight-priority');
      const head = node('div', 'insight-priority-head');
      head.append(node('span', 'insight-rank', String(position + 1)), node('h5', '', item.title));
      const chips = node('div', 'insight-chips'); chips.append(node('span', 'insight-chip', item.kind), node('span', `insight-chip confidence-${item.confidence}`, `confiança ${item.confidence} · ${item.sample}`));
      head.append(chips); card.append(head);
      card.append(node('p', 'insight-label', 'O que foi medido'));
      const evidence = node('ul', 'insight-evidence'); for (const text of item.evidence) evidence.append(node('li', '', text)); card.append(evidence);
      card.append(node('p', 'insight-label', 'Sugestão de treino'), node('p', 'insight-action', item.action));
      if (item.question) card.append(node('p', 'insight-question', `Pergunta para se fazer: ${item.question}`));
      if (item.examples.length) { const row = node('div', 'insight-examples'); row.append(node('span', '', 'Exemplos:')); for (const example of item.examples) row.append(moveButton(example, `${example.text}${example.opponent ? ` · vs ${example.opponent}` : ''}`)); card.append(row); }
      list.append(card);
    });
    if (report.priorities.length) training.append(list, node('p', 'insights-hint block', 'Os itens podem se sobrepor: o mesmo lance pode entrar em um tema e em uma fase.'));
    insightsBody.append(training);

    // 3. Pontos fortes
    if (report.strengths.length) {
      const strong = insightsBox('O que está funcionando');
      const wrap = node('div', 'insight-strengths');
      for (const item of report.strengths) {
        const card = node('article', 'insight-strength'); card.append(node('strong', '', item.title), node('p', '', item.evidence));
        if (item.example) card.append(moveButton(item.example)); wrap.append(card);
      }
      strong.append(wrap); insightsBody.append(strong);
    }

    // 4. Fases e qualidade
    const columns = node('div', 'insights-columns');
    const phases = insightsBox('Desempenho por fase', 'precisão estimada');
    for (const phase of report.phases) {
      const row = node('div', `insight-phase${report.weakestPhase && report.weakestPhase.name === phase.name ? ' is-weak' : ''}`);
      const head = node('div', 'insight-phase-head'); head.append(node('strong', '', phase.name));
      head.append(node('span', '', phase.moves ? `${decimal(phase.accuracy)}%` : 'sem lances'));
      row.append(head);
      if (phase.moves) {
        const track = node('span', 'insight-bar-track'); const fill = node('span', 'insight-bar-fill'); fill.style.width = `${Math.max(3, phase.accuracy)}%`; track.append(fill); row.append(track);
        row.append(node('small', '', `${phase.moves} lances · ${decimal(phase.seriousPer100)} erros graves a cada 100${phase.moves < insightsEngine.MIN.phaseMoves ? ' · amostra pequena' : ''}`));
      }
      phases.append(row);
    }
    columns.append(phases);
    const qualities = insightsBox('Qualidade dos lances');
    const order = ['Brilhante', 'Grande lance', 'Melhor', 'Excelente', 'Bom', 'Imprecisão', 'Erro', 'Erro grave', 'Chance perdida'];
    const labels = overview.labels.slice().sort((a, b) => (order.indexOf(a.label) + 99) % 99 - (order.indexOf(b.label) + 99) % 99);
    const maxShare = Math.max(...labels.map((item) => item.share));
    for (const item of labels) {
      const row = node('div', 'insight-bar-row'); const track = node('span', 'insight-bar-track'); const fill = node('span', `insight-bar-fill quality-${item.label.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}`);
      fill.style.width = `${Math.max(4, item.share / maxShare * 100)}%`; track.append(fill);
      row.append(node('span', '', item.label), track, node('b', '', `${item.count} · ${percent(item.share)}`)); qualities.append(row);
    }
    columns.append(qualities); insightsBody.append(columns);

    // 5. Cores e aberturas
    if (report.colors) {
      const box = insightsBox('Cores e aberturas', 'nomes lidos do PGN, sem base de teoria');
      const table = node('div', 'insight-table');
      const addRow = (cells, className) => { const row = node('div', `insight-table-row ${className || ''}`); for (const cell of cells) row.append(node('span', '', cell)); table.append(row); };
      addRow(['', 'Partidas', 'V · E · D', 'Precisão'], 'is-head');
      for (const color of report.colors) if (color.games) addRow([color.side === 'w' ? 'Brancas' : 'Pretas', String(color.games), `${color.wins} · ${color.draws} · ${color.losses}`, color.accuracy === null ? '—' : `${decimal(color.accuracy)}%`], 'is-color');
      for (const opening of report.openings.slice(0, 6)) {
        const cells = [`${opening.family} (${opening.side === 'w' ? 'brancas' : 'pretas'})${opening.weak ? ' · rever' : opening.solid ? ' · sólida' : ''}`, String(opening.games), `${opening.wins} · ${opening.draws} · ${opening.losses}`, opening.accuracy === null ? '—' : `${decimal(opening.accuracy)}%`];
        addRow(cells, opening.weak ? 'is-weak' : opening.solid ? 'is-solid' : '');
      }
      box.append(table);
      if (!report.openings.length) box.append(node('p', 'insights-hint block', 'Estas partidas não trazem o nome da abertura no PGN; só as cores são comparadas.'));
      insightsBody.append(box);
    }

    // 6. Tempo
    if (report.time) {
      const time = report.time, box = insightsBox('Gestão de tempo', `${time.games} de ${report.clock.total} partidas com relógio`);
      const stats = node('dl', 'insight-facts');
      const add = (label, value, note) => { const wrap = node('div'); wrap.append(node('dt', '', label), node('dd', '', value), node('small', '', note)); stats.append(wrap); };
      add('Lances com pouco tempo', percent(time.troubleShare), `${time.troubleMoves} lances com ${Math.round(time.limitExample)} s ou menos, ou 12% do tempo base`);
      add('Erros graves sob pressão', time.troubleSeriousRate === null ? '—' : percent(time.troubleSeriousRate), `contra ${time.normalSeriousRate === null ? '—' : percent(time.normalSeriousRate)} com tempo normal`);
      add('Derrotas por tempo', String(time.timeLosses), 'segundo o cabeçalho do PGN');
      box.append(stats);
      if (time.fastMoves >= insightsEngine.MIN.fastMoves && time.fastErrorRate !== null && time.slowErrorRate !== null && time.fastErrorRate >= time.slowErrorRate * 1.5) {
        box.append(node('p', 'insight-line', `Lances jogados em até 3 s viraram imprecisão, erro ou erro grave em ${percent(time.fastErrorRate)} das vezes, contra ${percent(time.slowErrorRate)} nos mais pensados. Pode haver pressa em posições que pedem cálculo.`));
      }
      insightsBody.append(box);
    }

    // 7. Lances mais caros e partidas para rever
    const lower = node('div', 'insights-columns');
    const costly = insightsBox('Os lances que mais custaram', 'erros e erros graves');
    if (!report.costly.length) costly.append(node('p', 'insights-empty', 'Nenhum erro ou erro grave neste recorte.'));
    for (const move of report.costly) {
      const row = node('div', 'insight-costly-row'); const info = node('div');
      info.append(node('strong', '', `${move.text} · ${move.quality}`), node('span', '', `${move.opponent ? `vs ${move.opponent} · ` : ''}${new Date(move.time).toLocaleDateString('pt-BR')} · −${Math.round(move.loss * 100)} p.p. de chance${move.theme && coach.themes[move.theme] && !['sound', 'positional', 'lost-position'].includes(move.theme) ? ` · ${coach.themes[move.theme].label}` : ''}`));
      row.append(info, moveButton(move, 'Ver lance')); costly.append(row);
    }
    lower.append(costly);
    const review = insightsBox('Partidas para rever', 'menor precisão estimada');
    if (!report.review.length) review.append(node('p', 'insights-empty', 'Aparecem partidas com pelo menos 10 lances classificados.'));
    for (const game of report.review) {
      const row = node('div', 'insight-costly-row'); const info = node('div');
      info.append(node('strong', '', game.title), node('span', '', `${new Date(game.time).toLocaleDateString('pt-BR')} · ${game.outcome ? OUTCOME_NAMES[game.outcome] : 'sem resultado'} · precisão ${decimal(game.accuracy)}%${game.wasted ? ' · vantagem desperdiçada' : ''}`));
      const open = node('button', 'secondary-button insight-link', game.key ? `Ver ${game.key.text}` : 'Rever'); open.type = 'button';
      open.addEventListener('click', () => { const record = byId.get(game.recordId); if (record) { openSavedRecord(record, game.key ? game.key.index : undefined); } });
      row.append(info, open); review.append(row);
    }
    lower.append(review); insightsBody.append(lower);
  }

  async function renderSavedGames() {
    try {
      const records = (await libraryRequest('readonly', 'all')).sort((a, b) =>
        recordRecency(b) - recordRecency(a) || (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0));
      if (insightsVisible) {
        try { renderInsights(records); }
        catch (error) { insightsStatus.textContent = `Não consegui montar o resumo: ${error.message || 'erro nos dados salvos'}.`; }
      }
      savedCount.textContent = String(records.length);
      savedGamesList.replaceChildren();
      savedGamesList.scrollTop = 0;
      if (!records.length) { savedStatus.textContent = 'Suas análises aparecerão aqui quando uma análise de partida terminar.'; return; }
      savedStatus.textContent = `${records.length} análise${records.length === 1 ? '' : 's'} guardada${records.length === 1 ? '' : 's'} neste navegador.`;
      const visibleRecords = records.slice(0, savedGamesShown);
      for (const record of visibleRecords) {
        const card = document.createElement('article'); card.className = 'saved-game-card';
        const title = document.createElement('strong'); title.textContent = recordTitle(record);
        const outcome = getPlayerOutcome(record.headers, record.headers?.Result);
        if (outcome) title.append(createOutcomeBadge(outcome));
        const details = document.createElement('span');
        const date = pgnGameDateTime(record.headers) || new Date(record.savedAt).toLocaleDateString('pt-BR');
        const classes = Object.entries(record.qualities || {}).map(([name, count]) => `${count} ${name.toLowerCase()}`).join(' · ');
        details.textContent = `${date} · ${record.moves || 0} lances · prof. ${record.depth || '—'}${classes ? ` · ${classes}` : ''}`;
        const actions = document.createElement('div'); actions.className = 'saved-game-actions';
        const open = document.createElement('button'); open.type = 'button'; open.textContent = 'Abrir análise'; open.className = 'secondary-button';
        open.addEventListener('click', () => openSavedRecord(record));
        const guided = document.createElement('button'); guided.type = 'button'; guided.textContent = 'APG'; guided.className = 'secondary-button';
        guided.title = 'Gerar uma análise guiada dos momentos decisivos';
        guided.addEventListener('click', () => {
          openSavedRecord(record);
          runGuidedGameAnalysisButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          runSiteSuperAnalysis('game');
        });
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Excluir'; remove.className = 'text-button';
        remove.addEventListener('click', async () => { await libraryRequest('readwrite', 'delete', record.id); renderSavedGames(); });
        actions.append(open, guided, remove); card.append(title, details, actions); savedGamesList.append(card);
      }
      if (records.length > visibleRecords.length) {
        const remaining = records.length - visibleRecords.length;
        const more = document.createElement('button'); more.type = 'button'; more.className = 'secondary-button archive-more';
        more.textContent = `Mostrar mais ${Math.min(40, remaining)} (${remaining} restantes)`;
        more.addEventListener('click', async () => {
          const scrollTop = savedGamesList.scrollTop;
          savedGamesShown += 40;
          await renderSavedGames();
          savedGamesList.scrollTop = scrollTop;
        });
        savedGamesList.append(more);
      }
    } catch (error) { savedStatus.textContent = error.message || 'A biblioteca local não está disponível neste navegador.'; }
  }

  function refreshInsightsForFilters() {
    const refreshId = ++insightsRefreshId;
    clearTimeout(insightsRefreshTimer);
    insightsStatus.classList.add('is-loading');
    insightsStatus.textContent = 'Atualizando estatísticas para o período selecionado…';
    insightsPanel.setAttribute('aria-busy', 'true');
    insightsRefreshTimer = setTimeout(async () => {
      try { await renderSavedGames(); }
      finally {
        if (refreshId === insightsRefreshId) {
          insightsStatus.classList.remove('is-loading');
          insightsPanel.removeAttribute('aria-busy');
        }
      }
    }, 120);
  }

  async function saveCurrentAnalysis() {
    if (!loadedPgnGame || !loadedPgnSource || !gameReviewResults.length || variationSession) return;
    try {
      const record = {
        id: gameIdentity(loadedPgnSource, activeGameSource), pgn: loadedPgnSource,
        source: activeGameSource || null, title: activeGameSource?.title || '', headers: { ...gameHeaders },
        moves: Math.max(0, history.length - 1), depth: gameReviewResults.find(Boolean)?.depth || selectedDepth,
        savedAt: Date.now(), qualities: qualityCounts(gameReviewResults), results: JSON.parse(JSON.stringify(gameReviewResults.map((item) => {
          if (!item) return null;
          const { ui, ...serializable } = item; return serializable;
        })))
      };
      await libraryRequest('readwrite', 'put', record);
      await renderSavedGames();
      savedStatus.textContent = `Análise de “${recordTitle(record)}” salva neste navegador.`;
      if (autoChessComBusy) {
        cloudLastSeenGameUrl = record.source?.url || cloudLastSeenGameUrl;
        window.MyChess6Cloud.lastSeenGameUrl = cloudLastSeenGameUrl;
        const nextGame = autoChessComQueue.shift();
        if (nextGame) startAutoChessComGame(nextGame);
        else {
          autoChessComBusy = false;
          window.MyChess6Cloud.archiveState = 'done';
          chessComStatus.textContent = window.MyChess6Cloud.archiveRemaining
            ? `Lote pronto: ${recordTitle(record)}. Ainda restam ${window.MyChess6Cloud.archiveRemaining} partidas neste arquivo.`
            : `Análise automática pronta: ${recordTitle(record)}.`;
        }
      }
    } catch (error) {
      savedStatus.textContent = error.message || 'Não foi possível salvar esta análise.';
      if (autoChessComBusy) {
        autoChessComBusy = false; autoChessComQueue = [];
        window.MyChess6Cloud.archiveState = 'error';
        chessComStatus.textContent = 'A análise terminou, mas não consegui salvá-la na biblioteca local.';
      }
    }
  }

  function openSavedRecord(record, moveIndex) {
    activeGameSource = record.source || null;
    if (!loadPgn(record.pgn)) return;
    const player = chessComUsername.value.trim().toLowerCase();
    const savedHeaders = record.headers || {};
    const savedWhite = (savedHeaders.White || gameHeaders.White || '').trim().toLowerCase();
    const savedBlack = (savedHeaders.Black || gameHeaders.Black || '').trim().toLowerCase();
    const titlePlayers = (record.title || record.source?.title || '').split(/\s+[×x]\s+/i);
    const white = savedWhite || (titlePlayers[0] || '').trim().toLowerCase();
    const black = savedBlack || (titlePlayers[1] || '').trim().toLowerCase();
    if (player && (white === player || black === player)) {
      flipped = black === player;
      render();
    }
    gameReviewResults = JSON.parse(JSON.stringify(record.results || []));
    gameAnalysisPanel.hidden = false;
    gameProgressBar.value = 100;
    gameProgressLabel.textContent = `Análise salva · profundidade ${record.depth || '—'}.`;
    gameProgressCount.textContent = `${record.results?.filter(Boolean).length || 0}/${history.length} posições restauradas`;
    gameAnalysisRows.replaceChildren();
    gameReviewResults.forEach((result, index) => {
      if (!result) return;
      result.ui = appendGameResult(result);
      if (index > 0 && result.quality) {
        const badge = document.createElement('span'); badge.className = `move-quality-badge quality-${qualityKindForDisplay(result.quality)}`; badge.textContent = result.quality.label;
        const explanation = document.createElement('p'); explanation.className = 'move-quality-explanation'; explanation.textContent = result.quality.explanation;
        result.ui.details.append(badge, explanation);
      }
    });
    renderGameSummary(gameReviewResults, true);
    renderMoveList(); renderAdvantageChart(gameReviewResults); renderGameReviewAtCurrentPosition();
    savedStatus.textContent = `Reaberta: ${recordTitle(record)}.`;
    if (Number.isInteger(moveIndex) && moveIndex > 0) goTo(moveIndex); // vindo da Visão geral: abre direto no lance citado
    document.querySelector('.moves-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function chessComJsonp(url) {
    return new Promise((resolve, reject) => {
      const callback = `__myChess4Jsonp${Date.now()}${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const cleanup = () => { delete window[callback]; script.remove(); clearTimeout(timer); };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Chess.com não respondeu a tempo.')); }, 18000);
      window[callback] = (data) => { cleanup(); resolve(data); };
      script.onerror = () => { cleanup(); reject(new Error('Não consegui acessar os dados públicos do Chess.com.')); };
      script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callback}`;
      document.head.append(script);
    });
  }

  // Os endereços dos arquivos mensais vêm da resposta da API; só aceitamos a API pública do Chess.com
  // (isto também impede que uma resposta adulterada faça o JSONP carregar um script de outro site).
  function assertChessComUrl(url) {
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error('Endereço inválido recebido do Chess.com; ignorado.'); }
    if (parsed.origin !== 'https://api.chess.com' || !parsed.pathname.startsWith('/pub/')) throw new Error('Endereço inesperado recebido do Chess.com; ignorado por segurança.');
  }

  async function chessComGet(url) {
    assertChessComUrl(url);
    let response;
    try { response = await fetch(url, { headers: { Accept: 'application/json' } }); }
    catch { return chessComJsonp(url); } // só falhas de rede/CORS usam o JSONP; erros HTTP abaixo são definitivos
    if (response.status === 404) throw new Error('O Chess.com não encontrou esse perfil ou arquivo. Confira o nome de usuário.');
    if (response.status === 429) throw new Error('O Chess.com limitou temporariamente as consultas. Aguarde e tente de novo.');
    if (!response.ok) throw new Error(`Chess.com respondeu com erro ${response.status}.`);
    return response.json();
  }

  function formatChessComGame(game) {
    const player = (game.white?.username || '').toLowerCase() === chessComUsername.value.trim().toLowerCase() ? game.white : game.black;
    const opponent = player === game.white ? game.black : game.white;
    const outcome = player?.result === 'win' ? 'Vitória' : ['agreed', 'repetition', 'stalemate', 'insufficient'].includes(player?.result) ? 'Empate' : player?.result ? 'Derrota' : 'Resultado —';
    const outcomeKey = player?.result === 'win' ? 'win' : ['agreed', 'repetition', 'stalemate', 'insufficient'].includes(player?.result) ? 'draw' : player?.result ? 'loss' : null;
    const date = game.end_time ? formatGameDateTime(new Date(game.end_time * 1000)) : 'Data —';
    return { game, player, opponent, outcome, outcomeKey, date };
  }

  function renderChessComGames() {
    chessComGames.replaceChildren();
    const speed = chessComTimeClass.value;
    const games = chessComGamesCache.filter((game) => speed === 'all' || game.time_class === speed);
    if (!games.length) { chessComGames.textContent = 'Nenhuma partida encontrada com esse filtro.'; return; }
    for (const game of games.slice(0, chessComShownGames)) {
      const item = formatChessComGame(game);
      const card = document.createElement('article'); card.className = 'external-game-card';
      const info = document.createElement('div'); info.className = 'external-game-info';
      const heading = document.createElement('strong'); heading.textContent = `vs. ${item.opponent?.username || 'adversário'}`;
      const ownRating = Number(item.player?.rating), opponentRating = Number(item.opponent?.rating);
      const ratings = [Number.isFinite(ownRating) && ownRating > 0 ? `você ${ownRating}` : '', Number.isFinite(opponentRating) && opponentRating > 0 ? `adversário ${opponentRating}` : ''].filter(Boolean).join(' · ');
      const meta = document.createElement('span'); meta.textContent = `${item.date} · ${game.time_class || game.time_control || 'xadrez'} · ${item.outcome}${ratings ? ` · ${ratings}` : ''}`;
      if (item.outcomeKey) meta.append(createOutcomeBadge(item.outcomeKey));
      info.append(heading, meta);
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Analisar'; button.className = 'secondary-button';
      button.addEventListener('click', () => {
        if (!game.pgn) { chessComStatus.textContent = 'O Chess.com não forneceu PGN para esta partida.'; return; }
        const source = { url: game.url || '', title: `${game.white?.username || 'Brancas'} × ${game.black?.username || 'Pretas'}`, platform: 'Chess.com', timeClass: game.time_class || '' };
        if (loadPgn(game.pgn)) { activeGameSource = source; document.querySelector('.moves-card').scrollIntoView({ behavior: 'smooth', block: 'start' }); requestGameAnalysis(); }
      });
      const guided = document.createElement('button'); guided.type = 'button'; guided.textContent = 'APG'; guided.className = 'secondary-button';
      guided.title = 'Usar a análise automática salva para gerar uma análise guiada';
      guided.addEventListener('click', async () => {
        try {
          const source = { url: game.url || '', title: `${game.white?.username || 'Brancas'} × ${game.black?.username || 'Pretas'}`, platform: 'Chess.com', timeClass: game.time_class || '' };
          const record = await libraryRequest('readonly', 'get', gameIdentity(game.pgn || '', source));
          if (!record) { chessComStatus.textContent = 'Esta partida ainda não tem análise Stockfish salva. Use “Analisar” e escolha profundidade 16, ou aguarde a análise automática aparecer na biblioteca.'; return; }
          openSavedRecord(record);
          runGuidedGameAnalysisButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          runSiteSuperAnalysis('game');
        } catch (error) { chessComStatus.textContent = error.message || 'Não consegui abrir a análise salva desta partida.'; }
      });
      const actions = document.createElement('div'); actions.className = 'external-game-actions'; actions.append(button, guided);
      card.append(info, actions); chessComGames.append(card);
    }
    if (games.length > chessComShownGames) {
      const more = document.createElement('button'); more.type = 'button'; more.className = 'secondary-button archive-more'; more.textContent = `Mostrar mais (${games.length - chessComShownGames})`;
      more.addEventListener('click', () => { chessComShownGames += 24; renderChessComGames(); }); chessComGames.append(more);
    }
  }

  chessComSearch.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = chessComUsername.value.trim();
    if (!/^[A-Za-z0-9_-]{2,30}$/.test(username)) { chessComStatus.textContent = 'Confira o nome de usuário e tente novamente.'; return; }
    chessComStatus.textContent = 'Buscando jogador e arquivos mensais…'; chessComGames.replaceChildren(); chessComMonth.disabled = true;
    try {
      const archives = await chessComGet(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`);
      chessComArchiveList = Array.isArray(archives.archives) ? archives.archives.slice().reverse() : [];
      if (!chessComArchiveList.length) throw new Error('Não encontrei arquivos públicos para esse usuário. Confira o nome ou a visibilidade do perfil.');
      chessComMonth.replaceChildren();
      chessComArchiveList.forEach((url) => { const option = document.createElement('option'); option.value = url; option.textContent = url.match(/(\d{4})\/(\d{2})$/)?.slice(1).join('/') || url; chessComMonth.append(option); });
      chessComMonth.disabled = false; chessComUsername.value = username;
      await loadChessComArchive(chessComArchiveList[0]);
    } catch (error) {
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = error.message || 'Falha ao buscar o jogador. Verifique a conexão.';
    }
  });

  async function loadChessComArchive(url) {
    window.MyChess6Cloud.archiveUrl = url;
    window.MyChess6Cloud.archiveState = 'loading';
    window.MyChess6Cloud.archiveRemaining = 0;
    chessComStatus.textContent = 'Carregando partidas deste mês…'; chessComGames.replaceChildren();
    try {
      const data = await chessComGet(url);
      chessComGamesCache = Array.isArray(data.games) ? data.games.slice().reverse() : [];
      chessComShownGames = 24; renderChessComGames();
      chessComStatus.textContent = `${chessComGamesCache.length} partidas encontradas neste arquivo.`;
      if (window.__MyChess6ScanAllArchives) await autoAnalyzeUnanalyzedChessComGames();
      else window.MyChess6Cloud.archiveState = 'done';
    } catch (error) {
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = error.message || 'Falha ao carregar esse mês.';
    }
  }

  async function autoAnalyzeUnanalyzedChessComGames() {
    if (!window.__MyChess6ScanAllArchives || autoChessComBusy || pendingAnalysis || activeAnalysis || analysisStopping) return;
    autoChessComBusy = true;
    try {
      const games = chessComGamesCache.filter((game) => game.pgn && game.url && (!game.rules || game.rules === 'chess'));
      if (!games.length) {
        autoChessComBusy = false;
        window.MyChess6Cloud.archiveState = 'done';
        chessComStatus.textContent = 'Nenhuma partida com PGN está disponível para análise automática.';
        return;
      }
      const records = await libraryRequest('readonly', 'all');
      const candidates = games.slice().reverse().filter((game) =>
        !records.some((record) => record.id === gameIdentity(game.pgn, { url: game.url }))
        && hasAnalyzableChessComPgn(game.pgn));
      const configuredLimit = Number(window.__MyChess6MaxGamesPerArchive);
      const limit = Number.isInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : candidates.length;
      autoChessComQueue = candidates.slice(0, limit);
      window.MyChess6Cloud.archiveRemaining = Math.max(0, candidates.length - autoChessComQueue.length);
      if (!autoChessComQueue.length) {
        autoChessComBusy = false;
        window.MyChess6Cloud.archiveState = 'done';
        chessComStatus.textContent = 'Todas as partidas com PGN deste arquivo já têm análise salva.';
        return;
      }
      window.MyChess6Cloud.archiveState = 'analyzing';
      startAutoChessComGame(autoChessComQueue.shift());
    } catch (error) {
      autoChessComBusy = false;
      autoChessComQueue = [];
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = error.message || 'Não consegui iniciar a análise automática.';
    }
  }

  function hasAnalyzableChessComPgn(pgn) {
    try { return parsePgn(pgn).history.length > 1; }
    catch { return false; }
  }

  function startAutoChessComGame(game) {
    const source = { url: game.url || '', title: `${game.white?.username || 'Brancas'} × ${game.black?.username || 'Pretas'}`, platform: 'Chess.com', timeClass: game.time_class || '' };
    if (!loadPgn(game.pgn)) {
      autoChessComBusy = false; autoChessComQueue = [];
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = 'Não consegui carregar o PGN da nova partida.';
      return;
    }
    activeGameSource = source;
    chessComStatus.textContent = `Analisando automaticamente: ${source.title}…`;
    requestGameAnalysis({ skipDepthPrompt: true, depth: 16 }).then((started) => {
      if (!started && autoChessComBusy) {
        autoChessComBusy = false; autoChessComQueue = [];
        window.MyChess6Cloud.archiveState = 'error';
        chessComStatus.textContent = 'A análise automática não iniciou; nenhum resultado foi salvo.';
      }
    }).catch((error) => {
      autoChessComBusy = false; autoChessComQueue = [];
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = error.message || 'Não consegui iniciar a análise automática.';
    });
  }

  chessComMonth.addEventListener('change', () => { if (chessComMonth.value) loadChessComArchive(chessComMonth.value); });
  chessComTimeClass.addEventListener('change', () => { chessComShownGames = 24; renderChessComGames(); });
  document.querySelector('#export-library').addEventListener('click', async () => {
    try {
      const records = await libraryRequest('readonly', 'all');
      const blob = new Blob([JSON.stringify({ format: 'MyChess library', version: 1, exportedAt: new Date().toISOString(), games: records }, null, 2)], { type: 'application/json' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `gabes-chess-biblioteca-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
    } catch (error) { savedStatus.textContent = error.message || 'Falha ao exportar biblioteca.'; }
  });
  document.querySelector('#import-library-button').addEventListener('click', () => document.querySelector('#import-library-file').click());
  document.querySelector('#import-library-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text()); const games = Array.isArray(data.games) ? data.games : [];
      if (!games.length) throw new Error("Esse arquivo não contém análises compatíveis do Gabe's Chess.");
      const valid = games.filter((game) => game && typeof game.id === 'string' && typeof game.pgn === 'string' && Array.isArray(game.results)
        && game.results.every((item) => item === null || (typeof item === 'object' && !Array.isArray(item))));
      for (const game of valid) await libraryRequest('readwrite', 'put', game);
      await renderSavedGames();
      const skipped = games.length - valid.length;
      savedStatus.textContent = `${valid.length} registro(s) importado(s).${skipped ? ` ${skipped} ignorado(s) por estarem incompletos ou inválidos.` : ''}`;
    } catch (error) { savedStatus.textContent = error.message || 'Arquivo de biblioteca inválido.'; }
    event.target.value = '';
  });

  function selectLibraryTab(showInsights) {
    insightsVisible = showInsights;
    libraryPanel.hidden = showInsights; insightsPanel.hidden = !showInsights;
    libraryTab.classList.toggle('selected', !showInsights); insightsTab.classList.toggle('selected', showInsights);
    libraryTab.setAttribute('aria-selected', String(!showInsights)); insightsTab.setAttribute('aria-selected', String(showInsights));
    if (showInsights) renderSavedGames();
  }
  libraryTab.addEventListener('click', () => selectLibraryTab(false));
  insightsTab.addEventListener('click', () => selectLibraryTab(true));
  insightsPeriod.addEventListener('change', () => {
    insightsCustomPeriodWrap.hidden = insightsPeriod.value !== 'custom';
    refreshInsightsForFilters();
  });
  insightsCustomPeriod.addEventListener('input', () => refreshInsightsForFilters());
  insightsSpeed.addEventListener('change', () => refreshInsightsForFilters());

  function loadPgn(source) {
    try {
      const fenOnly = fenOnlyPattern.test(source) && !/\[\s*Event\b/.test(source);
      let parsed;
      if (fenOnly) {
        const start = positionFromUserFen(source.trim().split(/\r?\n/)[0]);
        parsed = { history: [{ position: clone(start), move: null, san: '', side: start.turn, moveNumber: start.fullmove }], headers: {}, result: '*', extraGames: 0 };
      } else parsed = parsePgn(source);
      invalidateAnalysis(fenOnly ? 'Posição FEN carregada.' : 'Partida PGN carregada.');
      resetGuidedGamePane();
      exerciseState = null;
      punishmentPlayback = null;
      loadedPgnGame = !fenOnly; // com um FEN avulso o tabuleiro fica livre: lances novos seguem a partir da posição
      loadedPgnSource = fenOnly ? null : source;
      variationSession = null; variationNeedsAnalysis = false;
      gameReviewResults = [];
      renderAdvantageChart(gameReviewResults);
      history = parsed.history; historyIndex = 0; position = clone(history[0].position);
      gameHeaders = parsed.headers; gameResult = parsed.result;
      flipped = !fenOnly
        && (gameHeaders.Black || '').trim().toLowerCase() === chessComUsername.value.trim().toLowerCase();
      currentBoardQuality = null;
      syncRatingsFromHeaders(gameHeaders);
      selected = -1; legalTargets = []; lastMove = null;
      document.querySelector('#pgn-text').value = '';
      render(); showImportStatus(fenOnly ? 'Posição FEN carregada. Faça lances no tabuleiro ou use “Analisar posição”.' : `Partida carregada: ${history.length - 1} lances.${parsed.extraGames ? ` O arquivo tem mais ${parsed.extraGames} partida${parsed.extraGames > 1 ? 's' : ''}; apenas a primeira foi carregada.` : ''}`, 'success');
      document.querySelector('.paste-pgn').open = false;
      return true;
    } catch (error) {
      showImportStatus(error.message || 'Não foi possível ler esse PGN.', 'error');
      return false;
    }
  }

  document.querySelector('#choose-pgn').addEventListener('click', () => pgnFile.click());
  pgnFile.addEventListener('change', async () => {
    const file = pgnFile.files && pgnFile.files[0];
    if (!file) return;
    try { activeGameSource = null; loadPgn(await file.text()); }
    catch { showImportStatus('Não consegui ler o arquivo. Escolha um arquivo PGN de texto.', 'error'); }
    pgnFile.value = '';
  });
  document.querySelector('#load-pgn-text').addEventListener('click', () => { activeGameSource = null; loadPgn(document.querySelector('#pgn-text').value); });

  function syncRatingsFromHeaders(headers) {
    for (const [key, input] of [['WhiteElo', whiteRatingInput], ['BlackElo', blackRatingInput]]) {
      const rating = Number(headers[key]);
      input.value = Number.isFinite(rating) && rating >= 400 && rating <= 3000 ? String(rating) : '1200';
    }
  }

  function updateAnalysisControls() {
    const busy = Boolean(pendingAnalysis || activeAnalysis || analysisStopping);
    analyzeButton.disabled = busy;
    cancelAnalysisButton.hidden = !busy;
    cancelAnalysisButton.disabled = analysisStopping;
    analysisModes.forEach((button) => { button.disabled = busy; });
    analyzeGameButton.disabled = busy || history.length < 2;
    const gameBusy = gameBatch || pendingAnalysis?.kind === 'game' || activeAnalysis?.kind === 'game';
    analyzeGameButton.textContent = gameBusy ? (variationSession ? 'Analisando variação…' : 'Analisando partida…') : variationSession ? 'Reanalisar variação' : 'Analisar partida';
    if (engineState === 'loading' && pendingAnalysis?.kind !== 'game' && pendingAnalysis) analyzeButton.innerHTML = '<span aria-hidden="true">…</span> Carregando Stockfish';
    else if (activeAnalysis?.kind === 'game' || pendingAnalysis?.kind === 'game') analyzeButton.innerHTML = variationSession ? '<span aria-hidden="true">…</span> Análise da variação em andamento' : '<span aria-hidden="true">…</span> Análise da partida em andamento';
    else if (activeAnalysis || analysisStopping) analyzeButton.innerHTML = '<span aria-hidden="true">…</span> Analisando posição';
    else analyzeButton.innerHTML = '<span aria-hidden="true">▶</span> Analisar posição';
  }

  function setEngineState(state, message) {
    engineState = state;
    engineStatusText.textContent = message;
    updateAnalysisControls();
  }

  function clearAnalysisView(message = 'Use o Stockfish para avaliar esta posição.') {
    renderBestMoves(null);
    analysisPlaceholder.hidden = false;
    analysisResults.hidden = true;
    analysisResults.classList.remove('from-game-review', 'exercise-mode');
    revealExerciseButton.hidden = true; exerciseFeedback.hidden = true;
    punishmentWalkthrough.hidden = true;
    gameReviewQuality.hidden = true;
    superAnalysisActions.hidden = true; superAnalysisStatus.textContent = '';
    superAnalysisChallenge.hidden = true; superAnalysisResult.hidden = true;
    siteSuperAnalysisAbortController?.abort(); siteSuperAnalysisAbortController = null;
    siteSuperAnalysisRequestId += 1; siteSuperAnalysisBusy = false; runSiteSuperAnalysisButton.disabled = false;
    gameReviewQuestion.hidden = true;
    moveAlternatives.hidden = true;
    updateMoveAnalysisPanels();
    analysisProgress.hidden = true;
    progressBar.value = 0;
    progressLabel.textContent = 'Preparando motor…';
    progressStats.textContent = '';
    bestMoveLabel.textContent = '—';
    principalVariation.textContent = 'Aguardando resultado do Stockfish.';
    evaluationNumber.textContent = '—';
    evaluationNumber.classList.remove('positive', 'negative');
    evaluationBarLabel.classList.remove('positive', 'negative');
    evaluationSide.textContent = 'Aguardando análise';
    evaluationFill.style.height = '50%';
    evaluationBarLabel.textContent = '—';
    evaluationBar.setAttribute('aria-label', 'Avaliação ainda indisponível');
    if (message) engineStatusText.textContent = message;
  }

  function renderMoveAlternatives(playedResult, beforeResult) {
    moveAlternativesList.replaceChildren();
    if (!playedResult?.playedMove || !beforeResult?.bestMove || !beforeResult?.fen) {
      moveAlternatives.hidden = true;
      updateMoveAnalysisPanels();
      return;
    }
    let root;
    try { root = positionFromFen(beforeResult.fen); }
    catch { moveAlternatives.hidden = true; updateMoveAnalysisPanels(); return; }
    const played = playedResult.playedMove;
    moveAlternativesContext.textContent = `Na posição antes de ${played.moveNumber}${played.side === 'w' ? '.' : '…'} ${played.san}`;

    const playedRow = document.createElement('li');
    playedRow.className = 'move-alternative-played';
    const playedLabel = document.createElement('span'); playedLabel.textContent = 'JOGADO';
    const playedSan = document.createElement('strong'); playedSan.textContent = `${played.moveNumber}${played.side === 'w' ? '.' : '…'} ${played.san}`;
    const playedEval = document.createElement('span'); playedEval.className = 'move-alternative-evaluation';
    playedEval.textContent = playedResult.score
      ? formatEvaluationForSide(playedResult.score, playedResult.turn, beforeResult.turn)
      : 'avaliação indisponível';
    playedRow.append(playedLabel, playedSan, playedEval);
    moveAlternativesList.append(playedRow);

    const candidates = [];
    const add = (pv, score) => {
      const line = String(pv || '').trim();
      const token = line.split(/\s+/)[0] || '';
      if (!token || candidates.some((item) => item.token === token)) return;
      const move = parseUciMove(root, token);
      if (!move) return;
      const san = moveToSan(root, move);
      if (san === played.san) return;
      candidates.push({ token, san, pv: line, score: score || null });
    };
    add(beforeResult.pvUci || beforeResult.bestMove, beforeResult.score);
    for (const line of beforeResult.variations || []) add(line.pv, line.score);
    candidates.slice(0, 3).forEach((candidate, index) => {
      const item = document.createElement('li'); item.className = `move-alternative-option move-alternative-option-${index + 1}`;
      const heading = document.createElement('div'); heading.className = 'move-alternative-option-heading';
      const rank = document.createElement('span'); rank.className = 'move-alternative-rank'; rank.textContent = String(index + 1);
      const san = document.createElement('strong'); san.textContent = `${root.fullmove}${root.turn === 'w' ? '.' : '…'} ${candidate.san}`;
      const evaluation = document.createElement('span'); evaluation.className = 'move-alternative-evaluation';
      evaluation.textContent = candidate.score
        ? formatEvaluationForSide(candidate.score, beforeResult.turn, beforeResult.turn)
        : '—';
      heading.append(rank, san, evaluation);
      const continuation = document.createElement('p'); continuation.textContent = formatPrincipalVariation(beforeResult.fen, candidate.pv);
      item.append(heading, continuation); moveAlternativesList.append(item);
    });
    moveAlternatives.hidden = candidates.length === 0;
    updateMoveAnalysisPanels();
  }

  function renderGameReviewAtCurrentPosition() {
    const result = gameReviewResults[historyIndex];
    updateSuperAnalysisActions();
    renderBestMoves(result);
    renderBoardQualityMarker();
    revealExerciseButton.hidden = true; exerciseFeedback.hidden = true;
    analysisResults.classList.remove('exercise-mode');
    if (!result) { moveAlternatives.hidden = true; updateMoveAnalysisPanels(); renderPunishmentControls(); return; }
    if (exerciseActiveHere()) { renderExercisePrompt(); renderPunishmentControls(); return; }
    analysisPlaceholder.hidden = true;
    analysisResults.hidden = false;
    analysisProgress.hidden = true;
    analysisResults.classList.add('from-game-review');
    gameReviewQuality.hidden = false;
    const previousResult = gameReviewResults[historyIndex - 1];
    renderMoveAlternatives(result, previousResult);
    if (result.score) showEvaluation(result.score.type, result.score.value, result.turn);
    bestMoveLabel.textContent = result.best;
    principalVariation.textContent = result.pv;
    const move = result.playedMove;
    gameReviewContext.textContent = move
      ? `${variationSession ? 'JOGADA HIPOTÉTICA' : 'QUALIDADE DO LANCE'} · ${move.moveNumber}${move.side === 'w' ? '.' : '…'} ${move.san}`
      : 'ANÁLISE DA POSIÇÃO INICIAL';
    gameReviewQuestion.hidden = true;
    if (result.quality) {
      gameReviewBadge.hidden = false;
      setGameReviewQualityBadge(result.quality);
      gameReviewExplanation.textContent = result.quality.explanation;
    } else {
      gameReviewQuality.classList.remove('quality-panel-best', 'quality-panel-excellent', 'quality-panel-good', 'quality-panel-great', 'quality-panel-brilliant', 'quality-panel-inaccuracy', 'quality-panel-mistake', 'quality-panel-blunder', 'quality-panel-missed', 'quality-panel-unknown');
      gameReviewBadge.hidden = true;
      gameReviewExplanation.textContent = 'Esta é a posição inicial: ainda não há um lance anterior para classificar.';
      gameReviewQuestion.hidden = true;
    }
    gameReviewDepth.textContent = `Análise da partida · profundidade ${result.depth || selectedDepth} · calculada pelo Stockfish`;
    if (exerciseState?.revealed && exerciseState.feedback && historyIndex === exerciseState.moveIndex) { exerciseFeedback.textContent = exerciseState.feedback; exerciseFeedback.hidden = false; }
    engineStatusText.textContent = `Exibindo a análise da partida para ${move ? `o lance ${move.moveNumber}${move.side === 'w' ? '.' : '…'} ${move.san}` : 'a posição inicial'}.`;
    renderPunishmentControls();
  }

  function renderPunishmentControls() {
    if (punishmentPlayback && (punishmentPlayback.expectedIndex !== historyIndex || punishmentPlayback.expectedFen !== currentFen(position))) {
      punishmentPlayback = null;
    }
    if (punishmentPlayback) {
      const playback = punishmentPlayback;
      const done = playback.nextIndex >= playback.tokens.length;
      punishmentWalkthrough.hidden = false;
      punishmentWalkthrough.classList.add('is-playing');
      punishmentStatus.textContent = done
        ? `Linha concluída · ${playback.nextIndex} lances reproduzidos.`
        : playback.lastSan
          ? `${playback.nextIndex}/${playback.tokens.length} · ${playback.lastSan}`
          : `${playback.tokens.length} lances disponíveis · a linha do motor é uma sugestão.`;
      punishmentStepButton.textContent = done ? 'Linha concluída' : playback.lastSan ? 'Próximo lance' : 'Ver primeiro lance';
      punishmentStepButton.disabled = done;
      return;
    }

    const result = gameReviewResults[historyIndex];
    const punishable = Boolean(result?.playedMove && result.pvUci && result.quality
      && ['inaccuracy', 'mistake', 'blunder'].includes(result.quality.kind) && !exerciseActiveHere());
    punishmentWalkthrough.hidden = !punishable;
    punishmentWalkthrough.classList.remove('is-playing');
    if (punishable) {
      const plies = result.pvUci.trim().split(/\s+/).filter(Boolean).slice(0, 16).length;
      punishmentStatus.textContent = `${plies} meios-lances calculados na resposta principal.`;
      punishmentStepButton.textContent = 'Ver a resposta, lance a lance';
      punishmentStepButton.disabled = false;
    }
  }

  function advancePunishmentLine() {
    if (!punishmentPlayback) {
      const source = gameReviewResults[historyIndex];
      if (!source?.playedMove || !source.pvUci) return;
      const tokens = source.pvUci.trim().split(/\s+/).filter(Boolean).slice(0, 16);
      if (!tokens.length) return;
      if (!variationSession) beginVariationMode(true);
      if (!variationSession) return;
      punishmentPlayback = { tokens, nextIndex: 0, expectedIndex: historyIndex, expectedFen: currentFen(position), lastSan: '', applying: false };
    }
    const playback = punishmentPlayback;
    if (playback.expectedIndex !== historyIndex || playback.expectedFen !== currentFen(position)) {
      punishmentPlayback = null;
      renderPunishmentControls();
      return;
    }
    const token = playback.tokens[playback.nextIndex];
    if (!token) { renderPunishmentControls(); return; }
    const move = parseUciMove(position, token);
    if (!move) {
      playback.tokens = playback.tokens.slice(0, playback.nextIndex);
      renderPunishmentControls();
      engineStatusText.textContent = 'A linha do motor terminou: o próximo lance não pôde ser validado legalmente.';
      return;
    }
    const san = moveToSan(position, move);
    playback.nextIndex += 1;
    playback.lastSan = `${position.turn === 'w' ? `${position.fullmove}.` : `${position.fullmove}…`}${san}`;
    playback.expectedIndex = historyIndex + 1;
    playback.expectedFen = currentFen(applyMove(position, move));
    playback.applying = true;
    commitMove(move, true);
    playback.applying = false;
    variationNeedsAnalysis = playback.nextIndex < playback.tokens.length;
    engineStatusText.textContent = `Linha de punição do Stockfish: ${playback.nextIndex} de ${playback.tokens.length} meios-lances reproduzidos.`;
    renderPunishmentControls();
  }

  function stopEngine() {
    window.clearTimeout(engineTimer);
    if (engineWorker) {
      try { engineWorker.postMessage('quit'); } catch {}
      engineWorker.terminate(); engineWorker = null;
    }
  }

  function failEngine(message) {
    stopEngine(); pendingAnalysis = null; activeAnalysis = null; analysisStopping = false;
    if (autoChessComBusy) {
      autoChessComBusy = false; autoChessComQueue = [];
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = 'A análise automática não pôde iniciar. Verifique o Stockfish local.';
    }
    variationNeedsAnalysis = false;
    if (gameBatch) {
      gameBatch = null;
      gameProgressLabel.textContent = 'A análise da partida falhou. Verifique o motor local e tente novamente.';
    }
    clearAnalysisView(message); setEngineState('error', message);
  }

  function positionChangeUci() {
    pendingAnalysis = null;
    if (gameBatch) {
      gameProgressLabel.textContent = 'Análise da partida cancelada porque a posição foi alterada.';
      gameBatch = null;
      gameAnalysisPanel.hidden = false;
    }
    clearAnalysisView(null);
    if (activeAnalysis && !analysisStopping) {
      analysisStopping = true;
      analysisCancellationMessage = 'A posição mudou; a análise anterior foi cancelada. Inicie uma nova análise quando quiser.';
      engineStatusText.textContent = 'Interrompendo análise da posição anterior…';
      try { engineWorker?.postMessage('stop'); } catch {}
    } else if (!activeAnalysis) {
      engineStatusText.textContent = engineState === 'ready' ? 'Motor pronto. Analise a posição atual quando quiser.' : 'A posição mudou. O Stockfish iniciará quando você analisar.';
    }
    updateAnalysisControls();
  }

  let lastGameAnalysisDepth = 0;
  let analysisCancellationMessage = 'Análise cancelada com segurança.';

  function invalidateAnalysis(message) {
    analysisCancellationMessage = message;
    positionChangeUci();
  }

  function parseUciMove(pos, token) {
    const match = token.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/i);
    if (!match) return null;
    const from = 'abcdefgh'.indexOf(match[1][0]) + (8 - Number(match[1][1])) * 8;
    const to = 'abcdefgh'.indexOf(match[2][0]) + (8 - Number(match[2][1])) * 8;
    const promotion = match[3] ? match[3].toUpperCase() : '';
    return legalMoves(pos, from).find((move) => move.to === to && (move.promotion || '').toUpperCase() === promotion) || null;
  }

  function analysisCacheKey(fen, depth) {
    return `${engineName}|${depth}|${fen}`;
  }

  function rememberAnalysis(fen, depth, result) {
    if (!result.score && !result.bestMove && !result.pv) return;
    const key = analysisCacheKey(fen, depth);
    analysisCache.delete(key);
    analysisCache.set(key, { ...result });
    if (analysisCache.size > analysisCacheLimit) analysisCache.delete(analysisCache.keys().next().value);
  }

  function lookupAnalysis(fen, depth) {
    const key = analysisCacheKey(fen, depth);
    const result = analysisCache.get(key);
    if (!result) return null;
    analysisCache.delete(key);
    analysisCache.set(key, result);
    return result;
  }

  function resultEvaluation(score, turn) {
    if (!score) return 'Avaliação indisponível';
    const whiteScore = turn === 'w' ? score.value : -score.value;
    if (score.type === 'mate') return `${whiteScore > 0 ? '+' : whiteScore < 0 ? '−' : ''}M${Math.abs(whiteScore)}`;
    const pawns = whiteScore / 100;
    return pawns > 0 ? `+${pawns.toFixed(1)}` : pawns < 0 ? `−${Math.abs(pawns).toFixed(1)}` : '0.0';
  }

  function superAnalysisPrompt({ includeMatchDetails = false } = {}) {
    const entry = history[historyIndex], before = gameReviewResults[historyIndex - 1], after = gameReviewResults[historyIndex];
    if (!entry?.move || !before?.score || !after?.score || !before.pv || !after.pv || before.depth !== after.depth) return '';
    const move = `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'} ${entry.san}`;
    const quality = after.quality;
    const loss = Number.isFinite(quality?.loss) ? `Perda estimada pelo app: ${(quality.loss * 100).toFixed(1)} pontos percentuais de chance.` : '';
    const players = includeMatchDetails ? [gameHeaders.White, gameHeaders.Black].filter((name) => name && name !== '?').join(' × ') : '';
    return [
      'Faça uma super análise didática deste lance de xadrez usando as evidências do Stockfish abaixo.',
      'Explique a causa concreta da qualidade do lance. Verifique as sequências pelas posições e linhas fornecidas; não invente peças, ameaças ou motivos estratégicos. Diferencie o que a linha demonstra de uma hipótese. Se os dados não provarem uma causa, diga isso claramente.',
      'Compare o lance jogado com a melhor alternativa do motor. Se houver uma tática, mostre a sequência exata que a comprova. Não use apenas “perde material” ou a diferença numérica de avaliação como explicação.',
      '',
      includeMatchDetails ? `Partida: ${players || 'jogadores não informados'} · resultado ${gameResult || '*'}` : '',
      `Lance analisado: ${move} · ${entry.side === 'w' ? 'brancas' : 'pretas'}${includeMatchDetails && entry.clock ? ` · relógio após o lance ${entry.clock}` : ''}`,
      `Classificação do app: ${quality?.label || 'indisponível'}. ${loss}`,
      `Profundidade Stockfish: ${before.depth}. Avaliações abaixo são do ponto de vista das brancas.`,
      '',
      `FEN antes do lance: ${currentFen(history[historyIndex - 1].position)}`,
      `FEN depois do lance: ${currentFen(entry.position)}`,
      `Avaliação antes do lance: ${resultEvaluation(before.score, before.turn)} · melhor lance ${before.best || 'indisponível'}`,
      `Linha principal antes do lance: ${before.pv}`,
      `Avaliação depois do lance: ${resultEvaluation(after.score, after.turn)} · melhor resposta ${after.best || 'indisponível'}`,
      `Linha principal depois do lance: ${after.pv}`,
      '',
      'Responda em português, de forma curta e didática, nesta ordem: ideia do melhor lance; o que muda com o lance jogado; linha que prova o motivo; confiança da explicação. Stockfish calcula variantes e avaliações, mas não fornece por si só uma explicação humana.'
    ].filter(Boolean).join('\n');
  }

  function guidedGameAnalysisPrompt() {
    if (!history || history.length < 2 || gameReviewResults.length < history.length) return null;
    const usable = gameReviewResults.slice(0, history.length).every((result) => result?.score && result.depth === 16);
    if (!usable) return null;
    const moments = [], timeline = [];
    for (let index = 1; index < history.length; index += 1) {
      const before = gameReviewResults[index - 1], after = gameReviewResults[index], entry = history[index];
      if (!before?.score || !after?.score || before.depth !== 16 || after.depth !== 16) continue;
      const quality = after.quality || {};
      const loss = Number(quality.loss) || 0;
      const rating = Number(entry.side === 'w' ? whiteRatingInput.value : blackRatingInput.value) || 1200;
      const swing = (expectedPoints(after.score, after.turn, entry.side, rating) ?? 0)
        - (expectedPoints(before.score, before.turn, entry.side, rating) ?? 0);
      const negative = loss >= 0.06 || ['inaccuracy', 'mistake', 'blunder', 'miss'].includes(quality.kind);
      const positive = swing >= 0.10 && ['best', 'excellent', 'great', 'brilliant'].includes(quality.kind);
      const move = `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'}${entry.san}`;
      timeline.push(`#${index} ${move} ${resultEvaluation(before.score, before.turn)}→${resultEvaluation(after.score, after.turn)} ${quality.label || 'sem classificação'}${loss ? ` (−${Math.round(loss * 100)} p.p.)` : ''}`);
      if (negative || positive) moments.push({ index, entry, before, after, quality, loss, swing, negative, positive, priority: negative ? 100 + loss * 100 : swing * 100 });
    }
    moments.sort((a, b) => a.index - b.index);
    const fingerprint = gameReviewResults.slice(0, history.length).map((result) => result
      ? `${result.score?.type}:${result.score?.value}@${result.depth}:${result.quality?.label}:${result.quality?.loss}` : '-').join(',');
    const matchKey = `${loadedPgnSource || history.map((item) => item.san).join(' ')}|${fingerprint}|${whiteRatingInput.value}|${blackRatingInput.value}`;
    const evidence = moments.map(({ index, entry, before, after, quality, loss, swing, negative, positive }) => {
      const move = `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'} ${entry.san}`;
      const mainMoment = loss >= 0.10 || swing >= 0.15 || ['blunder', 'miss', 'great', 'brilliant'].includes(quality.kind);
      const clip = (line) => String(line || '').split(/\s+/).slice(0, 12).join(' ');
      const detail = `${move} (${entry.side === 'w' ? 'brancas' : 'pretas'}) · ${negative ? 'negativo' : 'positivo'} · ${quality.label || 'sem classificação'} · perda ${Math.round(loss * 100)} p.p. · mudança de chance para quem jogou ${Math.round(swing * 100)} p.p. · avaliação ${resultEvaluation(before.score, before.turn)}→${resultEvaluation(after.score, after.turn)} · melhor antes ${before.best || '—'} · resposta depois ${after.best || '—'}`;
      const lines = [detail];
      if (mainMoment && before.pv) lines.push(`Variante antes: ${clip(before.pv)}.`);
      if (mainMoment && after.pv) lines.push(`Variante depois: ${clip(after.pv)}.`);
      if (mainMoment) lines.push(`FEN antes: ${currentFen(history[index - 1].position)}.`);
      return lines.join('\n');
    }).join('\n\n');
    return {
      key: matchKey,
      criticalIndexes: moments.map((moment) => moment.index),
      prompt: [
        'Faça uma APG (Análise de Partida Guiada) da partida inteira usando a cronologia completa e os dados do Stockfish na profundidade 16.',
        'A lista cronológica contém todos os lances, avaliações antes/depois, classificação e perda estimada. Considere a trajetória completa da partida, não trate só a lista de momentos detalhados como se fosse a partida toda. Depois da visão geral, acompanhe a partida em ordem cronológica do primeiro ao último lance sem omitir nenhum lance jogado: comente lances rotineiros em frases curtas e aprofunde todos os momentos detalhados, sejam positivos ou negativos, explicando consequências concretas e citando as variantes fornecidas. Não atribua intenção, plano ou causa que os dados não provem; avaliações são do ponto de vista das brancas. Separe fatos demonstrados pelo motor de hipóteses e admita incerteza.',
        `Cronologia completa (${history.length - 1} lances):`, timeline.join('\n'),
        moments.length ? `Momentos para explicar com mais profundidade (${moments.length}, sem limite fixo de quantidade):\n${evidence}` : 'Não foram detectados erros relevantes nem mudanças positivas grandes; explique o desenvolvimento geral com prudência usando a cronologia, sem inventar táticas.',
        'Responda em português, sem introdução ou conclusão fora dos marcadores. Use exatamente este formato para que a interface mostre uma parte de cada vez:',
        '[[APG:OVERVIEW]]',
        'Uma visão geral curta do rumo da partida e das fases; não tente comentar todos os lances aqui.',
        '[[/APG:OVERVIEW]]',
        'Depois, crie um bloco para CADA índice da cronologia, do #1 ao último. Use o índice numérico exatamente como aparece na linha. Formato de cada bloco:',
        '[[APG:MOVE:1]]',
        'Comentário deste lance. Nos lances rotineiros, uma frase curta. Nos momentos de impacto, explique a consequência e use a variante fornecida. Relacione o comentário ao rumo geral sem repetir a visão geral.',
        '[[/APG:MOVE]]',
        'Não omita nenhum índice, não misture comentários de lances diferentes e não escreva as etiquetas como títulos Markdown. Não invente linhas nem afirme causalidade além do que as variantes e avaliações sustentam.'
      ].join('\n\n')
    };
  }

  function selectAnalysisPane(name) {
    const showGuided = name === 'guided' && guidedGamePaneAvailable;
    analysisPane.hidden = showGuided;
    guidedPane.hidden = !showGuided;
    analysisPaneTab.classList.toggle('selected', !showGuided);
    guidedPaneTab.classList.toggle('selected', showGuided);
    analysisPaneTab.setAttribute('aria-selected', String(!showGuided));
    guidedPaneTab.setAttribute('aria-selected', String(showGuided));
  }

  function syncGuidedGameMoveSelection() {
    guidedGameMoveButtons.forEach((button) => {
      const index = Number(button.dataset.moveIndex);
      const selected = index === historyIndex;
      button.classList.toggle('selected', selected);
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function parseGuidedGameAnswer(answer) {
    const overviewMatch = answer.match(/\[\[APG:OVERVIEW\]\]([\s\S]*?)\[\[\/APG:OVERVIEW\]\]/i);
    const moveComments = new Map();
    const pattern = /\[\[APG:MOVE:(\d+)\]\]([\s\S]*?)\[\[\/APG:MOVE\]\]/gi;
    for (const match of answer.matchAll(pattern)) {
      const index = Number(match[1]);
      if (Number.isInteger(index) && index > 0) moveComments.set(index, match[2].trim());
    }
    return { overview: overviewMatch?.[1]?.trim() || '', moveComments };
  }

  function renderCurrentGuidedGameCommentary() {
    if (!guidedGamePaneAvailable) return;
    const index = historyIndex;
    if (index === 0) {
      guidedGameStepContext.textContent = 'VISÃO GERAL';
      guidedGameStepTitle.textContent = 'Como a partida se desenvolveu';
      renderSuperAnalysisMarkdown(guidedGameOverview || 'A resposta não trouxe uma visão geral separada.', guidedGameResult);
    } else {
      const entry = history[index], result = gameReviewResults[index];
      const move = `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'} ${entry.san}`;
      guidedGameStepContext.textContent = guidedGameCriticalIndexes.has(index) ? 'MOMENTO DE IMPACTO' : 'LANCE DA PARTIDA';
      guidedGameStepTitle.textContent = `${move}${result?.quality?.label ? ` · ${result.quality.label}` : ''}`;
      const commentary = guidedGameMoveComments.get(index);
      const fallback = commentary || result?.quality?.explanation
        || 'A IA não retornou comentário individual para este lance. Confira a avaliação e a linha do Stockfish na aba Análise.';
      renderSuperAnalysisMarkdown(fallback, guidedGameResult);
    }
    guidedGameResult.hidden = false;
  }

  function renderGuidedGameMoveNavigation() {
    guidedGameMoves.replaceChildren();
    guidedGameMoveButtons = [];
    const addPosition = (index, label, title = '') => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'guided-ply'; button.textContent = label;
      button.dataset.moveIndex = String(index);
      if (guidedGameCriticalIndexes.has(index)) button.classList.add('is-critical');
      if (title) button.title = title;
      button.setAttribute('aria-label', index === 0 ? 'Abrir posição inicial' : `Abrir posição após ${label}${guidedGameCriticalIndexes.has(index) ? ', momento destacado na APG' : ''}`);
      button.addEventListener('click', () => { goTo(index); showBoard(); });
      guidedGameMoves.append(button); guidedGameMoveButtons.push(button);
    };
    addPosition(0, 'Início');
    for (let index = 1; index < history.length; index += 1) {
      const entry = history[index], result = gameReviewResults[index];
      const label = `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'}${entry.san}`;
      const quality = result?.quality?.label || '';
      addPosition(index, label, quality ? `${quality}${guidedGameCriticalIndexes.has(index) ? ' · momento de impacto na APG' : ''}` : 'Posição da partida');
    }
    syncGuidedGameMoveSelection();
  }

  function presentGuidedGameAnalysis(answer, analysis) {
    const parsed = parseGuidedGameAnswer(answer);
    guidedGameCriticalIndexes = new Set(analysis?.criticalIndexes || []);
    guidedGameOverview = parsed.overview;
    guidedGameMoveComments = parsed.moveComments;
    if (!guidedGameOverview && !guidedGameMoveComments.size) guidedGameOverview = 'A IA não separou a resposta por lance. Tente gerar a APG novamente.';
    renderGuidedGameMoveNavigation();
    guidedGamePaneAvailable = true;
    guidedPaneTab.disabled = false;
    if (historyIndex !== 0) goTo(0);
    else renderCurrentGuidedGameCommentary();
    selectAnalysisPane('guided');
    guidedPane.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return Boolean(parsed.overview) && Array.from({ length: history.length - 1 }, (_, offset) => offset + 1)
      .every((index) => guidedGameMoveComments.has(index));
  }

  function resetGuidedGamePane() {
    if (siteSuperAnalysisRequestMode === 'game') {
      siteSuperAnalysisAbortController?.abort(); siteSuperAnalysisAbortController = null;
      siteSuperAnalysisRequestId += 1; siteSuperAnalysisBusy = false; runGuidedGameAnalysisButton.disabled = false;
      siteSuperAnalysisActiveKey = '';
      if (siteSuperAnalysisTurnstileWidget !== null && window.turnstile) window.turnstile.remove(siteSuperAnalysisTurnstileWidget);
      siteSuperAnalysisTurnstileWidget = null;
    }
    siteSuperAnalysisRequestMode = 'move';
    guidedGamePaneAvailable = false;
    guidedGameCriticalIndexes = new Set();
    guidedGameMoveButtons = [];
    guidedGameOverview = '';
    guidedGameMoveComments = new Map();
    guidedPaneTab.disabled = true;
    guidedGameChallenge.hidden = true;
    guidedGameResult.hidden = true; guidedGameResult.replaceChildren();
    guidedGameMoves.replaceChildren(); guidedGameStatus.textContent = '';
    selectAnalysisPane('stockfish');
  }

  function updateSuperAnalysisActions() {
    const prompt = superAnalysisPrompt();
    superAnalysisActions.hidden = !prompt || Boolean(variationSession || exerciseActiveHere());
    const config = window.MYCHESS_SUPER_ANALYSIS || {};
    runSiteSuperAnalysisButton.hidden = !config.endpoint || !config.turnstileSiteKey;
    superAnalysisActions.classList.toggle('has-internal-analysis', !runSiteSuperAnalysisButton.hidden);
    const currentKey = prompt || '';
    const keyChanged = siteSuperAnalysisResultKey !== currentKey;
    if (keyChanged) {
      if (siteSuperAnalysisRequestMode !== 'game') {
        siteSuperAnalysisAbortController?.abort(); siteSuperAnalysisAbortController = null;
        siteSuperAnalysisRequestId += 1; siteSuperAnalysisBusy = false; runSiteSuperAnalysisButton.disabled = false;
      }
      siteSuperAnalysisResultKey = currentKey;
      superAnalysisChallenge.hidden = true;
    }
    const cachedAnswer = currentKey ? siteSuperAnalysisCache.get(currentKey) : null;
    if (cachedAnswer) {
      renderSuperAnalysisMarkdown(cachedAnswer);
      superAnalysisResult.hidden = false;
      superAnalysisChallenge.hidden = true;
      superAnalysisStatus.textContent = 'Análise recuperada desta sessão.';
    } else if (keyChanged) {
      superAnalysisResult.hidden = true;
      superAnalysisResult.replaceChildren();
      superAnalysisStatus.textContent = '';
    }
    if (superAnalysisActions.hidden) superAnalysisStatus.textContent = '';
    updateMoveAnalysisPanels();
  }

  function updateMoveAnalysisPanels() {
    moveExplanationPanel.hidden = superAnalysisActions.hidden;
    moveAnalysisGroup.hidden = moveAlternatives.hidden && bestMovesPanel.hidden;
  }

  let turnstileScriptPromise = null;

  function loadTurnstileScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileScriptPromise) return turnstileScriptPromise;
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Não consegui carregar a verificação de segurança.'));
      script.onerror = () => reject(new Error('Não consegui carregar a verificação de segurança.'));
      document.head.append(script);
    }).catch((error) => { turnstileScriptPromise = null; throw error; });
    return turnstileScriptPromise;
  }

  function inSiteSuperAnalysisErrorMessage(status, detail = '') {
    if (status === 401 || status === 403) return detail || 'A verificação foi recusada. Atualize a página e tente novamente.';
    if (status === 429) return 'Muitos pedidos em sequência. Aguarde um minuto e tente novamente.';
    if (status === 503) return detail || 'O modelo está indisponível ou a cota gratuita do dia acabou.';
    return detail || 'Não foi possível concluir a super análise. Tente novamente.';
  }

  function appendSuperAnalysisInlineMarkdown(parent, text) {
    const pattern = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
    let offset = 0;
    for (const match of text.matchAll(pattern)) {
      if (match.index > offset) parent.append(document.createTextNode(text.slice(offset, match.index)));
      const token = match[0];
      let element;
      let content;
      if (token.startsWith('**') || token.startsWith('__')) {
        element = document.createElement('strong');
        content = token.slice(2, -2);
      } else if (token.startsWith('`')) {
        element = document.createElement('code');
        content = token.slice(1, -1);
      } else {
        element = document.createElement('em');
        content = token.slice(1, -1);
      }
      element.textContent = content;
      parent.append(element);
      offset = match.index + token.length;
    }
    if (offset < text.length) parent.append(document.createTextNode(text.slice(offset)));
  }

  function renderSuperAnalysisMarkdown(markdown, target = superAnalysisResult) {
    target.replaceChildren();
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    let paragraph = [];
    let list = null;
    let codeLines = null;

    const closeList = () => { list = null; };
    const flushParagraph = () => {
      if (!paragraph.length) return;
      const block = document.createElement('p');
      paragraph.forEach((line, index) => {
        if (index) block.append(document.createElement('br'));
        appendSuperAnalysisInlineMarkdown(block, line);
      });
      target.append(block);
      paragraph = [];
    };

    for (const line of lines) {
      if (codeLines) {
        if (/^\s*```/.test(line)) {
          const pre = document.createElement('pre');
          const code = document.createElement('code');
          code.textContent = codeLines.join('\n');
          pre.append(code);
          target.append(pre);
          codeLines = null;
        } else codeLines.push(line);
        continue;
      }
      if (/^\s*```/.test(line)) {
        flushParagraph();
        closeList();
        codeLines = [];
        continue;
      }
      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        flushParagraph();
        closeList();
        const element = document.createElement(`h${heading[1].length}`);
        appendSuperAnalysisInlineMarkdown(element, heading[2]);
        target.append(element);
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        closeList();
        continue;
      }
      const item = line.match(/^\s*(?:([-*+])\s+|(\d+)[.)]\s+)(.+)$/);
      if (item) {
        flushParagraph();
        const type = item[2] ? 'ol' : 'ul';
        if (!list || list.tagName.toLowerCase() !== type) {
          closeList();
          list = document.createElement(type);
          target.append(list);
        }
        const element = document.createElement('li');
        appendSuperAnalysisInlineMarkdown(element, item[3]);
        list.append(element);
        continue;
      }
      closeList();
      paragraph.push(line);
    }
    flushParagraph();
    if (codeLines) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = codeLines.join('\n');
      pre.append(code);
      target.append(pre);
    }
  }

  async function requestSiteSuperAnalysis(turnstileToken, mode = 'move', requestedKey = siteSuperAnalysisResultKey) {
    const config = window.MYCHESS_SUPER_ANALYSIS || {};
    const analysis = mode === 'game' ? guidedGameAnalysisPrompt() : null;
    const prompt = mode === 'game' ? analysis?.prompt : superAnalysisPrompt({ includeMatchDetails: false });
    const result = mode === 'game' ? guidedGameResult : superAnalysisResult;
    const status = mode === 'game' ? guidedGameStatus : superAnalysisStatus;
    const button = mode === 'game' ? runGuidedGameAnalysisButton : runSiteSuperAnalysisButton;
    if (mode === 'game' && analysis?.key !== requestedKey) {
      status.textContent = 'A partida ou a análise mudou durante a verificação. Clique em APG novamente para confirmar os dados atualizados.';
      guidedGameChallenge.hidden = true;
      return;
    }
    if (!prompt || !config.endpoint) {
      status.textContent = mode === 'game'
        ? 'A APG exige uma análise completa da partida na profundidade 16. Analise ou reanalise a partida nessa profundidade e tente novamente.'
        : 'A integração da super análise ainda não está configurada.';
      return;
    }
    siteSuperAnalysisBusy = true;
    button.disabled = true;
    status.textContent = mode === 'game' ? 'Preparando a análise guiada…' : 'Analisando a posição…';
    const requestId = ++siteSuperAnalysisRequestId;
    const resultKey = mode === 'game' ? analysis.key : requestedKey;
    siteSuperAnalysisRequestMode = mode;
    siteSuperAnalysisActiveKey = resultKey;
    siteSuperAnalysisAbortController = new AbortController();
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, turnstileToken, kind: mode === 'game' ? 'guided-game' : 'move' }),
        signal: siteSuperAnalysisAbortController.signal
      });
      let payload = {};
      try { payload = await response.json(); } catch {}
      if (!response.ok) throw new Error(inSiteSuperAnalysisErrorMessage(response.status, payload.error));
      const answer = typeof payload.answer === 'string' ? payload.answer.trim() : '';
      if (!answer) throw new Error('O modelo não retornou uma análise. Tente novamente.');
      if (requestId === siteSuperAnalysisRequestId && resultKey === siteSuperAnalysisActiveKey) {
        if (mode === 'game') {
          const complete = presentGuidedGameAnalysis(answer, analysis);
          if (complete) guidedGameAnalysisCache.set(resultKey, answer);
          else guidedGameAnalysisCache.delete(resultKey);
          status.textContent = complete ? 'APG concluída. Navegue pelos lances para acompanhar cada comentário.' : 'A APG abriu, mas a IA não separou todos os comentários por lance; os lances sem comentário usam a avaliação local.';
        }
        else { siteSuperAnalysisCache.set(resultKey, answer); renderSuperAnalysisMarkdown(answer, result); result.hidden = false; superAnalysisChallenge.hidden = true; }
        if (mode !== 'game') status.textContent = 'Análise concluída.';
      }
    } catch (error) {
      if (requestId === siteSuperAnalysisRequestId) status.textContent = error.message || 'Falha de conexão. Tente novamente.';
    } finally {
      if (requestId === siteSuperAnalysisRequestId) {
        siteSuperAnalysisAbortController = null;
        siteSuperAnalysisBusy = false;
        button.disabled = false;
      }
    }
  }

  async function runSiteSuperAnalysis(mode = 'move') {
    if (siteSuperAnalysisBusy) return;
    const config = window.MYCHESS_SUPER_ANALYSIS || {};
    const gameMode = mode === 'game';
    const analysis = gameMode ? guidedGameAnalysisPrompt() : null;
    const prompt = gameMode ? analysis?.prompt : superAnalysisPrompt();
    const challenge = gameMode ? guidedGameChallenge : superAnalysisChallenge;
    const result = gameMode ? guidedGameResult : superAnalysisResult;
    const status = gameMode ? guidedGameStatus : superAnalysisStatus;
    const button = gameMode ? runGuidedGameAnalysisButton : runSiteSuperAnalysisButton;
    const requestKey = gameMode ? analysis?.key : siteSuperAnalysisResultKey;
    if (gameMode && !prompt) {
      status.textContent = 'A APG exige uma análise completa da partida na profundidade 16. Analise ou reanalise a partida nessa profundidade e tente novamente.';
      return;
    }
    const cached = gameMode ? guidedGameAnalysisCache.get(requestKey) : siteSuperAnalysisCache.get(requestKey);
    if (cached) {
      if (gameMode) {
        const complete = presentGuidedGameAnalysis(cached, analysis);
        status.textContent = complete ? 'APG recuperada. Navegue pelos lances para acompanhar cada comentário.' : 'A APG salva não separa todos os comentários por lance; os lances sem comentário usam a avaliação local.';
      }
      else { renderSuperAnalysisMarkdown(cached, result); result.hidden = false; }
      if (!gameMode) status.textContent = 'Análise recuperada desta sessão.';
      return;
    }
    if (!config.endpoint || !config.turnstileSiteKey) {
      status.textContent = 'A integração da super análise ainda não está configurada.';
      return;
    }
    if (gameMode) {
      guidedGamePaneAvailable = false; guidedPaneTab.disabled = true;
      guidedGameResult.hidden = true; guidedGameResult.replaceChildren(); guidedGameMoves.replaceChildren();
      guidedGameCriticalIndexes = new Set(); guidedGameMoveButtons = [];
      selectAnalysisPane('stockfish');
    }
    challenge.hidden = false;
    siteSuperAnalysisBusy = true;
    button.disabled = true;
    status.textContent = 'Carregando verificação de segurança…';
    const requestedKey = requestKey;
    siteSuperAnalysisRequestMode = mode;
    siteSuperAnalysisActiveKey = requestedKey;
    try {
      const turnstile = await loadTurnstileScript();
      if (requestedKey !== siteSuperAnalysisActiveKey) return;
      if (siteSuperAnalysisTurnstileWidget !== null) {
        turnstile.remove(siteSuperAnalysisTurnstileWidget);
        siteSuperAnalysisTurnstileWidget = null;
      }
      challenge.replaceChildren();
      status.textContent = 'Confirme a verificação para iniciar a análise.';
      if (gameMode) challenge.scrollIntoView({ behavior: 'smooth', block: 'center' });
      siteSuperAnalysisTurnstileWidget = turnstile.render(challenge, {
        sitekey: config.turnstileSiteKey,
        action: 'mychess-super-analysis',
        theme: 'dark',
        callback: (token) => { if (requestedKey === siteSuperAnalysisActiveKey) requestSiteSuperAnalysis(token, mode, requestedKey); },
        'expired-callback': () => { if (!siteSuperAnalysisBusy) status.textContent = 'A verificação expirou. Clique no botão de análise para tentar novamente.'; },
        'error-callback': () => { status.textContent = 'A verificação falhou. Confira sua conexão e tente novamente.'; }
      });
      siteSuperAnalysisBusy = false;
      button.disabled = false;
    } catch (error) {
      status.textContent = error.message || 'Não consegui iniciar a verificação de segurança.';
      siteSuperAnalysisBusy = false;
      button.disabled = false;
    }
  }

  function openSuperAnalysis() {
    const prompt = superAnalysisPrompt();
    if (!prompt) { superAnalysisStatus.textContent = 'Faça uma análise completa do lance antes de abrir a super análise.'; return; }
    const url = new URL('https://chatgpt.com/');
    url.searchParams.set('q', prompt);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    superAnalysisStatus.textContent = 'Abri o ChatGPT em outra aba com a posição e as linhas do Stockfish.';
  }

  openSuperAnalysisButton.addEventListener('click', openSuperAnalysis);
  runSiteSuperAnalysisButton.addEventListener('click', () => runSiteSuperAnalysis('move'));
  runGuidedGameAnalysisButton.addEventListener('click', () => runSiteSuperAnalysis('game'));

  function scoreForSide(score, rootTurn, side) {
    if (!score) return null;
    const whiteFactor = rootTurn === 'w' ? 1 : -1;
    if (score.type === 'mate' && score.value === 0) return (rootTurn === 'w' ? -10000 : 10000) * (side === 'w' ? 1 : -1);
    if (score.type === 'mate') {
      const whiteMate = score.value * whiteFactor;
      const distance = Math.min(999, Math.abs(whiteMate));
      const whiteScore = whiteMate > 0 ? 10000 - distance * 10 : whiteMate < 0 ? -10000 + distance * 10 : 0;
      return whiteScore * (side === 'w' ? 1 : -1);
    }
    return score.value * whiteFactor * (side === 'w' ? 1 : -1);
  }

  function expectedPoints(score, rootTurn, side, rating) {
    const cp = scoreForSide(score, rootTurn, side);
    if (cp === null) return null;
    const strength = Math.max(400, Math.min(3000, Number(rating) || 1200));
    const scale = Math.max(220, Math.min(470, 440 - (strength - 1200) * 0.06));
    const decisive = 1 / (1 + Math.exp(-Math.max(-9000, Math.min(9000, cp)) / scale));
    const drawChance = Math.max(0.08, Math.min(0.34, 0.09 + (strength - 600) * 0.00011)) * Math.exp(-Math.abs(cp) / 500);
    return decisive * (1 - drawChance) + 0.5 * drawChance;
  }

  function sideRating(side) {
    return Number(side === 'w' ? whiteRatingInput.value : blackRatingInput.value) || 1200;
  }

  const materialValues = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  // Treinador: toda a análise didática vive em coach.js (módulo puro, sem DOM). Aqui só ligamos a ele as
  // regras do tabuleiro e a curva de pontos esperados do aplicativo.
  const coach = window.MyChessCoach.create(
    { positionFromFen, currentFen, applyMove, legalMoves, allLegalMoves, inCheck, attacked, moveToSan, parseUciMove, color, squareName },
    { expected: (score, turn, side) => expectedPoints(score, turn, side, sideRating(side)) }
  );

  function brilliantSacrifice(previous, result, playedMove) {
    if (!playedMove.movingPiece || playedMove.capturedPiece !== '.' || playedMove.movingPiece.toUpperCase() === 'P') return false;
    const after = positionFromFen(result.fen);
    const firstReply = (result.pvUci || '').trim().split(/\s+/)[0];
    const reply = firstReply ? parseUciMove(after, firstReply) : null;
    if (!reply || reply.to !== playedMove.to || after.board[reply.to] === '.') return false;
    const value = materialValues[playedMove.movingPiece.toUpperCase()] || 0;
    if (value < 3) return false;
    const beforeExpected = expectedPoints(previous.score, previous.turn, playedMove.side, sideRating(playedMove.side));
    const afterExpected = expectedPoints(result.score, result.turn, playedMove.side, sideRating(playedMove.side));
    return beforeExpected < 0.9 && afterExpected >= 0.45 && beforeExpected - afterExpected <= 0.02;
  }

  function moveQuality(before, after, playedMove) {
    const mover = playedMove.side;
    const rating = sideRating(mover);
    const bestExpected = expectedPoints(before.score, before.turn, mover, rating);
    const actualExpected = expectedPoints(after.score, after.turn, mover, rating);
    if (bestExpected === null || actualExpected === null) {
      return { label: 'Sem avaliação', kind: 'unknown', loss: null, lesson: null, explanation: 'O Stockfish não forneceu avaliações suficientes para classificar este lance.' };
    }
    // Se o lance jogado é o que o próprio motor escolheu, ele não pode perder para o "melhor": a diferença entre
    // as duas pontuações é só instabilidade da busca (a posição depois do lance é pesquisada de novo, um nível mais raso).
    const playedUci = `${squareName(playedMove.from)}${squareName(playedMove.to)}${playedMove.promotion ? String(playedMove.promotion).toLowerCase() : ''}`;
    const loss = before.bestMove === playedUci ? 0 : Math.max(0, bestExpected - actualExpected);
    const missedWin = bestExpected >= 0.75 && actualExpected <= 0.55 && loss > 0.10;
    const brilliant = !missedWin && loss <= 0.02 && brilliantSacrifice(before, after, playedMove);
    const alternative = before.variations?.[1];
    const secondExpected = alternative ? expectedPoints(alternative.score, before.turn, mover, rating) : null;
    const great = !missedWin && !brilliant && loss <= 0.02 && before.best === playedMove.san && secondExpected !== null && bestExpected - secondExpected >= 0.08;
    let label = loss <= 0.002 ? 'Melhor' : loss <= 0.02 ? 'Excelente' : loss <= 0.05 ? 'Bom' : loss <= 0.10 ? 'Imprecisão' : loss <= 0.20 ? 'Erro' : 'Erro grave';
    let kind = loss <= 0.002 ? 'best' : loss <= 0.02 ? 'excellent' : loss <= 0.05 ? 'good' : loss <= 0.10 ? 'inaccuracy' : loss <= 0.20 ? 'mistake' : 'blunder';
    if (missedWin) { label = 'Chance perdida'; kind = 'blunder'; }
    else if (brilliant) { label = 'Brilhante'; kind = 'brilliant'; }
    else if (great) { label = 'Grande lance'; kind = 'great'; }
    // A classificação vem só da perda de pontos esperados; o porquê vem do treinador (fatos, indícios, incertezas).
    const lesson = coach.buildLesson({ before, after, played: playedMove, quality: { label, kind, loss } });
    let explanation = lesson.headline;
    if (missedWin) explanation += ' A chance de manter a posição vencedora escapou.';
    else if (brilliant) explanation += ' “Brilhante” é uma heurística local: há um sacrifício visível na resposta principal do motor, sem perda estimada.';
    else if (great) explanation += ' “Grande lance” é uma heurística baseada em três variantes: a segunda é claramente inferior.';
    return { label, kind, loss, lesson, explanation };
  }

  function formatEvaluationForSide(score, turn, side) {
    const value = scoreForSide(score, turn, side);
    if (value === null) return 'indisponível';
    if (score.type === 'mate') return `${value > 0 ? '+' : value < 0 ? '−' : ''}M${Math.round(Math.abs(value) / 10)}`;
    const pawns = value / 100;
    return `${pawns > 0 ? '+' : pawns < 0 ? '−' : ''}${Math.abs(pawns).toFixed(1)} peões`;
  }

  const LESSON_CONFIDENCE = {
    verified: ['verified', 'Explicação: causa verificada pelas regras do xadrez e pelas variantes do motor.'],
    partial: ['partial', 'Explicação parcial: há indícios, mas nenhum deles demonstra sozinho a causa.'],
    unconfirmed: ['unconfirmed', 'Explicação não confirmada: as variantes calculadas não mostram a causa.']
  };

  function lessonList(items, className) {
    const list = document.createElement('ul'); list.className = className;
    for (const item of items) {
      const entry = document.createElement('li');
      if (item.sourceLabel) {
        const chip = document.createElement('span'); chip.className = `lesson-source lesson-source-${item.source}`; chip.textContent = item.sourceLabel;
        entry.append(chip, ' ');
      }
      entry.append(item.text);
      list.append(entry);
    }
    return list;
  }

  function lessonBlock(kind, title, content) {
    const block = document.createElement('section'); block.className = `lesson-block lesson-${kind}`;
    const heading = document.createElement('h4'); heading.textContent = title;
    block.append(heading, content);
    return block;
  }

  function lessonParagraph(text) { const p = document.createElement('p'); p.textContent = text; return p; }

  function buildSequenceViewer(lesson, context) {
    if (!context?.before?.fen || !context.playedMove) return null;
    const before = context.before, after = context.after, move = context.playedMove;
    const playedUci = `${squareName(move.from)}${squareName(move.to)}${move.promotion ? String(move.promotion).toLowerCase() : ''}`;
    const alternatives = before.variations || [];
    const bestTokens = (before.pvUci || '').trim().split(/\s+/).filter(Boolean);
    const playedTokens = [playedUci, ...(after?.pvUci || '').trim().split(/\s+/).filter(Boolean)];
    const lines = [];
    if (playedTokens.length > 1) lines.push({ label: `Lance jogado · ${move.san}`, fen: before.fen, tokens: playedTokens, score: after?.score || before.score, scoreTurn: after?.turn || before.turn });
    if (bestTokens.length) lines.push({ label: `Melhor linha · ${before.best || bestTokens[0]}`, fen: before.fen, tokens: bestTokens, score: before.score, scoreTurn: before.turn });
    const alternate = alternatives.find((item) => item.pv && item.pv.trim() && item.pv.trim().split(/\s+/)[0] !== before.bestMove);
    if (alternate && lines.length < 3) lines.push({ label: 'Outra linha do motor', fen: before.fen, tokens: alternate.pv.trim().split(/\s+/), score: alternate.score || before.score, scoreTurn: before.turn });
    if (!lines.length) return null;

    const wrap = document.createElement('section'); wrap.className = 'sequence-viewer';
    const top = document.createElement('div'); top.className = 'sequence-viewer-top';
    const heading = document.createElement('div'); heading.innerHTML = '<strong>Reproduzir variante</strong><span>Stockfish · lances legais</span>';
    const lineSelect = document.createElement('select'); lineSelect.className = 'sequence-line-select'; lineSelect.setAttribute('aria-label', 'Escolher variante');
    lines.forEach((line, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = line.label; lineSelect.append(option); });
    top.append(heading, lineSelect);
    const board = document.createElement('div'); board.className = 'sequence-board'; board.setAttribute('role', 'img'); board.setAttribute('aria-label', 'Tabuleiro da variante');
    const status = document.createElement('div'); status.className = 'sequence-status';
    const evalBox = document.createElement('div'); evalBox.className = 'sequence-stat';
    const materialBox = document.createElement('div'); materialBox.className = 'sequence-stat';
    const stats = document.createElement('div'); stats.className = 'sequence-stats'; stats.append(evalBox, materialBox);
    const controls = document.createElement('div'); controls.className = 'sequence-controls';
    const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹'; prev.title = 'Lance anterior';
    const play = document.createElement('button'); play.type = 'button'; play.textContent = '▶'; play.title = 'Reproduzir automaticamente'; play.className = 'sequence-play';
    const next = document.createElement('button'); next.type = 'button'; next.textContent = '›'; next.title = 'Próximo lance';
    controls.append(prev, play, next);
    wrap.append(top, board, status, stats, controls);

    let lineIndex = 0, ply = 0, timer = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; play.textContent = '▶'; play.title = 'Reproduzir automaticamente'; };
    function paint() {
      const line = lines[lineIndex];
      const rep = coach.replay(line.fen, line.tokens, 32);
      const pos = ply === 0 ? positionFromFen(line.fen) : rep.steps[ply - 1]?.after;
      if (!pos) { ply = Math.min(ply, rep.steps.length); return paint(); }
      board.replaceChildren();
      for (let square = 0; square < 64; square++) {
        const cell = document.createElement('span'); cell.className = `sequence-square ${(Math.floor(square / 8) + square % 8) % 2 ? 'dark' : 'light'}`;
        const piece = pos.board[square];
        if (piece !== '.') { cell.textContent = ({ K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' })[piece]; cell.classList.add(piece === piece.toUpperCase() ? 'white-piece' : 'black-piece'); }
        board.append(cell);
      }
      const last = rep.steps[ply - 1];
      if (last) { board.children[last.move.from]?.classList.add('sequence-from'); board.children[last.move.to]?.classList.add('sequence-to'); }
      status.textContent = ply === 0 ? 'Posição inicial' : `${Math.ceil(ply / 2)}${ply % 2 ? '.' : '…'} ${rep.steps[ply - 1].san}  ·  ${ply} / ${rep.steps.length} meios-lances`;
      evalBox.innerHTML = `<span>Avaliação calculada</span><strong>${line.score ? formatEvaluationForSide(line.score, line.scoreTurn, move.side) : '—'}</strong>`;
      const start = positionFromFen(line.fen), side = move.side;
      const count = (p, color) => p.board.reduce((n, piece) => n + (piece !== '.' && (piece === piece.toUpperCase() ? 'w' : 'b') === color ? materialValues[piece.toUpperCase()] || 0 : 0), 0);
      const delta = count(pos, side) - count(pos, side === 'w' ? 'b' : 'w') - (count(start, side) - count(start, side === 'w' ? 'b' : 'w'));
      const fmt = delta > 0 ? `+${delta}` : `${delta}`;
      materialBox.innerHTML = `<span>Saldo material · ${side === 'w' ? 'brancas' : 'pretas'}</span><strong>${fmt} ponto${Math.abs(delta) === 1 ? '' : 's'}</strong>`;
      prev.disabled = ply === 0; next.disabled = ply >= rep.steps.length;
    }
    prev.addEventListener('click', () => { stop(); ply = Math.max(0, ply - 1); paint(); });
    next.addEventListener('click', () => { stop(); const rep = coach.replay(lines[lineIndex].fen, lines[lineIndex].tokens, 32); ply = Math.min(rep.steps.length, ply + 1); paint(); });
    play.addEventListener('click', () => {
      if (timer) { stop(); return; }
      const rep = coach.replay(lines[lineIndex].fen, lines[lineIndex].tokens, 32);
      if (ply >= rep.steps.length) ply = 0;
      play.textContent = 'Ⅱ'; play.title = 'Pausar'; paint();
      timer = setInterval(() => { if (ply >= rep.steps.length) { stop(); return; } ply++; paint(); }, 850);
    });
    lineSelect.addEventListener('change', () => { stop(); lineIndex = Number(lineSelect.value); ply = 0; paint(); });
    paint(); return wrap;
  }

  function addMoveQuality(result, previous, playedMove) {
    const quality = moveQuality(previous, result, playedMove);
    const badge = document.createElement('span'); badge.className = `move-quality-badge quality-${qualityKindForDisplay(quality)}`;
    badge.textContent = quality.label;
    if (quality.loss !== null) badge.title = `Perda estimada de ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(quality.loss * 100)} pontos percentuais, na profundidade escolhida.`;
    const explanation = document.createElement('p'); explanation.className = 'move-quality-explanation'; explanation.textContent = quality.explanation;
    result.ui.details.append(badge, explanation);
    return quality;
  }

  function addGamePositionResult(batch, snapshot, result) {
    result.ui = appendGameResult(result);
    const previous = batch.results[batch.results.length - 1];
    result.playedMove = snapshot.playedMove;
    if (snapshot.playedMove && previous) result.quality = addMoveQuality(result, previous, snapshot.playedMove);
    batch.results.push(result);
    gameReviewResults[snapshot.index] = result;
    updateMoveQualityMark(snapshot.index, result.quality);
    renderAdvantageChart(gameReviewResults);
    renderGameReviewAtCurrentPosition();
  }

  function renderGameCacheResult(snapshot, cached) {
    const pos = positionFromFen(snapshot.fen);
    const move = cached.bestMove && cached.bestMove !== '(none)' && cached.bestMove !== '0000' ? parseUciMove(pos, cached.bestMove) : null;
    const result = { index: snapshot.index, label: snapshot.label, turn: snapshot.turn, fen: snapshot.fen, evaluation: resultEvaluation(cached.score, snapshot.turn), best: move ? moveToSan(pos, move) : 'Nenhum lance legal', bestMove: cached.bestMove, pvUci: cached.pv || '', pv: formatPrincipalVariation(snapshot.fen, cached.pv || ''), variations: cached.variations || [], score: cached.score, depth: cached.depth };
    return result;
  }

  function renderCachedPosition(cached, fen, turn, depth) {
    const pos = positionFromFen(fen);
    const move = cached.bestMove && cached.bestMove !== '(none)' && cached.bestMove !== '0000' ? parseUciMove(pos, cached.bestMove) : null;
    renderBestMoves({ fen, turn, bestMove: cached.bestMove, pvUci: cached.pv || '', score: cached.score, variations: cached.variations || [] });
    analysisPlaceholder.hidden = true; analysisResults.hidden = false; analysisProgress.hidden = true;
    analysisResults.classList.remove('from-game-review'); gameReviewQuality.hidden = true; moveAlternatives.hidden = true;
    if (cached.score) showEvaluation(cached.score.type, cached.score.value, turn);
    bestMoveLabel.textContent = move ? moveToSan(pos, move) : 'Nenhum lance legal';
    principalVariation.textContent = formatPrincipalVariation(fen, cached.pv || '');
    engineStatusText.textContent = `Resultado reutilizado do cache local (profundidade ${depth}).`;
    renderCurrentMoveQuality({
      fen, turn, score: cached.score, bestMove: cached.bestMove,
      pvUci: cached.pv || '', pv: formatPrincipalVariation(fen, cached.pv || ''),
      variations: cached.variations || [], depth: cached.depth || depth
    }, 'Resultado reutilizado do cache');
  }

  function renderCurrentMoveQuality(result, source) {
    const entry = history[historyIndex];
    const previousEntry = history[historyIndex - 1];
    if (!entry?.move || !previousEntry) {
      gameReviewQuality.hidden = true;
      superAnalysisActions.hidden = true;
      gameReviewQuestion.hidden = true;
      moveAlternatives.hidden = true;
      updateMoveAnalysisPanels();
      return;
    }
    updateSuperAnalysisActions();

    const previous = gameReviewResults[historyIndex - 1];
    const playedMove = {
      side: entry.side,
      san: entry.san,
      moveNumber: entry.moveNumber,
      from: entry.move.from,
      to: entry.move.to,
      promotion: entry.move.promotion || '',
      movingPiece: previousEntry.position.board[entry.move.from],
      capturedPiece: entry.move.enPassant
        ? previousEntry.position.board[entry.move.to + (entry.side === 'w' ? 8 : -8)]
        : previousEntry.position.board[entry.move.to]
    };

    gameReviewQuality.hidden = false;
    renderMoveAlternatives(gameReviewResults[historyIndex], gameReviewResults[historyIndex - 1]);
    gameReviewContext.textContent = `${variationSession ? 'JOGADA HIPOTÉTICA' : 'QUALIDADE DO LANCE'} · ${playedMove.moveNumber}${playedMove.side === 'w' ? '.' : '…'} ${playedMove.san}`;
    gameReviewQuestion.hidden = true;
    gameReviewDepth.textContent = `${source} · profundidade ${result.depth || selectedDepth} · calculada pelo Stockfish`;

    if (!previous?.score || previous.depth !== result.depth) {
      currentBoardQuality = null;
      renderBoardQualityMarker();
      gameReviewBadge.hidden = true;
      gameReviewExplanation.textContent = 'Não foi possível comparar avaliações na mesma profundidade para classificar este lance. Analise a partida ou a variação nesta profundidade para obter uma classificação confiável.';
      return;
    }

    const pos = positionFromFen(result.fen);
    const bestMove = result.bestMove && result.bestMove !== '(none)' && result.bestMove !== '0000'
      ? parseUciMove(pos, result.bestMove)
      : null;
    const reviewed = {
      ...result,
      best: bestMove ? moveToSan(pos, bestMove) : 'Nenhum lance legal'
    };
    const quality = moveQuality(previous, reviewed, playedMove);
    currentBoardQuality = { fen: currentFen(position), move: playedMove, quality };
    renderBoardQualityMarker();
    gameReviewBadge.hidden = false;
    setGameReviewQualityBadge(quality);
    gameReviewExplanation.textContent = quality.explanation;
  }

  function formatPrincipalVariation(fen, pv) {
    if (!pv) return 'Linha principal indisponível.';
    let current;
    try { current = positionFromFen(fen); } catch { return 'Linha principal indisponível.'; }
    const parts = [];
    for (const token of pv.trim().split(/\s+/).slice(0, 12)) {
      const side = current.turn, number = current.fullmove, move = parseUciMove(current, token);
      if (!move) break;
      const san = moveToSan(current, move);
      parts.push(side === 'w' ? `${number}. ${san}` : parts.length === 0 ? `${number}… ${san}` : san);
      current = applyMove(current, move);
    }
    return parts.join(' ') || 'Linha principal indisponível.';
  }

  function showEvaluation(scoreType, rawScore, rootTurn) {
    const score = Number(rawScore);
    const whiteScore = rootTurn === 'w' ? score : -score;
    if (scoreType === 'mate') {
      const text = `${whiteScore > 0 ? '+' : whiteScore < 0 ? '−' : ''}M${Math.abs(whiteScore)}`;
      evaluationNumber.textContent = text;
      evaluationNumber.classList.toggle('positive', whiteScore > 0);
      evaluationNumber.classList.toggle('negative', whiteScore < 0);
      evaluationBarLabel.classList.toggle('positive', whiteScore > 0);
      evaluationBarLabel.classList.toggle('negative', whiteScore < 0);
      evaluationSide.textContent = whiteScore > 0 ? 'Mate para as brancas' : whiteScore < 0 ? 'Mate para as pretas' : '';
      evaluationFill.style.height = whiteScore > 0 ? '5%' : whiteScore < 0 ? '95%' : '50%';
      evaluationBarLabel.textContent = text;
      evaluationBar.setAttribute('aria-label', evaluationSide.textContent);
      return;
    }
    const pawns = whiteScore / 100;
    // Valores extremos continuam sendo úteis para a barra, mas não são
    // avaliações legíveis como uma vantagem literal de dezenas de peões.
    const shownPawns = Math.max(-10, Math.min(10, pawns));
    const display = pawns > 10 ? '≥+10.0' : pawns < -10 ? '≤−10.0'
      : shownPawns > 0 ? `+${shownPawns.toFixed(1)}` : shownPawns < 0 ? `−${Math.abs(shownPawns).toFixed(1)}` : '0.0';
    evaluationNumber.textContent = display;
    evaluationNumber.classList.toggle('positive', pawns > 0.15);
    evaluationNumber.classList.toggle('negative', pawns < -0.15);
    evaluationBarLabel.classList.toggle('positive', pawns > 0.15);
    evaluationBarLabel.classList.toggle('negative', pawns < -0.15);
    evaluationSide.textContent = pawns > 0.15 ? 'Vantagem das brancas' : pawns < -0.15 ? 'Vantagem das pretas' : 'Posição equilibrada';
    const whitePercent = Math.max(5, Math.min(95, 50 + 45 * Math.tanh(whiteScore / 400)));
    evaluationFill.style.height = `${100 - whitePercent}%`;
    evaluationBarLabel.textContent = display;
    evaluationBar.setAttribute('aria-label', `${display}, ${evaluationSide.textContent.toLowerCase()}`);
  }

  function handleEngineInfo(line) {
    if (!activeAnalysis || analysisStopping || !line.startsWith('info ')) return;
    const depth = Number(line.match(/\bdepth\s+(\d+)/)?.[1] || 0);
    const nps = Number(line.match(/\bnps\s+(\d+)/)?.[1] || 0);
    const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
    const pvMatch = line.match(/\bpv\s+(.+)$/);
    if (activeAnalysis.kind === 'game') {
      const batch = gameBatch;
      if (!batch) return;
      const index = activeAnalysis.batchIndex;
      gameProgressLabel.textContent = `Posição ${index + 1} de ${batch.positions.length} · profundidade ${depth || 0} de ${activeAnalysis.depth}`;
      gameProgressCount.textContent = `${index}/${batch.positions.length} · ${batch.cacheHits} em cache`;
      gameProgressBar.value = Math.min(99, (index + (depth / activeAnalysis.depth)) / batch.positions.length * 100);
      const multipv = Number(line.match(/\bmultipv\s+(\d+)/)?.[1] || 1);
      if (scoreMatch && pvMatch) {
        if (depth > (batch.currentResult.variationDepth || 0)) {
          batch.currentResult.variations = [];
          batch.currentResult.variationDepth = depth;
        }
        if (depth === batch.currentResult.variationDepth) batch.currentResult.variations[multipv - 1] = { score: { type: scoreMatch[1], value: Number(scoreMatch[2]) }, pv: pvMatch[1] };
        if (multipv === 1) {
          batch.currentResult.score = { type: scoreMatch[1], value: Number(scoreMatch[2]) };
          batch.currentResult.pv = pvMatch[1];
          batch.currentResult.depth = depth;
        }
      }
      if (nps) batch.currentResult.nps = nps;
      activeAnalysis.latestScore = batch.currentResult.score;
      activeAnalysis.latestPv = batch.currentResult.pv;
      return;
    }
    if (depth) {
      progressLabel.textContent = `Profundidade ${depth} de ${activeAnalysis.depth}`;
      progressBar.value = Math.min(99, depth / activeAnalysis.depth * 100);
    }
    progressStats.textContent = nps ? `${new Intl.NumberFormat('pt-BR').format(nps)} nós/s` : '';
    const multipv = Number(line.match(/\bmultipv\s+(\d+)/)?.[1] || 1);
    if (scoreMatch && pvMatch) {
      if (depth > (activeAnalysis.variationDepth || 0)) {
        activeAnalysis.latestVariations = [];
        activeAnalysis.variationDepth = depth;
      }
      if (depth === activeAnalysis.variationDepth) {
        activeAnalysis.latestVariations[multipv - 1] = { score: { type: scoreMatch[1], value: Number(scoreMatch[2]) }, pv: pvMatch[1] };
      }
    }
    if (multipv === 1) {
      if (scoreMatch) showEvaluation(scoreMatch[1], scoreMatch[2], activeAnalysis.turn);
      if (pvMatch) principalVariation.textContent = formatPrincipalVariation(activeAnalysis.fen, pvMatch[1]);
      if (scoreMatch) activeAnalysis.latestScore = { type: scoreMatch[1], value: Number(scoreMatch[2]) };
      if (pvMatch) activeAnalysis.latestPv = pvMatch[1];
    }
  }

  function finishEngineSearch(line) {
    const completed = activeAnalysis;
    activeAnalysis = null;
    if (completed?.kind === 'game') {
      analysisProgress.hidden = true;
      if (analysisStopping) {
        analysisStopping = false;
        if (gameBatch) gameProgressLabel.textContent = `Análise cancelada após ${gameBatch.results.length} de ${gameBatch.positions.length} posições.`;
        engineWorker?.postMessage('setoption name MultiPV value 1');
        gameBatch = null;
        renderGameSummary(gameReviewResults, true);
        engineStatusText.textContent = 'Análise da partida cancelada com segurança.';
        renderGameReviewAtCurrentPosition();
      } else if (gameBatch) {
        const batch = gameBatch;
        const snapshot = batch.positions[completed.batchIndex];
        const bestToken = line.match(/^bestmove\s+(\S+)/)?.[1];
        rememberAnalysis(snapshot.fen, completed.depth, { score: batch.currentResult.score, pv: batch.currentResult.pv || '', variations: batch.currentResult.variations || [], bestMove: bestToken, depth: batch.currentResult.depth || completed.depth });
        const pos = positionFromFen(snapshot.fen);
        const move = bestToken && bestToken !== '(none)' && bestToken !== '0000' ? parseUciMove(pos, bestToken) : null;
        const score = batch.currentResult.score;
        const result = { index: snapshot.index, label: snapshot.label, turn: snapshot.turn, fen: snapshot.fen, evaluation: resultEvaluation(score, snapshot.turn), best: move ? moveToSan(pos, move) : 'Nenhum lance legal', bestMove: bestToken, pvUci: batch.currentResult.pv || '', pv: formatPrincipalVariation(snapshot.fen, batch.currentResult.pv || ''), variations: batch.currentResult.variations || [], score, depth: batch.currentResult.depth };
        addGamePositionResult(batch, snapshot, result);
        batch.nextIndex += 1;
        if (batch.nextIndex < batch.positions.length) startNextGamePosition();
        else {
          gameProgressBar.value = 100; gameProgressCount.textContent = `${batch.positions.length}/${batch.positions.length} · ${batch.cacheHits} em cache`;
          gameProgressLabel.textContent = `Partida analisada: ${batch.positions.length} posições, profundidade ${batch.depth}.`;
          engineStatusText.textContent = variationSession ? 'Análise completa da variação concluída.' : 'Análise completa da partida concluída.';
          engineWorker?.postMessage('setoption name MultiPV value 1');
          gameBatch = null;
          renderGameReviewAtCurrentPosition();
          if (!variationSession) saveCurrentAnalysis();
        }
      }
      updateAnalysisControls();
      analyzeVariationWhenReady();
      return;
    }
    analysisProgress.hidden = true;
    if (analysisStopping) {
      analysisStopping = false;
      engineStatusText.textContent = analysisCancellationMessage;
      engineWorker?.postMessage('setoption name MultiPV value 1');
    } else if (completed) {
      const moveToken = line.match(/^bestmove\s+(\S+)/)?.[1];
      const variations = completed.latestVariations || [];
      renderBestMoves({ fen: completed.fen, turn: completed.turn, bestMove: moveToken, pvUci: completed.latestPv || '', score: completed.latestScore, variations });
      rememberAnalysis(completed.fen, completed.depth, { score: completed.latestScore, pv: completed.latestPv || '', variations, bestMove: moveToken, depth: completed.depth });
      if (moveToken && moveToken !== '(none)' && moveToken !== '0000') {
        const move = parseUciMove(positionFromFen(completed.fen), moveToken);
        bestMoveLabel.textContent = move ? moveToSan(positionFromFen(completed.fen), move) : moveToken;
      } else bestMoveLabel.textContent = 'Nenhum lance legal';
      progressBar.value = 100;
      progressLabel.textContent = 'Análise concluída';
      engineStatusText.textContent = `Análise concluída até a profundidade ${completed.depth}.`;
      renderCurrentMoveQuality({
        fen: completed.fen, turn: completed.turn, score: completed.latestScore,
        bestMove: moveToken, pvUci: completed.latestPv || '',
        pv: formatPrincipalVariation(completed.fen, completed.latestPv || ''),
        variations, depth: completed.depth
      }, 'Análise da posição');
    }
    engineWorker?.postMessage('setoption name MultiPV value 1');
    updateAnalysisControls();
    analyzeVariationWhenReady();
  }

  function startPendingAnalysis() {
    if (!pendingAnalysis || !engineWorker || engineState !== 'ready' || activeAnalysis) return;
    if (pendingAnalysis.kind === 'game') {
      gameBatch = pendingAnalysis; pendingAnalysis = null; analysisStopping = false;
      engineWorker.postMessage('setoption name MultiPV value 3');
      gameAnalysisPanel.hidden = false; gameAnalysisRows.replaceChildren();
      gameProgressBar.value = 0; gameProgressCount.textContent = `0/${gameBatch.positions.length} · ${gameBatch.cacheHits} em cache`;
      gameProgressLabel.textContent = gameBatch.cacheHits ? `${gameBatch.cacheHits} posições serão reaproveitadas do cache local.` : 'Preparando análise da partida…';
      engineStatusText.textContent = variationSession ? 'Análise da variação em andamento no motor local.' : 'Análise da partida em andamento no motor local.';
      startNextGamePosition(); updateAnalysisControls(); return;
    }
    activeAnalysis = pendingAnalysis; pendingAnalysis = null; analysisStopping = false;
    analysisPlaceholder.hidden = true; analysisResults.hidden = false; analysisProgress.hidden = false;
    activeAnalysis.latestVariations = []; activeAnalysis.variationDepth = 0;
    progressLabel.textContent = `Iniciando profundidade ${activeAnalysis.depth}…`;
    progressStats.textContent = ''; progressBar.max = 100; progressBar.value = 0;
    bestMoveLabel.textContent = 'Calculando…'; principalVariation.textContent = 'Calculando linha principal…';
    evaluationNumber.textContent = '…'; evaluationNumber.classList.remove('positive', 'negative');
    evaluationBarLabel.textContent = '…'; evaluationBarLabel.classList.remove('positive', 'negative');
    evaluationSide.textContent = 'Stockfish analisando';
    engineStatusText.textContent = 'Análise em andamento no motor local.';
    engineWorker.postMessage('setoption name MultiPV value 3');
    engineWorker.postMessage(`position fen ${activeAnalysis.fen}`);
    engineWorker.postMessage(`go depth ${activeAnalysis.depth}`);
    updateAnalysisControls();
  }

  function appendGameResult(result) {
    const row = document.createElement('article'); row.className = 'game-result-row';
    const jump = document.createElement('button'); jump.type = 'button'; jump.className = 'game-position-link'; jump.textContent = result.label;
    jump.addEventListener('click', () => goTo(result.index));
    const details = document.createElement('div'); details.className = 'game-result-details';
    const evaluation = document.createElement('strong'); evaluation.className = 'game-result-eval'; evaluation.textContent = result.evaluation;
    const best = document.createElement('span'); best.className = 'game-result-best'; best.textContent = `Melhor continuação: ${result.best}`;
    const pv = document.createElement('p'); pv.className = 'game-result-pv'; pv.textContent = result.pv;
    details.append(evaluation, best, pv); row.append(jump, details); gameAnalysisRows.append(row);
    return { row, details };
  }

  function summaryMoveLabel(move) {
    return `${move.moveNumber}${move.side === 'w' ? '.' : '…'} ${move.san}`;
  }

  function summarySideLabel(side) {
    const colorName = side === 'w' ? 'Brancas' : 'Pretas';
    const player = gameHeaders[side === 'w' ? 'White' : 'Black'];
    return player && player !== '?' ? `${colorName} · ${player}` : colorName;
  }


  function summaryEvaluation(score, turn) {
    const value = scoreForSide(score, turn, 'w');
    if (value === null) return 'indisponível';
    if (score.type === 'mate') return value > 0 ? 'mate a favor das brancas' : value < 0 ? 'mate a favor das pretas' : 'mate';
    const pawns = value / 100;
    if (Math.abs(pawns) < 0.35) return 'equilíbrio';
    const side = pawns > 0 ? 'das brancas' : 'das pretas';
    const magnitude = Math.abs(pawns);
    return `${magnitude >= 3 ? 'grande vantagem' : magnitude >= 1 ? 'vantagem' : 'pequena vantagem'} ${side}`;
  }

  function summaryPhase(result, index) {
    if (index <= 20) return 'Abertura';
    const board = positionFromFen(result.fen).board;
    const queens = board.filter((piece) => piece.toUpperCase() === 'Q').length;
    const remainingPieces = board.filter((piece) => 'QRBN'.includes(piece.toUpperCase())).length;
    return queens === 0 && remainingPieces <= 6 ? 'Final' : 'Meio-jogo';
  }

  function appendSummaryMoveLink(container, item, label) {
    const jump = document.createElement('button'); jump.type = 'button'; jump.className = 'summary-move-link';
    jump.textContent = label || `Rever ${summaryMoveLabel(item.result.playedMove)}`;
    jump.addEventListener('click', () => {
      exerciseState = null;
      if (item.index === historyIndex) render(); else goTo(item.index);
      showBoard();
    });
    container.append(jump);
  }

  const POSITIVE_FACT_LABELS = {
    'found-mate': 'Mates forçados encontrados', 'fork-found': 'Ataques duplos confirmados pela variante',
    'won-material': 'Material ganho e mantido na variante', 'escaped-threat': 'Peças ameaçadas postas em segurança'
  };
  const POSITIONAL_LABELS = {
    castle: 'Roque', develop: 'Desenvolvimento de peças menores', 'center-pawn': 'Peões ocupando o centro',
    'center-control': 'Mais controle das casas centrais', mobility: 'Peças com mais mobilidade', 'open-file': 'Torre em coluna sem peões', 'passed-pawn': 'Peão passado criado'
  };

  function summaryItemLesson(item) { return item.result.quality?.lesson || null; }

  function renderGameSummary(results, force = false) {
    const resultCount = results.reduce((count, result) => count + Number(Boolean(result)), 0);
    if (variationSession) { gameSummary.hidden = true; return; }
    if (resultCount === gameSummaryRenderedCount && !gameSummary.hidden && !force) return;
    if (!force && resultCount > 0 && resultCount < history.length && resultCount % 8 !== 0) return;
    gameSummaryRenderedCount = resultCount;
    const analyzed = results.map((result, index) => result ? { result, index } : null).filter(Boolean);
    const classified = analyzed.filter(({ result, index }) => index > 0 && result.quality?.loss !== null && result.quality?.loss !== undefined && result.playedMove);
    if (!classified.length) { gameSummary.hidden = true; return; }

    gameSummary.hidden = false;
    const partial = analyzed.length < history.length;
    gameSummaryStatus.textContent = partial ? 'Parcial · análise ainda incompleta' : 'Análise concluída';
    const first = analyzed[0].result, last = analyzed[analyzed.length - 1].result;
    const startEval = summaryEvaluation(first.score, first.turn);
    const endEval = summaryEvaluation(last.score, last.turn);
    const bySide = { w: [], b: [] };
    for (const item of classified) bySide[item.result.playedMove.side].push(item);
    const concerningKinds = new Set(['inaccuracy', 'mistake', 'blunder']);
    const goodKinds = new Set(coach.goodKinds);
    const sideLines = ['w', 'b'].map((side) => {
      const moves = bySide[side];
      const concerning = moves.filter(({ result }) => concerningKinds.has(result.quality.kind));
      const sound = moves.filter(({ result }) => goodKinds.has(result.quality.kind)).length;
      return `${summarySideLabel(side)}: ${sound} lances bons ou melhores, ${concerning.length} a rever.`;
    });
    gameSummaryOverview.replaceChildren();
    const overview = document.createElement('p');
    const gameResultText = gameResult !== '*' && !variationSession ? ` Resultado registrado no PGN: ${gameResult}.` : '';
    overview.textContent = `${analyzed.length} posições analisadas. A avaliação começou em ${startEval} e terminou em ${endEval}.${gameResultText} ${sideLines.join(' ')}`;
    gameSummaryOverview.append(overview);
    gameSummaryMetrics.replaceChildren();
    const solidMoves = classified.filter(({ result }) => goodKinds.has(result.quality.kind)).length;
    const reviewMoves = classified.filter(({ result }) => concerningKinds.has(result.quality.kind)).length;
    const metrics = [
      { value: `${analyzed.length}/${history.length}`, label: 'posições analisadas', kind: 'metric-progress' },
      { value: String(solidMoves), label: 'lances bons ou melhores', kind: 'metric-positive' },
      { value: String(reviewMoves), label: 'lances para rever', kind: reviewMoves ? 'metric-attention' : 'metric-positive' }
    ];
    for (const metric of metrics) {
      const card = document.createElement('div'); card.className = `summary-metric ${metric.kind}`;
      const value = document.createElement('strong'); value.textContent = metric.value;
      const label = document.createElement('span'); label.textContent = metric.label;
      card.append(value, label); gameSummaryMetrics.append(card);
    }

    // Revisão guiada: momentos críticos (ambos os lados) + um lance para repetir.
    gameSummaryCoach.replaceChildren();
    const coachingMoments = classified
      .filter(({ result }) => result.quality.loss >= 0.05 && concerningKinds.has(result.quality.kind))
      .sort((a, b) => b.result.quality.loss - a.result.quality.loss)
      .slice(0, 3);
    if (!coachingMoments.length) {
      const strongest = classified.slice().sort((a, b) => b.result.quality.loss - a.result.quality.loss)[0];
      if (strongest) coachingMoments.push(strongest);
    }
    const addCoachCard = (item, positive) => {
      const lesson = summaryItemLesson(item), move = item.result.playedMove;
      if (!lesson) return;
      const card = document.createElement('article'); card.className = `coach-review-card${positive ? ' coach-review-positive' : ''}`;
      const heading = document.createElement('strong');
      heading.textContent = positive
        ? `Lance para repetir · ${summaryMoveLabel(move)} · ${item.result.quality.label}`
        : `${summaryMoveLabel(move)} · ${item.result.quality.label} · ${lesson.themeLabel}`;
      card.append(heading);
      if (!positive) { const prompt = document.createElement('p'); prompt.className = 'coach-review-prompt'; prompt.textContent = lesson.questions.review; card.append(prompt); }
      const reveal = document.createElement('details'); reveal.className = 'coach-review-answer';
      const revealLabel = document.createElement('summary'); revealLabel.textContent = positive ? 'Ver por que funcionou' : 'Revelar o que a análise encontrou';
      reveal.append(revealLabel, lessonParagraph(lesson.headline));
      const keyFacts = lesson.facts.filter((fact) => fact.id !== 'evaluation' && fact.id !== 'played-rank').slice(0, 2);
      if (keyFacts.length) reveal.append(lessonList(keyFacts, 'lesson-list'));
      else if (lesson.uncertainty.length) reveal.append(lessonList([{ text: lesson.uncertainty[0] }], 'lesson-list'));
      reveal.append(lessonParagraph(`Para levar: ${lesson.takeaway}`));
      card.append(reveal);
      if (!positive) {
        const solve = document.createElement('button'); solve.type = 'button'; solve.className = 'summary-move-link summary-exercise-link';
        solve.textContent = 'Resolver no tabuleiro (posição antes do lance)';
        solve.addEventListener('click', () => startExercise(item.index));
        card.append(solve);
      }
      appendSummaryMoveLink(card, item, 'Abrir o lance já analisado');
      gameSummaryCoach.append(card);
    };
    coachingMoments.forEach((item) => addCoachCard(item, false));
    const standout = classified
      .filter(({ result }) => goodKinds.has(result.quality.kind) && summaryItemLesson({ result })?.explanation === 'verified' && summaryItemLesson({ result }).positives.some((entry) => entry.kind === 'fact'))
      .sort((a, b) => ['brilliant', 'great'].includes(b.result.quality.kind) - ['brilliant', 'great'].includes(a.result.quality.kind))[0];
    if (standout) addCoachCard(standout, true);
    if (!gameSummaryCoach.childElementCount) {
      const note = document.createElement('p'); note.className = 'game-summary-note';
      note.textContent = 'Esta análise salva não contém explicações guiadas para exibir.';
      gameSummaryCoach.append(note);
    }

    gameSummaryOpening.replaceChildren();
    const opening = document.createElement('p'); opening.className = 'game-summary-note';
    const openingName = gameHeaders.Opening || (gameHeaders.ECO ? `ECO ${gameHeaders.ECO}` : '');
    opening.textContent = `Abertura${openingName ? ` · ${openingName}` : ' · nome não identificado (sem base de teoria de aberturas)'}: considera os primeiros 10 lances completos. Veja as classificações dessa fase abaixo.`;
    gameSummaryOpening.append(opening);

    const qualityRows = [
      ['Brilhante', 'brilliant'], ['Grande lance', 'great'], ['Melhor', 'best'],
      ['Excelente', 'excellent'], ['Bom', 'good'], ['Imprecisão', 'inaccuracy'],
      ['Erro', 'mistake'], ['Erro grave', 'blunder'], ['Chance perdida', 'miss']
    ];
    gameSummaryQualities.replaceChildren();
    const qualityTable = document.createElement('table'); qualityTable.className = 'summary-quality-table';
    const head = document.createElement('thead'), headRow = document.createElement('tr');
    for (const title of ['Classificação', 'Brancas', 'Pretas']) {
      const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; headRow.append(th);
    }
    head.append(headRow); qualityTable.append(head);
    const body = document.createElement('tbody');
    for (const [label, kind] of qualityRows) {
      const row = document.createElement('tr'), title = document.createElement('th');
      if (kind === 'miss') row.className = 'summary-quality-missed';
      title.scope = 'row'; title.textContent = label; row.append(title);
      for (const side of ['w', 'b']) {
        const cell = document.createElement('td');
        cell.textContent = String(bySide[side].filter(({ result }) => kind === 'miss' ? result.quality.label === 'Chance perdida' : result.quality.kind === kind && result.quality.label !== 'Chance perdida').length);
        row.append(cell);
      }
      body.append(row);
    }
    qualityTable.append(body); gameSummaryQualities.append(qualityTable);

    gameSummaryPhases.replaceChildren();
    for (const phase of ['Abertura', 'Meio-jogo', 'Final']) {
      const phaseMoves = classified.filter(({ result, index }) => summaryPhase(result, index) === phase);
      const article = document.createElement('article'); article.className = 'game-summary-item';
      const heading = document.createElement('strong'); heading.textContent = `${phase} · ${phaseMoves.length} lances classificados`;
      article.append(heading);
      if (!phaseMoves.length) {
        const note = document.createElement('p'); note.textContent = phase === 'Final' ? 'A partida não chegou ao final segundo o critério estimado do relatório.' : 'Não há lances desta fase disponíveis.'; article.append(note);
      } else {
        for (const side of ['w', 'b']) {
          const sideMoves = phaseMoves.filter(({ result }) => result.playedMove.side === side);
          const good = sideMoves.filter(({ result }) => goodKinds.has(result.quality.kind)).length;
          const errors = sideMoves.filter(({ result }) => concerningKinds.has(result.quality.kind)).length;
          const line = document.createElement('p'); line.textContent = `${summarySideLabel(side)}: ${good} bons ou melhores · ${errors} imprecisões/erros.`; article.append(line);
        }
        const error = phaseMoves.filter(({ result }) => concerningKinds.has(result.quality.kind)).sort((a, b) => b.result.quality.loss - a.result.quality.loss)[0];
        if (error) appendSummaryMoveLink(article, error, `Rever ponto crítico: ${summaryMoveLabel(error.result.playedMove)}`);
      }
      gameSummaryPhases.append(article);
    }

    // Tática: padrões de erro por jogador, agrupados pelo tema do treinador (só fatos demonstrados ou o rótulo "sem causa").
    gameSummaryThemes.replaceChildren();
    let foundTheme = false;
    for (const side of ['w', 'b']) {
      const counts = new Map();
      for (const item of bySide[side].filter(({ result }) => concerningKinds.has(result.quality.kind))) {
        const lesson = summaryItemLesson(item); if (!lesson) continue;
        if (!counts.has(lesson.theme)) counts.set(lesson.theme, []);
        counts.get(lesson.theme).push(item);
      }
      for (const [theme, examples] of [...counts.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 2)) {
        foundTheme = true;
        const info = coach.themes[theme];
        const article = document.createElement('article'); article.className = 'game-summary-item';
        const heading = document.createElement('strong'); heading.textContent = `${summarySideLabel(side)} · ${info.label} (${examples.length})`;
        const note = document.createElement('p');
        const unproven = theme === 'positional' ? ' Nestes lances as variantes não demonstram uma causa tática; trate o tema como hipótese de estudo.' : '';
        note.textContent = `${examples.length > 1 ? `O padrão apareceu em ${examples.length} lances. ` : 'Caso isolado nesta partida. '}${info.habit}${unproven}`;
        article.append(heading, note); appendSummaryMoveLink(article, examples[0]); gameSummaryThemes.append(article);
      }
    }
    const tacticalFinds = new Map();
    for (const item of classified.filter(({ result }) => goodKinds.has(result.quality.kind))) {
      for (const entry of summaryItemLesson(item)?.positives || []) {
        if (entry.kind !== 'fact' || !POSITIVE_FACT_LABELS[entry.id]) continue;
        if (!tacticalFinds.has(entry.id)) tacticalFinds.set(entry.id, []);
        tacticalFinds.get(entry.id).push(item);
      }
    }
    for (const [id, examples] of tacticalFinds) {
      foundTheme = true;
      const article = document.createElement('article'); article.className = 'game-summary-item';
      const heading = document.createElement('strong'); heading.textContent = `${POSITIVE_FACT_LABELS[id]} (${examples.length})`;
      const note = document.createElement('p'); note.textContent = 'Fato demonstrado por lances legais ou por variante do motor em lance bem avaliado.';
      article.append(heading, note); appendSummaryMoveLink(article, examples[0]); gameSummaryThemes.append(article);
    }
    if (!foundTheme) {
      const note = document.createElement('p'); note.className = 'game-summary-note';
      note.textContent = 'Nenhum padrão de erro nem tema tático foi demonstrado automaticamente. Isso não significa que todos os lances foram ideais; use o gráfico e as explicações individuais para revisar as decisões.';
      gameSummaryThemes.append(note);
    }

    // Estratégia: só indícios (heurísticas) contados em lances bem avaliados.
    gameSummaryStrategy.replaceChildren();
    const strategyCounts = new Map();
    for (const item of classified.filter(({ result }) => goodKinds.has(result.quality.kind))) {
      for (const entry of summaryItemLesson(item)?.positives || []) {
        if (entry.kind === 'heuristic') strategyCounts.set(entry.id, (strategyCounts.get(entry.id) || 0) + 1);
      }
    }
    if (strategyCounts.size) {
      for (const [id, count] of [...strategyCounts.entries()].sort((a, b) => b[1] - a[1])) {
        const note = document.createElement('p'); note.className = 'game-summary-note'; note.textContent = `${POSITIONAL_LABELS[id] || id}: observado em ${count} lance(s) bem avaliado(s).`; gameSummaryStrategy.append(note);
      }
      const caveat = document.createElement('p'); caveat.className = 'game-summary-note'; caveat.textContent = 'São indícios medidos na posição, não uma avaliação de planos ou da estrutura de peões, e não provam por que o lance foi bom.'; gameSummaryStrategy.append(caveat);
    } else {
      const note = document.createElement('p'); note.className = 'game-summary-note'; note.textContent = 'Nenhum indício posicional simples foi medido nos lances bem avaliados. Explore as explicações individuais para comparar planos.'; gameSummaryStrategy.append(note);
    }

    gameSummaryTurningPoints.replaceChildren();
    const turningPoints = classified
      .filter(({ result }) => result.quality.loss >= 0.05 && concerningKinds.has(result.quality.kind))
      .sort((a, b) => b.result.quality.loss - a.result.quality.loss)
      .slice(0, 3);
    if (!turningPoints.length) {
      const note = document.createElement('p'); note.className = 'game-summary-note';
      note.textContent = 'Não houve uma queda grande de pontos esperados nos lances analisados. Confira a profundidade e lembre que buscas de motor são estimativas.';
      gameSummaryTurningPoints.append(note);
    }
    for (const item of turningPoints) {
      const article = document.createElement('article'); article.className = 'game-summary-item';
      const heading = document.createElement('strong');
      heading.textContent = `${summaryMoveLabel(item.result.playedMove)} · ${item.result.quality.label}`;
      const note = document.createElement('p');
      note.textContent = item.result.quality.explanation;
      article.append(heading, note); appendSummaryMoveLink(article, item, 'Ir para este lance'); gameSummaryTurningPoints.append(article);
    }
    gameSummary.setAttribute('aria-label', partial ? `Resumo parcial de ${analyzed.length} posições analisadas` : 'Resumo para aprendizado da partida');
  }

  function renderAdvantageChart(results) {
    renderGameSummary(results);
    const svg = advantageChart;
    const namespace = 'http://www.w3.org/2000/svg';
    const make = (tag, attributes = {}, text = '') => {
      const element = document.createElementNS(namespace, tag);
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
      if (text) element.textContent = text;
      return element;
    };
    const width = 900, height = 220;
    const left = 48, right = 886, top = 16, bottom = 178;
    const largestEval = results.reduce((largest, result) => {
      if (!result?.score || result.score.type === 'mate') return largest;
      const whiteScore = result.turn === 'w' ? result.score.value : -result.score.value;
      return Math.max(largest, Math.abs(whiteScore / 100));
    }, 0);
    const maxScore = Math.max(2, Math.min(20, Math.ceil(largestEval / 2) * 2));
    const baseline = top + (bottom - top) / 2;
    const yFor = (score) => top + ((maxScore - Math.max(-maxScore, Math.min(maxScore, score))) / (maxScore * 2)) * (bottom - top);
    const maxIndex = Math.max(1, history.length - 1);
    const xFor = (index) => left + (index / maxIndex) * (right - left);
    const scoreFor = (result) => {
      if (!result?.score) return null;
      const whiteScore = result.turn === 'w' ? result.score.value : -result.score.value;
      if (result.score.type === 'mate') return Math.sign(whiteScore || 1) * maxScore;
      return Math.max(-maxScore, Math.min(maxScore, whiteScore / 100));
    };
    const scoreText = (result) => {
      if (result.score.type === 'mate') {
        const whiteMate = (result.turn === 'w' ? result.score.value : -result.score.value);
        return `${whiteMate > 0 ? '+' : '−'}M${Math.abs(whiteMate)}`;
      }
      const value = scoreFor(result);
      return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(1)}`;
    };
    const evaluationContext = (result) => {
      if (result.score.type === 'mate') {
        const whiteMate = result.turn === 'w' ? result.score.value : -result.score.value;
        if (!whiteMate) return 'Mate';
        const winner = whiteMate > 0 ? 'brancas' : 'pretas';
        return `Mate em ${Math.abs(whiteMate)} para as ${winner}`;
      }
      const value = scoreFor(result);
      const side = value > 0.15 ? 'Vantagem das brancas' : value < -0.15 ? 'Vantagem das pretas' : 'Posição equilibrada';
      return `${scoreText(result)} · ${side}`;
    };
    const moveText = (index) => {
      if (index === 0) return 'Posição inicial';
      const entry = history[index];
      return entry ? `${entry.moveNumber}${entry.side === 'w' ? '.' : '…'} ${entry.san}` : `Posição ${index}`;
    };
    const qualityColor = (result, index) => {
      const kind = qualityKindForDisplay(result.quality);
      return ({
        best: '#78e58b', excellent: '#55c6ed', good: '#c5df78',
        inaccuracy: '#ffd34f', mistake: '#ff995b', blunder: '#ff696e', missed: '#c28a52',
        brilliant: '#43d5e8', great: '#bc91ff'
      })[kind] || (index === 0 ? '#d8e3d5' : '#89958b');
    };

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();
    chartSelectPointAt = null;
    const ticks = [maxScore, maxScore / 2, 0, -maxScore / 2, -maxScore];
    for (const tick of ticks) {
      const y = yFor(tick);
      svg.append(make('line', { x1: left, y1: y, x2: right, y2: y, class: tick === 0 ? 'chart-zero-line' : 'chart-grid-line' }));
      const label = tick > 0 ? `+${tick}` : String(tick).replace('-', '−');
      svg.append(make('text', { x: left - 9, y: y + 3, class: 'chart-axis-label', 'text-anchor': 'end' }, label));
    }
    svg.append(make('text', { x: left, y: height - 9, class: 'chart-axis-caption' }, 'Início'));
    svg.append(make('text', { x: (left + right) / 2, y: height - 9, class: 'chart-axis-caption', 'text-anchor': 'middle' }, 'Lances'));
    svg.append(make('text', { x: right, y: height - 9, class: 'chart-axis-caption', 'text-anchor': 'end' }, 'Final'));

    const points = results.map((result, index) => result && scoreFor(result) !== null
      ? { result, index, value: scoreFor(result), evaluation: evaluationContext(result), x: xFor(index), y: yFor(scoreFor(result)) }
      : null).filter(Boolean);
    if (!points.length) {
      svg.append(make('text', { x: (left + right) / 2, y: baseline - 5, class: 'chart-empty-label', 'text-anchor': 'middle' }, 'Aguardando avaliações do Stockfish'));
      chartCurrentEval.textContent = 'Aguardando avaliações';
      chartCurrentEval.hidden = false;
      advantageChartStatus.textContent = 'A análise do Stockfish preencherá o gráfico.';
      return;
    }

    const selectPoint = (point) => {
      const quality = point.result.quality?.label || (point.index === 0 ? 'Posição inicial' : 'Sem classificação');
      goTo(point.index);
      advantageChartStatus.textContent = `${moveText(point.index)} selecionada: ${evaluationContext(point.result)}, ${quality}. Tabuleiro atualizado.`;
      showBoard();
    };
    chartSelectPointAt = (x, y) => {
      if (y < top || y > bottom) return;
      const nearest = points.reduce((best, point) => Math.abs(point.x - x) < Math.abs(best.x - x) ? point : best, points[0]);
      selectPoint(nearest);
    };

    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1], to = points[index];
      const sideColor = to.value >= 0 ? '#b7e181' : '#8995a4';
      const area = make('path', {
        d: `M ${from.x} ${baseline} L ${from.x} ${from.y} L ${to.x} ${to.y} L ${to.x} ${baseline} Z`,
        class: to.value >= 0 ? 'chart-area-white' : 'chart-area-black'
      });
      const line = make('path', { d: `M ${from.x} ${from.y} L ${to.x} ${to.y}`, class: 'chart-advantage-segment' });
      line.setAttribute('stroke', sideColor);
      svg.append(area, line);
    }

    for (const point of points) {
      const quality = point.result.quality?.label || (point.index === 0 ? 'Posição inicial' : 'Sem classificação');
      const group = make('g', {
        class: 'chart-point',
        'data-move-index': point.index,
        role: 'button',
        tabindex: '0',
        'aria-describedby': 'chart-point-tooltip',
        'aria-label': `${moveText(point.index)}: ${evaluationContext(point.result)}, ${quality}. Ir para esta posição no tabuleiro.`
      });
      group.append(make('title', {}, `${moveText(point.index)} · ${evaluationContext(point.result)} · ${quality}`));
      group.append(make('circle', { cx: point.x, cy: point.y, r: 4.5, class: 'chart-point-hit-area' }));
      group.append(make('circle', { cx: point.x, cy: point.y, r: point.index === historyIndex ? 6.3 : 4.1, class: 'chart-point-marker' }));
      group.lastChild.setAttribute('fill', qualityColor(point.result, point.index));
      group.addEventListener('pointerenter', () => showChartPointTooltip(point, moveText(point.index)));
      group.addEventListener('pointerleave', hideChartPointTooltip);
      group.addEventListener('focus', () => showChartPointTooltip(point, moveText(point.index)));
      group.addEventListener('blur', hideChartPointTooltip);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPoint(point); }
      });
      svg.append(group);
    }

    const latest = points[points.length - 1];
    chartCurrentEval.textContent = latest.evaluation;
    chartCurrentEval.hidden = latest.evaluation === 'Mate';
    advantageChartStatus.textContent = 'Clique ou toque em um ponto para ir direto à posição correspondente no tabuleiro. As cores dos pontos indicam a qualidade dos lances.';
    updateAdvantageChartSelection();
  }

  function updateAdvantageChartSelection() {
    advantageChart.querySelectorAll('.chart-point').forEach((point) => {
      const selectedPoint = Number(point.dataset.moveIndex) === historyIndex;
      point.classList.toggle('selected', selectedPoint);
      point.setAttribute('aria-pressed', String(selectedPoint));
      const marker = point.querySelector('.chart-point-marker');
      if (marker) marker.setAttribute('r', selectedPoint ? '6.3' : '4.1');
    });
  }

  // Mate e afogamento não têm lance a calcular: o resultado é conhecido pelas regras (o motor não devolve linha).
  function terminalAnalysis(fen, depth) {
    const pos = positionFromFen(fen);
    if (allLegalMoves(pos).length) return null;
    return { score: inCheck(pos, pos.turn) ? { type: 'mate', value: 0 } : { type: 'cp', value: 0 }, pv: '', variations: [], bestMove: '(none)', depth };
  }

  function startNextGamePosition() {
    if (!gameBatch || !engineWorker || analysisStopping) return;
    let snapshot = gameBatch.positions[gameBatch.nextIndex];
    while (snapshot && !analysisStopping) {
      const cached = lookupAnalysis(snapshot.fen, gameBatch.depth) || terminalAnalysis(snapshot.fen, gameBatch.depth);
      if (!cached) break;
      const result = renderGameCacheResult(snapshot, cached);
      addGamePositionResult(gameBatch, snapshot, result);
      gameBatch.nextIndex += 1;
      snapshot = gameBatch.positions[gameBatch.nextIndex];
    }
    if (!snapshot || analysisStopping) {
      if (gameBatch && snapshot === undefined) {
        gameProgressBar.value = 100; gameProgressCount.textContent = `${gameBatch.positions.length}/${gameBatch.positions.length} · ${gameBatch.cacheHits} em cache`;
        gameProgressLabel.textContent = `Partida analisada: ${gameBatch.positions.length} posições, profundidade ${gameBatch.depth}.`;
        engineStatusText.textContent = `${variationSession ? 'Análise da variação concluída' : 'Análise concluída'}; ${gameBatch.cacheHits} posições reutilizadas do cache local.`;
        engineWorker?.postMessage('setoption name MultiPV value 1');
        gameBatch = null;
        renderGameReviewAtCurrentPosition();
        if (!variationSession) saveCurrentAnalysis();
      }
      return;
    }
    gameBatch.currentResult = { variations: [] };
    activeAnalysis = { kind: 'game', batchIndex: gameBatch.nextIndex, fen: snapshot.fen, turn: snapshot.turn, depth: gameBatch.depth };
    gameProgressLabel.textContent = `Analisando ${snapshot.label}…`;
    gameProgressCount.textContent = `${gameBatch.nextIndex}/${gameBatch.positions.length} · ${gameBatch.cacheHits} em cache`;
    engineWorker.postMessage(`position fen ${snapshot.fen}`);
    engineWorker.postMessage(`go depth ${gameBatch.depth}`);
  }

  async function requestGameAnalysis(options = {}) {
    if (pendingAnalysis || activeAnalysis || analysisStopping || history.length < 2) return false;
    if (Number.isInteger(options.depth)) selectedDepth = options.depth;
    else if (options.skipDepthPrompt) { if (lastGameAnalysisDepth) selectedDepth = lastGameAnalysisDepth; }
    else if (!await askAnalysisDepth()) return;
    if (pendingAnalysis || activeAnalysis || analysisStopping || history.length < 2) return false;
    lastGameAnalysisDepth = selectedDepth;
    exerciseState = null;
    punishmentPlayback = null;
    variationNeedsAnalysis = false;
    gameReviewResults = [];
    resetGuidedGamePane();
    renderMoveList();
    renderAdvantageChart(gameReviewResults);
    clearAnalysisView('Análise da partida solicitada para os lances importados.');
    const positions = history.map((entry, index) => {
      const previous = index > 0 ? history[index - 1].position : null;
      const move = entry.move;
      const movingPiece = previous && move ? previous.board[move.from] : '';
      const capturedPiece = previous && move ? (move.enPassant ? previous.board[move.to + (entry.side === 'w' ? 8 : -8)] : previous.board[move.to]) : '.';
      return {
        index, fen: currentFen(entry.position), turn: entry.position.turn,
        label: index === 0 ? 'Posição inicial' : `Após ${entry.side === 'w' ? `${entry.moveNumber}.` : `${entry.moveNumber}…`} ${entry.san}`,
        playedMove: index === 0 ? null : { side: entry.side, san: entry.san, moveNumber: entry.moveNumber, from: move.from, to: move.to, promotion: move.promotion || '', movingPiece, capturedPiece }
      };
    });
    const cacheHits = positions.filter((snapshot) => analysisCache.has(analysisCacheKey(snapshot.fen, selectedDepth))).length;
    pendingAnalysis = { kind: 'game', id: ++analysisSerial, depth: selectedDepth, positions, nextIndex: 0, results: [], cacheHits };
    gameAnalysisPanel.hidden = false; gameAnalysisRows.replaceChildren();
    gameProgressBar.value = 0; gameProgressCount.textContent = `0/${positions.length} · ${cacheHits} em cache`;
    gameProgressLabel.textContent = cacheHits ? `${cacheHits} posições já calculadas serão reaproveitadas.` : engineState === 'ready' ? 'Preparando análise da partida…' : 'Carregando Stockfish…';
    updateAnalysisControls();
    if (engineState === 'ready') startPendingAnalysis(); else startEngine();
    return true;
  }

  analyzeGameButton.addEventListener('click', requestGameAnalysis);

  function startEngine() {
    if (engineState === 'loading' || engineState === 'ready') return;
    if (location.protocol === 'file:') {
      pendingAnalysis = null;
      failEngine('O navegador bloqueia Web Workers em arquivos abertos diretamente. Inicie o site pelo lançador local.');
      return;
    }
    setEngineState('loading', 'Abrindo o motor Stockfish local…');
    try {
      const workerUrl = new URL('public/engine/stockfish-19-lite-single.js', document.baseURI);
      engineWorker = new Worker(workerUrl);
      engineTimer = window.setTimeout(() => failEngine('O motor demorou para responder. Confira se os arquivos locais estão presentes e tente novamente.'), 20000);
      engineWorker.addEventListener('message', (event) => {
        const line = String(event.data ?? '').trim();
        const idMatch = line.match(/^id name (.+)$/i);
        if (idMatch) engineName = idMatch[1];
        if (line === 'uciok') engineWorker?.postMessage('isready');
        if (line === 'readyok') {
          window.clearTimeout(engineTimer);
          setEngineState('ready', 'Stockfish local pronto.');
          startPendingAnalysis();
        }
        handleEngineInfo(line);
        if (line.startsWith('bestmove ')) finishEngineSearch(line);
      });
      engineWorker.addEventListener('error', () => failEngine('Não foi possível iniciar o motor. Abra o site pelo lançador local.'));
      engineWorker.postMessage('uci');
    } catch {
      failEngine('Não foi possível criar o Web Worker. Use o lançador local do projeto.');
    }
  }

  async function requestAnalysis() {
    if (pendingAnalysis || activeAnalysis || analysisStopping) return;
    if (!await askAnalysisDepth()) return;
    if (pendingAnalysis || activeAnalysis || analysisStopping) return;
    exerciseState = null;
    const legal = allLegalMoves(position);
    if (!legal.length) {
      analysisPlaceholder.hidden = true; analysisResults.hidden = false; analysisProgress.hidden = true;
      bestMoveLabel.textContent = inCheck(position, position.turn) ? 'Xeque-mate' : 'Afogamento';
      principalVariation.textContent = 'Não há lances legais nesta posição.';
      engineStatusText.textContent = 'A posição não tem lances legais.';
      return;
    }
    const job = { id: ++analysisSerial, fen: currentFen(position), turn: position.turn, depth: selectedDepth };
    renderBestMoves(null);
    analysisResults.classList.remove('from-game-review'); gameReviewQuality.hidden = true; moveAlternatives.hidden = true;
    const cached = lookupAnalysis(job.fen, job.depth);
    if (cached) { renderCachedPosition(cached, job.fen, job.turn, job.depth); return; }
    pendingAnalysis = job;
    analysisPlaceholder.hidden = true; analysisResults.hidden = false; analysisProgress.hidden = false;
    progressLabel.textContent = engineState === 'ready' ? 'Preparando análise…' : 'Carregando Stockfish…';
    progressStats.textContent = ''; progressBar.value = 0;
    engineStatusText.textContent = 'Análise solicitada para a posição atual.';
    updateAnalysisControls();
    if (engineState === 'ready') startPendingAnalysis(); else startEngine();
  }

  analyzeButton.addEventListener('click', requestAnalysis);

  function askAnalysisDepth() {
    const selected = depthDialog.querySelector(`input[name="analysis-depth"][value="${selectedDepth}"]`);
    if (selected) selected.checked = true;
    depthDialog.returnValue = ''; // sem isto, fechar com Esc reutilizaria o "start" da vez anterior
    depthDialog.showModal();
    return new Promise((resolve) => {
      depthDialog.addEventListener('close', () => {
        if (depthDialog.returnValue !== 'start') { resolve(false); return; }
        const choice = depthDialog.querySelector('input[name="analysis-depth"]:checked');
        if (!choice) { resolve(false); return; }
        selectedDepth = Number(choice.value);
        analysisModes.forEach((button) => {
          const active = Number(button.dataset.depth) === selectedDepth;
          button.classList.toggle('selected', active);
          button.setAttribute('aria-selected', String(active));
        });
        resolve(true);
      }, { once: true });
    });
  }

  depthDialog.querySelector('.depth-cancel').addEventListener('click', () => depthDialog.close('cancel'));
  cancelAnalysisButton.addEventListener('click', () => {
    if (autoChessComBusy) {
      autoChessComBusy = false; autoChessComQueue = [];
      window.MyChess6Cloud.archiveState = 'error';
      chessComStatus.textContent = 'Análise automática interrompida.';
    }
    if (pendingAnalysis) {
      const wasGame = pendingAnalysis.kind === 'game';
      pendingAnalysis = null;
      if (wasGame) {
        gameProgressLabel.textContent = 'Análise da partida cancelada antes de iniciar.';
        engineStatusText.textContent = 'Análise da partida cancelada.';
      } else clearAnalysisView('Análise cancelada antes de iniciar.');
      updateAnalysisControls(); return;
    }
    if (activeAnalysis && !analysisStopping) {
      analysisStopping = true; analysisCancellationMessage = 'Análise cancelada com segurança.';
      progressLabel.textContent = 'Cancelando análise…';
      engineStatusText.textContent = 'Aguardando o motor encerrar a busca com segurança.';
      try { engineWorker?.postMessage('stop'); } catch {}
      updateAnalysisControls();
    }
  });

  analysisModes.forEach((button) => button.addEventListener('click', () => {
    selectedDepth = Number(button.dataset.depth);
    analysisModes.forEach((mode) => {
      const selected = mode === button;
      mode.classList.toggle('selected', selected); mode.setAttribute('aria-selected', String(selected));
    });
  }));
  analysisPaneTab.addEventListener('click', () => selectAnalysisPane('stockfish'));
  guidedPaneTab.addEventListener('click', () => selectAnalysisPane('guided'));
  selectAnalysisPane('stockfish');

  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
  });
  window.addEventListener('pagehide', stopEngine);
  async function initializeMyChess() {
    if (cloudRemoteSummary) renderCloudProgress(cloudRemoteSummary);
    render();
    await importCloudLibrary();
    await renderSavedGames();
    chessComSearch.requestSubmit();
  }
  initializeMyChess();
  window.setInterval(async () => {
    try {
      const imported = await importCloudLibrary();
      if (imported) await renderSavedGames();
    } catch {}
  }, 60 * 1000);
})();
