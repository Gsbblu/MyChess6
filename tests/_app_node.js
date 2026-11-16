// Harness de testes em Node: carrega index.html, coach.js e app.js num DOM mínimo e com um
// Stockfish falso e determinístico, sem navegador e sem dependências externas.
// Não faz parte do site publicado. Uso: const { carregarApp } = require('./_app_node');
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VOID = new Set(['meta', 'link', 'input', 'br', 'img', 'hr']);

class Texto {
  constructor(data) { this.nodeType = 3; this.data = data; this.parentNode = null; }
  get textContent() { return this.data; }
  set textContent(valor) { this.data = String(valor); }
}

function casaSeletor(el, simples) {
  const m = simples.match(/^([a-z0-9-]*)((?:[#.][\w-]+|\[[^\]]+\]|:checked)*)$/i);
  if (!m) return false;
  if (m[1] && el.tagName.toLowerCase() !== m[1].toLowerCase()) return false;
  for (const parte of m[2].match(/[#.][\w-]+|\[[^\]]+\]|:checked/g) || []) {
    if (parte === ':checked') { if (!el.checked) return false; }
    else if (parte[0] === '#') { if (el.id !== parte.slice(1)) return false; }
    else if (parte[0] === '.') { if (!el.classList.contains(parte.slice(1))) return false; }
    else {
      const a = parte.slice(1, -1).match(/^([\w-]+)(?:=["']?([^"']*)["']?)?$/);
      if (!a) return false;
      const valor = a[1].startsWith('data-') ? el.dataset[a[1].slice(5)] : el.getAttribute(a[1]);
      if (valor === null || valor === undefined) return false;
      if (a[2] !== undefined && String(valor) !== a[2]) return false;
    }
  }
  return true;
}

class Elemento {
  constructor(tag, doc) {
    this.nodeType = 1; this.tagName = tag.toUpperCase(); this.ownerDocument = doc;
    this.attrs = {}; this.children = []; this.parentNode = null; this.listeners = {};
    this.dataset = {}; this.style = { setProperty() {} };
    this.hidden = false; this.disabled = false; this.tabIndex = -1; this.value = ''; this.returnValue = ''; this.checked = false; this.open = false;
    const el = this, classes = new Set();
    this._classes = classes;
    this.classList = {
      add: (...n) => n.forEach((x) => classes.add(x)), remove: (...n) => n.forEach((x) => classes.delete(x)),
      contains: (n) => classes.has(n),
      toggle: (n, f) => { const on = f === undefined ? !classes.has(n) : Boolean(f); on ? classes.add(n) : classes.delete(n); return on; },
    };
    Object.defineProperty(this, 'className', { get: () => [...classes].join(' '), set: (v) => { classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach((c) => classes.add(c)); } });
    Object.defineProperty(this, 'id', { get: () => el.attrs.id || '', set: (v) => { el.attrs.id = String(v); } });
  }
  get childNodes() { return this.children; }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  get textContent() { return this.children.map((c) => c.textContent).join(''); }
  set textContent(v) { this.children = []; if (String(v) !== '') this.appendChild(new Texto(String(v))); }
  get innerHTML() { return this.children.map((c) => (c.nodeType === 3 ? c.data : `<${c.tagName.toLowerCase()}>${c.innerHTML}</${c.tagName.toLowerCase()}>`)).join(''); }
  set innerHTML(html) { this.children = []; for (const n of analisarHtml(String(html), this.ownerDocument)) this.appendChild(n); }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === this.ownerDocument.documentElement; }
  setAttribute(n, v) {
    this.attrs[n] = String(v);
    if (n === 'class') this.className = v;
    else if (n.startsWith('data-')) this.dataset[n.slice(5)] = String(v);
    else if (n === 'hidden') this.hidden = true;
    else if (n === 'value') this.value = String(v);
    else if (n === 'checked') this.checked = true;
    else if (n === 'tabindex') this.tabIndex = Number(v);
  }
  getAttribute(n) { if (n === 'class') return this.className || null; return n in this.attrs ? this.attrs[n] : null; }
  hasAttribute(n) { return n in this.attrs; }
  removeAttribute(n) { delete this.attrs[n]; }
  appendChild(n) { if (n.parentNode) n.parentNode.children = n.parentNode.children.filter((c) => c !== n); n.parentNode = this; this.children.push(n); return n; }
  append(...nos) { for (const n of nos) this.appendChild(typeof n === 'string' ? new Texto(n) : n); }
  prepend(...nos) { for (const n of nos.reverse()) { const t = typeof n === 'string' ? new Texto(n) : n; t.parentNode = this; this.children.unshift(t); } }
  replaceChildren(...nos) { this.children.forEach((c) => { c.parentNode = null; }); this.children = []; this.append(...nos); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((c) => c !== this); this.parentNode = null; }
  contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  addEventListener(t, f, opcoes) {
    const ouvinte = opcoes && opcoes.once ? (...a) => { this.removeEventListener(t, ouvinte); return f.apply(this, a); } : f;
    (this.listeners[t] ||= []).push(ouvinte);
  }
  removeEventListener(t, f) { this.listeners[t] = (this.listeners[t] || []).filter((x) => x !== f); }
  dispatchEvent(ev) {
    ev.target ||= this;
    for (let el = this; el && !ev.parou; el = el.parentNode || (el === this.ownerDocument.documentElement ? this.ownerDocument : null)) {
      ev.currentTarget = el;
      for (const f of [...(el.listeners?.[ev.type] || [])]) f.call(el, ev);
      if (!ev.bubbles) break;
      if (el === this.ownerDocument) break;
    }
    return !ev.defaultPrevented;
  }
  showModal() { if (this.open) throw new Error('InvalidStateError: o diálogo já está aberto'); this.open = true; }
  close(valor) { if (!this.open) return; if (valor !== undefined) this.returnValue = String(valor); this.open = false; this.dispatchEvent(this.ownerDocument.criarEvento('close', { bubbles: false })); }
  requestSubmit() { this.dispatchEvent(this.ownerDocument.criarEvento('submit')); }
  click() { if (!this.disabled) this.dispatchEvent(this.ownerDocument.criarEvento('click')); }
  focus() { if (!this.disabled) this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = this.ownerDocument.body; }
  cloneNode(profundo) {
    const copia = new Elemento(this.tagName.toLowerCase(), this.ownerDocument);
    for (const [n, v] of Object.entries(this.attrs)) copia.setAttribute(n, v);
    copia.className = this.className;
    if (profundo) for (const f of this.children) copia.appendChild(f.nodeType === 3 ? new Texto(f.data) : f.cloneNode(true));
    return copia;
  }
  animate() { return {}; }
  scrollIntoView() {}
  getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; }
  setPointerCapture() {}
  releasePointerCapture() {}
  matches(sel) { return sel.split(',').some((s) => casaSeletor(this, s.trim())); }
  closest(sel) { for (let el = this; el && el.nodeType === 1; el = el.parentNode) if (el.matches(sel)) return el; return null; }
  querySelectorAll(sel) {
    const saida = [];
    const grupos = sel.split(',').map((s) => s.trim().split(/\s*>\s*|\s+/).filter(Boolean));
    const visita = (no) => {
      for (const filho of no.children) {
        if (filho.nodeType !== 1) continue;
        if (grupos.some((g) => correspondeCadeia(filho, g, this))) saida.push(filho);
        visita(filho);
      }
    };
    visita(this);
    return saida;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

function correspondeCadeia(el, cadeia, raiz) {
  if (!casaSeletor(el, cadeia[cadeia.length - 1])) return false;
  let atual = el.parentNode;
  for (let i = cadeia.length - 2; i >= 0; i -= 1) {
    while (atual && atual !== raiz && atual.nodeType === 1 && !casaSeletor(atual, cadeia[i])) atual = atual.parentNode;
    if (!atual || atual === raiz || atual.nodeType !== 1) return false;
    atual = atual.parentNode;
  }
  return true;
}

function analisarHtml(html, doc) {
  const raiz = new Elemento('div', doc), pilha = [raiz];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-z0-9-]+)\s*>|<([a-z0-9-]+)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    const topo = pilha[pilha.length - 1];
    if (m[1]) { const i = pilha.map((p) => p.tagName.toLowerCase()).lastIndexOf(m[1].toLowerCase()); if (i > 0) pilha.length = i; continue; }
    if (m[2]) {
      const tag = m[2].toLowerCase();
      if (tag === 'script' || tag === 'style') { const fim = html.indexOf(`</${tag}>`, re.lastIndex); re.lastIndex = fim < 0 ? html.length : fim + tag.length + 3; continue; }
      const el = new Elemento(tag, doc);
      for (const a of (m[3] || '').matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) el.setAttribute(a[1], a[2] ?? a[3] ?? a[4] ?? '');
      topo.appendChild(el);
      if (!VOID.has(tag) && !m[4]) pilha.push(el);
      continue;
    }
    if (m[5]) topo.appendChild(new Texto(m[5].replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')));
  }
  const filhos = raiz.children.slice(); filhos.forEach((f) => { f.parentNode = null; });
  return filhos;
}

class Documento extends Elemento {
  constructor() { super('#document', null); this.ownerDocument = this; this.activeElement = null; this.baseURI = 'http://127.0.0.1/'; }
  criarEvento(type, extra = {}) {
    const ev = { type, bubbles: true, defaultPrevented: false, parou: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.parou = true; }, ...extra };
    return ev;
  }
  createElement(tag) { return new Elemento(tag, this); }
  createElementNS(_ns, tag) { return new Elemento(tag, this); }
  createTextNode(t) { return new Texto(t); }
}

// Motor falso e determinístico: avaliação = material + ruído estável derivado do FEN.
// Responde ao protocolo UCI usado pelo aplicativo; cada "go" só termina quando o teste chama avancar().
function criarMotorFalso(api) {
  const fila = [];
  class MotorFalso {
    constructor() { this.listeners = {}; this.posicao = null; this.multipv = 1; MotorFalso.ultimo = this; }
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }
    emitir(linha) { for (const f of this.listeners.message || []) f({ data: linha }); }
    postMessage(msg) {
      const texto = String(msg);
      if (texto === 'uci') { this.emitir('id name Stockfish 19 (falso)'); this.emitir('uciok'); }
      else if (texto === 'isready') this.emitir('readyok');
      else if (texto.startsWith('position fen ')) this.posicao = texto.slice('position fen '.length);
      else if (texto.startsWith('setoption name MultiPV value ')) this.multipv = Number(texto.split(' ').pop());
      else if (texto.startsWith('go depth ')) fila.push({ motor: this, fen: this.posicao, profundidade: Number(texto.split(' ').pop()), multipv: this.multipv });
      else if (texto === 'stop') { const item = fila.shift(); if (item) this.concluir(item); }
    }
    concluir(item) {
      const r = api.avaliarFalso(item.fen, item.multipv);
      r.linhas.forEach((l, i) => this.emitir(`info depth ${item.profundidade} multipv ${i + 1} score cp ${l.cp} nps 1000 pv ${l.pv.join(' ')}`));
      this.emitir(`bestmove ${r.linhas.length ? r.linhas[0].pv[0] : '(none)'}`);
    }
  }
  return { MotorFalso, fila };
}


// IndexedDB mínimo em memória: o suficiente para a biblioteca de análises (um object store "games").
function criarIndexedDbFalso() {
  const dados = new Map();
  const pedido = (executar) => {
    const req = { result: undefined, error: null, onsuccess: null, onerror: null };
    Promise.resolve().then(() => { try { req.result = executar(); } catch (e) { req.error = e; if (req.onerror) req.onerror(); return; } if (req.onsuccess) req.onsuccess(); });
    return req;
  };
  const store = {
    getAll: () => pedido(() => [...dados.values()].map((v) => JSON.parse(JSON.stringify(v)))),
    put: (v) => pedido(() => { dados.set(v.id, JSON.parse(JSON.stringify(v))); return v.id; }),
    delete: (id) => pedido(() => { dados.delete(id); }),
  };
  const db = { createObjectStore() { return store; }, transaction: () => ({ objectStore: () => store }) };
  return {
    dados,
    open() {
      const req = { result: db, error: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      Promise.resolve().then(() => { if (req.onupgradeneeded) req.onupgradeneeded(); if (req.onsuccess) req.onsuccess(); });
      return req;
    },
  };
}

function carregarApp(raiz, opcoes = {}) {
  const base = raiz || path.join(__dirname, '..');
  const doc = new Documento();
  const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
  const arvore = analisarHtml(html, doc);
  const htmlEl = arvore.find((n) => n.tagName === 'HTML') || arvore[0];
  doc.documentElement = htmlEl; htmlEl.parentNode = doc; doc.children = [htmlEl];
  doc.body = htmlEl.querySelector('body') || htmlEl;
  for (const caixa of htmlEl.querySelectorAll('select')) { // um <select> começa com o valor da primeira opção
    const opcao = caixa.querySelector('option');
    if (opcao && !caixa.value) caixa.value = opcao.getAttribute('value') ?? opcao.textContent;
  }
  doc.activeElement = doc.body;

  const porId = (id) => { const el = doc.querySelector(`#${id}`); if (!el) throw new Error(`Elemento #${id} não encontrado`); return el; };
  let apiRegras = null;
  const falso = criarMotorFalso({ avaliarFalso: (fen, n) => apiRegras.avaliarFalso(fen, n) });

  const janela = {
    document: doc, setTimeout: (f) => 0, clearTimeout() {}, addEventListener() {}, matchMedia: () => ({ matches: false }), innerHeight: 900, location: { protocol: 'http:' },
  };
  const bancoFalso = criarIndexedDbFalso();
  // Rede indisponível por padrão (testes determinísticos); um teste pode passar opcoes.fetch para simular a API.
  const fetchFalso = opcoes.fetch || (() => Promise.reject(new TypeError('rede indisponível no teste')));
  const sandbox = {
    window: janela, indexedDB: bancoFalso, fetch: fetchFalso, Blob: class { constructor(p, o) { this.partes = p; this.tipo = o?.type; } },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, document: doc, Element: Elemento, HTMLElement: Elemento, location: janela.location, navigator: {}, console, Worker: falso.MotorFalso, URL, Intl, Map, Set, Math, Number, String, Array, Object, JSON, Promise, Error, RegExp, Date,
  };
  janela.window = janela; Object.assign(janela, { Worker: falso.MotorFalso });
  vm.createContext(sandbox);
  sandbox.self = sandbox; sandbox.globalThis = sandbox;

  const caminhoCoach = path.join(base, 'coach.js');
  if (fs.existsSync(caminhoCoach)) vm.runInContext(fs.readFileSync(caminhoCoach, 'utf8'), sandbox, { filename: 'coach.js' });
  sandbox.window.MyChessCoach = sandbox.MyChessCoach || sandbox.window.MyChessCoach;
  const caminhoInsights = path.join(base, 'insights.js');
  if (fs.existsSync(caminhoInsights)) vm.runInContext(fs.readFileSync(caminhoInsights, 'utf8'), sandbox, { filename: 'insights.js' });
  sandbox.window.MyChessInsights = sandbox.MyChessInsights || sandbox.window.MyChessInsights;

  let fonte = fs.readFileSync(path.join(base, 'app.js'), 'utf8');
  const fim = fonte.lastIndexOf('})();');
  const exportacao = `
  window.__teste = { positionFromFen, currentFen, applyMove, legalMoves, allLegalMoves, inCheck, attacked, moveToSan, parseUciMove, color, squareName,
    goTo, loadPgn, moveQuality,
    estado: () => ({ history, historyIndex, gameBatch, gameReviewResults, exerciseState, variationSession, position, pendingAnalysis, activeAnalysis, analysisCache }) };
`;
  fonte = fonte.slice(0, fim) + exportacao + fonte.slice(fim);
  vm.runInContext(fonte, sandbox, { filename: 'app.js' });
  const t = janela.__teste;
  const { allLegalMoves, applyMove, positionFromFen, currentFen, moveToSan } = t;

  const valor = { P: 100, N: 300, B: 300, R: 500, Q: 900, K: 0 };
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const estatica = (pos) => {
    let total = 0; for (const p of pos.board) if (p !== '.') total += (p === p.toUpperCase() ? 1 : -1) * valor[p.toUpperCase()];
    return total + (hash(currentFen(pos)) % 301 - 150);
  };
  // Pontuação do lado a jogar; devolve até n linhas ordenadas (melhor primeiro), com PV de 1 lance.
  apiRegras = {
    avaliarFalso(fen, n) {
      const pos = positionFromFen(fen), lado = pos.turn === 'w' ? 1 : -1;
      const lances = allLegalMoves(pos).map((m) => ({ m, cp: lado * estatica(applyMove(pos, m)) })).sort((a, b) => b.cp - a.cp);
      return { linhas: lances.slice(0, Math.max(1, n)).map((l) => ({ cp: l.cp, pv: [`${t.squareName(l.m.from)}${t.squareName(l.m.to)}${l.m.promotion ? l.m.promotion.toLowerCase() : ''}`] })) };
    },
  };

  const evento = (type, extra) => doc.criarEvento(type, extra);
  return {
    bancoFalso,
    app: { ...t, estado: t.estado, positionFromFen, allLegalMoves, applyMove, currentFen, moveToSan },
    documento: doc, porId,
    clicar(el) { el.dispatchEvent(evento('click')); },
    tecla(el, key, opcoes = {}) { const ev = evento('keydown', { key, target: el, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...opcoes }); el.dispatchEvent(ev); return ev; },
    avancarLote(n = 1) {
      for (let i = 0; i < n && falso.fila.length; i += 1) { const item = falso.fila.shift(); item.motor.concluir(item); }
    },
    // Clica no botão de análise e confirma o diálogo de profundidade, como faria a pessoa (assíncrono).
    async analisar(id, profundidade) {
      const dialogo = porId('depth-dialog');
      doc.querySelector(`#${id}`).dispatchEvent(evento('click'));
      if (!dialogo.open) return false;
      if (profundidade) {
        for (const radio of dialogo.querySelectorAll('input[name="analysis-depth"]')) radio.checked = false; // exclusividade do grupo de rádios
        dialogo.querySelector(`input[name="analysis-depth"][value="${profundidade}"]`).checked = true;
      }
      dialogo.close('start');
      await new Promise((r) => setImmediate(r));
      return true;
    },
    MotorFalso: falso.MotorFalso,
  };
}

module.exports = { carregarApp };
