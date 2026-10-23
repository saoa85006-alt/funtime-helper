// Выгода с ПВП: графики «Выгода» и «Потрачено на сеты» + учёт сета
(function () {
  const KEY = 'ft_income_v1';
  const blank = () => ({ profit: [], spend: [], cur: null });
  const load = () => {
    try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return blank(); }
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  let data = load();

  const RANGES = [['day', 'Сегодня'], ['week', 'Неделя'], ['wipe', 'Вайп']];
  const range = { profit: 'day', spend: 'day' };
  const ui = { mode: 'idle', confirm: false };

  const fmt = v => Math.round(v).toLocaleString('ru-RU');
  const short = v => {
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    const r = x => String(+x.toFixed(1)).replace('.', ',');
    if (a >= 1e6) return s + r(a / 1e6) + 'кк';
    if (a >= 1e3) return s + r(a / 1e3) + 'к';
    return s + Math.round(a);
  };
  const parse = str => {
    const m = String(str).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.').match(/^(\d+(?:\.\d+)?)(кк|к|k|м|m)?$/);
    if (!m) return NaN;
    const mul = { кк: 1e6, м: 1e6, m: 1e6, к: 1e3, k: 1e3 }[m[2]] || 1;
    const v = Math.round(parseFloat(m[1]) * mul);
    return v <= 1e12 ? v : NaN;        // потолок 1 трлн: выше — явная опечатка
  };

  const nice = x => { if (x <= 0) return 0; const p = Math.pow(10, Math.floor(Math.log10(x))), n = x / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
  const DAY = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  function buckets(r) {
    const now = new Date(), out = [];
    if (r === 'day') {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      for (let h = 0; h < 24; h++) out.push({ a: s + h * 36e5, b: s + (h + 1) * 36e5, label: h % 6 === 0 ? String(h).padStart(2, '0') : '' });
    } else {
      const n = r === 'week' ? 7 : 30;
      for (let i = 0; i < n; i++) {
        const a = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1) + i);
        const b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
        const dd = String(a.getDate()).padStart(2, '0') + '.' + String(a.getMonth() + 1).padStart(2, '0');
        out.push({ a: a.getTime(), b: b.getTime(), label: r === 'week' ? DAY[a.getDay()] : (i % 5 === 0 || i === n - 1 ? dd : '') });
      }
    }
    return out;
  }
  const sumIn = (list, b) => list.reduce((s, e) => (e.t >= b.a && e.t < b.b ? s + e.v : s), 0);

  const W = 320, H = 180, L = 42, R = 10, T = 12, B = 24;
  const IW = W - L - R, IH = H - T - B;

  function grid(ymin, ymax, ticks, bs) {
    const y = v => T + IH - ((v - ymin) / (ymax - ymin)) * IH;
    let g = '';
    ticks.forEach(v => {
      g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? 'zero' : 'gl'}"/>` +
           `<text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${short(v)}</text>`;
    });
    const step = IW / bs.length;
    bs.forEach((b, i) => { if (b.label) g += `<text x="${L + step * (i + .5)}" y="${H - 7}" text-anchor="middle">${b.label}</text>`; });
    return { g, y, step };
  }

  function profitChart() {
    const bs = buckets(range.profit), now = Date.now();
    const vals = bs.map(b => sumIn(data.profit, b));
    let c = 0; const cum = vals.map(v => (c += v));
    const last = bs.reduce((k, b, i) => (b.a <= now ? i : k), 0);
    const pts = cum.slice(0, last + 1);
    const total = pts.length ? pts[pts.length - 1] : 0;
    let ymin = Math.min(0, ...pts), ymax = Math.max(0, ...pts);
    if (ymax === ymin) { ymax = 1; ymin = -1; }
    ymax = nice(ymax); ymin = -nice(-ymin);
    const { g, y, step } = grid(ymin, ymax, [...new Set([ymin, 0, ymax])], bs);
    const xs = i => L + step * (i + 1);
    const line = [[L, 0], ...pts.map((v, i) => [xs(i), v])];
    const d = line.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + y(p[1]).toFixed(1)).join(' ');
    const area = d + ` L${line[line.length - 1][0].toFixed(1)} ${y(0)} L${L} ${y(0)}Z`;
    const dots = vals.map((v, i) => (v && i <= last ? `<circle cx="${xs(i)}" cy="${y(cum[i])}" r="3"/>` : '')).join('');
    const has = data.profit.some(e => bs.some(b => e.t >= b.a && e.t < b.b));
    return { total, has, svg: `<svg viewBox="0 0 ${W} ${H}" class="chart"><defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>${g}<path d="${area}" fill="url(#gp)" stroke="none"/><path d="${d}" class="ln" pathLength="1"/>${dots}</svg>` };
  }

  function spendChart() {
    const bs = buckets(range.spend);
    const vals = bs.map(b => sumIn(data.spend, b));
    const total = vals.reduce((s, v) => s + v, 0);
    const ymax = nice(Math.max(...vals, 1));
    const { g, y, step } = grid(0, ymax, [0, ymax / 2, ymax], bs);
    const bw = Math.max(2, Math.min(18, step * .6));
    const bars = vals.map((v, i) => (v ? `<rect x="${(L + step * (i + .5) - bw / 2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(v)).toFixed(1)}" rx="1.5"/>` : '')).join('');
    return { total, has: total > 0, svg: `<svg viewBox="0 0 ${W} ${H}" class="chart bars">${g}${bars}</svg>` };
  }

  const seg = kind => `<div class="seg" data-kind="${kind}">${RANGES.map(([id, t]) =>
    `<button data-range="${id}" class="${range[kind] === id ? 'on' : ''}">${t}</button>`).join('')}</div>`;

  function card(kind, title, build, signed) {
    const r = build();
    const cls = signed ? (r.total > 0 ? 'pos' : r.total < 0 ? 'neg' : '') : '';
    const sign = signed && r.total > 0 ? '+' : r.total < 0 ? '−' : '';
    return `<div class="card">
      <div class="card-head"><span>${title}</span>${seg(kind)}</div>
      <div class="big ${cls}" data-kind="${kind}" data-v="${r.total}" data-s="${signed ? 1 : 0}">${sign}${fmt(Math.abs(r.total))}</div>
      <div class="chart-wrap">${r.svg}${r.has ? '' : '<div class="empty">Пока нет записей</div>'}</div>
    </div>`;
  }

  function flow() {
    const cur = data.cur;
    const form = (label, kind) => `<div class="form"><label for="amt">${label}</label>
      <div class="inrow"><input id="amt" inputmode="decimal" autocomplete="off" placeholder="например 500к или 10кк">
      <button class="ok" data-act="ok-${kind}" aria-label="Подтвердить">✓</button></div>
      <button class="link" data-act="cancel">Отмена</button></div>`;
    if (ui.mode === 'cost') return form('Цена, потраченная на сет', 'cost');
    if (ui.mode === 'profit') return form('Выгода с выбитого сета', 'profit');
    if (!cur) return '<button class="act main" data-act="start">Собрал сет</button>';
    return `<div class="inwork">Сет в работе · потрачено <b>${fmt(cur.cost)}</b></div>
      <div class="acts">
        <button class="act" data-act="drop">Выбил сет</button>
        <button class="act" data-act="lose">Слил сет</button>
        ${cur.stage === 'choose' ? '<button class="act" data-act="sell">Продал сет</button>' : ''}
      </div>`;
  }

  function init() {
    const root = document.getElementById('income');
    const draw = () => {
      root.querySelector('#c-profit').innerHTML = card('profit', 'Выгода', profitChart, true);
      root.querySelector('#c-spend').innerHTML = card('spend', 'Потрачено на сеты', spendChart, false);
      root.querySelectorAll('.big').forEach(countUp);
    };
    const shown = {};
    const countUp = el => {
      const kind = el.dataset.kind, to = +el.dataset.v, signed = el.dataset.s === '1';
      const from = shown[kind] === undefined ? 0 : shown[kind];
      shown[kind] = to;
      if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const t0 = performance.now(), dur = 650;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const v = Math.round(from + (to - from) * e);
        el.textContent = (signed && v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v));
        if (k < 1 && el.isConnected) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const drawClear = () => {
      root.querySelector('#clear-box').innerHTML = ui.confirm
        ? '<div class="confirm"><span>Удалить все записи?</span><button class="mini danger" data-act="clear-yes">Да</button><button class="mini" data-act="clear-no">Нет</button></div>'
        : '<button class="mini" data-act="clear">Очистить</button>';
    };
    const drawFlow = () => {
      root.querySelector('#flow').innerHTML = flow();
      const i = root.querySelector('#amt'); if (i) i.focus();
    };
    const readAmount = () => {
      const i = root.querySelector('#amt'), v = parse(i.value);
      if (!(v > 0)) { i.classList.add('bad'); i.focus(); return 0; }
      return v;
    };
    const act = a => {
      const t = Date.now();
      if (a === 'clear' || a === 'clear-no') { ui.confirm = a === 'clear'; drawClear(); return; }
      if (a === 'clear-yes') { data = blank(); ui.mode = 'idle'; ui.confirm = false; save(); draw(); drawFlow(); drawClear(); return; }
      if (a === 'start') ui.mode = 'cost';
      else if (a === 'drop') ui.mode = 'profit';
      else if (a === 'cancel') ui.mode = 'idle';
      else if (a === 'ok-cost') {
        const v = readAmount(); if (!v) return;
        data.spend.push({ t, v }); data.cur = { cost: v, stage: 'choose' }; ui.mode = 'idle';
      } else if (a === 'ok-profit') {
        const v = readAmount(); if (!v) return;
        data.profit.push({ t, v }); data.cur.stage = 'dropped'; ui.mode = 'idle';
      } else if (a === 'lose') {
        data.profit.push({ t, v: -data.cur.cost }); data.cur = null;
      } else if (a === 'sell') data.cur = null;
      save(); draw(); drawFlow();
    };
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-range]');
      if (r) { range[r.closest('.seg').dataset.kind] = r.dataset.range; return draw(); }
      const b = e.target.closest('[data-act]');
      if (b) act(b.dataset.act);
    });
    root.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.id === 'amt') act(ui.mode === 'cost' ? 'ok-cost' : 'ok-profit');
      if (e.key === 'Escape' && ui.mode !== 'idle') act('cancel');
    });
    root.addEventListener('input', e => e.target.classList && e.target.classList.remove('bad'));
    ui.mode = 'idle'; ui.confirm = false;
    draw(); drawFlow(); drawClear();
  }

  window.incomeScreen = () => ({
    title: 'Выгода с ПВП', back: 'pvp', after: init,
    html: '<div id="income"><div id="c-profit"></div><div id="flow"></div><div id="c-spend"></div><div id="clear-box"></div></div>',
  });
})();
