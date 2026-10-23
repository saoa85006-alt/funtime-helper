// Заработок на крафте: категории → список предметов → калькулятор (затраты, продажа, выгода)
(function () {
  const KEY = 'ft_craft_v1';
  const blank = () => ({ ing: {}, sale: {}, blocks: {}, invest: {}, xp: { price: 0, use: {}, pieces: {} } });
  const load = () => {
    try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return blank(); }
  };
  let store = load();
  store.xp = Object.assign({ price: 0, use: {}, pieces: {} }, store.xp || {});
  Object.keys(store.ing).forEach(k => { if (typeof store.ing[k] === 'number') store.ing[k] = { p: store.ing[k], n: 1 }; });
  Object.keys(store.sale).forEach(k => { if (typeof store.sale[k] === 'number') store.sale[k] = { u: store.sale[k], n: 1 }; });
  const sal = id => { const s = store.sale[id] || (store.sale[id] = { u: 0, n: 1 }); s.n = 1; return s; };
  // запись цены расходника: p — цена за пачку из n штук; sh — покупка шалкерами (n = 27 стаков)
  const rec = g => store.ing[g] || (store.ing[g] = { p: 0, n: 1, sh: 0 });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

  // сколько штук в стаке: большинство по 64, снежок по 16, ведро молока по 1
  const STACK = { milk: 1, snowball: 16 };
  const stackOf = g => STACK[g] || STACK_ONLY[g] || 64;
  const packsFor = g => (stackOf(g) === 1 ? [1] : stackOf(g) === 16 ? [1, 16] : [1, 16, 64]);
  // эти расходники можно покупать шалкерами (27 стаков)
  const SHULK = ['gunp', 'magma', 'cane', 'rod', 'obsidian', 'snowball', 'diamond', 'dblock', 'xp'];
  // названия расходников, которых нет в рецептах верстака
  const EXTRA = { cane: 'Сахарный тростник', rod: 'Стержень ифрита', dblock: 'Алмазный блок', log: 'Бревно', xp: 'Опыт 15 уровня' };
  const nameOf = g => EXTRA[g] || window.INGS[g][0];
  // что покупаем вместо рецептного ингредиента и перекрафтим: [чем заменяем, сколько штук на 1 нужную, подпись]
  const SWAP = {
    dust: { sugar: ['cane', 1, 'перекрафт: 1 тростник = 1 сахар'] },
    emsword: { stick: ['log', 0.125, 'палки из бревна: 1 бревно = 8 палок'] },
    empick: { stick: ['log', 0.125, 'палки из бревна: 1 бревно = 8 палок'] },
    emaxe: { stick: ['log', 0.125, 'палки из бревна: 1 бревно = 8 палок'] },
    fireball: { blaze: ['rod', 0.5, 'перекрафт: 1 стержень ифрита = 2 огненных порошка'] },
  };

  // цена изумруда на сервере не меняется; палка — необязательная строка (пусто = 0)
  const FIXED = { emerald: { unit: 5000, stack: 320000 } };
  const OPTIONAL = {};
  const STACK_ONLY = { log: 64 };          // покупка только стаками, без выбора «беру за раз»
  const E = 'emerald', S = 'stick';
  const TOOLS = [
    { id: 'emsword', name: 'Изумрудный меч', img: 'emerald_sword', craft: { grid: [null, E, null, null, E, null, null, S, null], count: 1 } },
    { id: 'empick', name: 'Изумрудная кирка', img: 'emerald_pickaxe', craft: { grid: [E, E, E, null, S, null, null, S, null], count: 1 } },
    { id: 'emaxe', name: 'Изумрудный топор', img: 'emerald_axe', craft: { grid: [E, E, null, E, S, null, null, S, null], count: 1 } },
  ];

  const PIECES = 4;     // изумрудных предметов на 1 вещь с Защитой V (крафтятся уже с Защитой III)
  const XP_LEVELS = 9;  // уровней опыта на 1 вещь: З3+З3 (×2) и З4+З4, каждое скрещивание 3 уровня
  const XP_BOTTLE = 15; // один пузырёк даёт 15 уровней
  const XP_USE = XP_LEVELS / XP_BOTTLE;   // пузырьков на 1 вещь = 0,6
  const ARMOR = [
    { id: 'emhelm', name: 'Изумрудный шлем', img: 'emerald_helmet', armor: true, craft: { grid: [E, E, E, E, null, E, null, null, null], count: 1 } },
    { id: 'emchest', name: 'Изумрудный нагрудник', img: 'emerald_chestplate', armor: true, craft: { grid: [E, null, E, E, E, E, E, E, E], count: 1 } },
    { id: 'emlegs', name: 'Изумрудные поножи', img: 'emerald_leggings', armor: true, craft: { grid: [E, E, E, E, null, E, E, null, E], count: 1 } },
    { id: 'emboots', name: 'Изумрудные ботинки', img: 'emerald_boots', armor: true, craft: { grid: [null, null, null, E, null, E, E, null, E], count: 1 } },
  ];

  const fmt = v => Math.round(v).toLocaleString('ru-RU');
  const fmt2 = v => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  // «500к», «10кк», «1,5кк», «350000»; пустое или неверное значение даёт null
  const parse = str => {
    const m = String(str).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.').match(/^(\d+(?:\.\d+)?)(кк|к|k|м|m)?$/);
    if (!m) return null;
    const mul = { кк: 1e6, м: 1e6, m: 1e6, к: 1e3, k: 1e3 }[m[2]] || 1;
    const v = Math.round(parseFloat(m[1]) * mul);
    return v <= 1e12 ? v : null;
  };
  const show = v => (v ? String(v) : '');

  const items = () => window.ITEMS.filter(i => i.group === 'spec' && i.craft);
  const findItem = id => items().find(i => i.id === id) || TOOLS.find(i => i.id === id) || ARMOR.find(i => i.id === id);
  const isTool = id => TOOLS.some(i => i.id === id);
  const isArmor = id => ARMOR.some(i => i.id === id);
  const backFor = id => (isArmor(id) ? 'craft-armor' : isTool(id) ? 'craft-tools' : 'craft-special');
  // число из поля (можно с запятой), для «штук» без округления до целых
  const num = s => { const v = Number(String(s).trim().replace(/\s+/g, '').replace(',', '.')); return Number.isFinite(v) && v >= 0 && v <= 1e6 ? v : null; };

  // ---------- категории ----------
  const CATS = [
    ['special', 'Спец предметы', 'items/trap.png', 'art'],
    ['armor', 'Броня', 'items/emerald_chestplate.png', 'px'],
    ['tools', 'Инструменты', 'items/emerald_pickaxe.png', 'px'],
  ];
  function craftHome() {
    return {
      title: 'Заработок на крафте', back: 'pve',
      html: `<div class="buttons">${CATS.map(([id, t, img, cls]) => `
        <button class="tile" data-go="craft-${id}">
          <span class="ico"><img class="${cls}" src="img/${img}" alt=""></span>
          <span class="label">${t}</span><i class="arr">→</i>
        </button>`).join('')}</div>`,
    };
  }

  // ---------- список предметов ----------
  function craftList() {
    return {
      title: 'Спец предметы', back: 'pve-craft',
      html: `<p class="tab-title">Выберите предмет, чтобы посчитать выгоду от крафта.</p>
        <div class="items">${items().map(i => `
          <button class="item" data-go="craftitem:${i.id}">
            <span class="ico">${window.itemPic(i)}</span><span class="nm">${i.name}</span>
          </button>`).join('')}</div>`,
    };
  }

  function craftTools() {
    return {
      title: 'Инструменты', back: 'pve-craft',
      html: `<p class="tab-title">Выберите предмет, чтобы посчитать выгоду от крафта.</p>
        <div class="items">${TOOLS.map(i => `
          <button class="item" data-go="craftitem:${i.id}">
            <span class="ico"><img class="px" src="img/items/${i.img}.png" alt=""></span><span class="nm">${i.name}</span>
          </button>`).join('')}</div>`,
    };
  }

  function craftArmor() {
    return {
      title: 'Броня', back: 'pve-craft',
      html: `<p class="tab-title">Выберите предмет, чтобы посчитать выгоду: крафт, опыт для наковальни и продажа.</p>
        <div class="items">${ARMOR.map(i => `
          <button class="item" data-go="craftitem:${i.id}">
            <span class="ico"><img class="px" src="img/items/${i.img}.png" alt=""></span><span class="nm">${i.name}</span>
          </button>`).join('')}</div>`,
    };
  }

  // ---------- калькулятор ----------
  function craftCalc(id) {
    const it = findItem(id);
    const armor = !!it.armor;
    const out = armor ? 1 : (it.craft.count || 1);   // у брони «один крафт» = одна готовая вещь
    const need = {};
    it.craft.grid.forEach(g => { if (g) need[g] = (need[g] || 0) + 1; });

    // что реально покупаем: тростник вместо сахара, стержни вместо порошка, алмазные блоки вместо алмазов
    const baseLines = () => Object.entries(need).map(([g, n]) => {
      let gid = g, amount = n, note = '';
      const sw = (SWAP[id] || {})[g];
      if (sw) { gid = sw[0]; amount = n * sw[1]; note = sw[2]; }
      if (gid === 'diamond' && store.blocks.diamond) { gid = 'dblock'; amount = amount / 9; note = '1 алмазный блок = 9 алмазов'; }
      return { g: gid, amount, note };
    });

    const buyLines = () => {
      const lines = baseLines();
      if (armor) {
        lines.forEach(l => { l.amount *= PIECES; l.note = l.note || ''; });
        lines.push({ g: 'xp', amount: XP_USE, note: `${XP_LEVELS} уровней на 1 вещь = ${fmt2(XP_USE)} пузырька` });
      }
      return lines;
    };

    const rowInner = L => {
      if (FIXED[L.g]) {
        const f = FIXED[L.g];
        return `
        <img class="px" src="img/ing/${L.g}.png" alt="">
        <div class="nm">${nameOf(L.g)}<small>цена на сервере не меняется</small></div>
        <div class="fixed"><b>${fmt(f.unit)}</b> за 1 шт.<br>${fmt(f.stack)} за стак</div>
        <div class="psub" data-sub="${L.g}"></div>`;
      }
      const r = rec(L.g), packs = STACK_ONLY[L.g] ? [] : packsFor(L.g);
      if (STACK_ONLY[L.g]) { r.n = STACK_ONLY[L.g]; r.sh = 0; }
      const canSh = SHULK.includes(L.g), isDia = L.g === 'diamond' || L.g === 'dblock';
      const size = stackOf(L.g) * 27;
      if (r.sh && !canSh) r.sh = 0;
      if (r.sh) r.n = size; else if (packs.length && !packs.includes(r.n)) r.n = 1;
      const nm = nameOf(L.g);
      const ph = r.sh ? 'цена за шалкер' : STACK_ONLY[L.g] ? 'цена за стак' : 'цена за ' + r.n;
      const line1 = r.sh
        ? `<span>Шалкер: 27 стаков × ${stackOf(L.g)} = ${fmt(size)} шт.</span>`
        : (packs.length > 1
          ? `<span>Беру за раз:</span>${packs.map(k => `<button class="pk${k === r.n ? ' on' : ''}" data-pack="${L.g}" data-n="${k}">${k}</button>`).join('')}`
          : '');
      const line2 = (canSh || isDia)
        ? `<span>Покупать:</span>${canSh ? `<button class="pk txt${r.sh ? ' on' : ''}" data-shulk="${L.g}" title="Покупать шалкерами: сразу 27 стаков">Шалкерами</button>` : ''}${isDia ? `<button class="pk txt${store.blocks.diamond ? ' on' : ''}" data-blocks="1" title="Покупать алмазными блоками: 1 блок = 9 алмазов">Блоками</button>` : ''}`
        : '';
      return `
        <img class="px" src="img/ing/${L.g}.png" alt="">
        <div class="nm">${nm}${L.note ? `<small>${L.note}</small>` : ''}</div>
        <input class="cin" data-ing="${L.g}" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${show(r.p)}" aria-label="Цена: ${nm}">
        ${line1 ? `<div class="pack" role="group" aria-label="Сколько покупать за раз">${line1}</div>` : ''}
        ${line2 ? `<div class="pack" role="group" aria-label="Способ покупки">${line2}</div>` : ''}
        <div class="psub" data-sub="${L.g}"></div>`;
    };
    const pricesHtml = () => buyLines().map(L => `<div class="pr" data-row="${L.g}">${rowInner(L)}</div>`).join('');

    return {
      title: it.name, back: backFor(id),
      html: `
        <div class="item-head"><span class="ico big">${(it.group ? window.itemPic(it) : `<img class="px" src="img/items/${it.img}.png" alt="">`)}</span>
          <div class="chips"><span class="chip">${armor ? 'Крафт + опыт + наковальня' : 'Крафт'}</span>${out > 1 ? `<span class="chip">за крафт ×${out}</span>` : ''}</div></div>
        ${armor ? `<h4>Как заработать</h4>
        <ol class="steps">
          <li><span>Скрафтить 4 изумрудных предмета: они крафтятся сразу с зачарованием Защита III (рецепт ниже).</span></li>
          <li><span>Купить опыт 15 уровня: он сразу даёт 15 уровней. На одну вещь уходит 9 уровней.</span></li>
          <li><span>На наковальне: Защита III + Защита III (два раза), потом Защита IV + Защита IV = Защита V. Каждое скрещивание стоит 3 уровня.</span></li>
          <li><span>Продать готовую вещь.</span></li>
        </ol>` : ''}
        ${window.benchHtml(it)}

        <h4>Цены расходников</h4>
        <p class="nodata" style="margin:0 0 8px">Впишите цену за выбранное количество («Беру за раз»), а где есть кнопка «Шалкерами», то цену за шалкер (27 стаков). Можно писать 100к, 10кк. Цены запоминаются.</p>
        <div class="prices" id="prices">${pricesHtml()}</div>

        <h4>Цена продажи</h4>
        <div class="pr one">
          <div class="nm">Готовый предмет<small>цена за 1 штуку</small></div>
          <input class="cin" id="sale" inputmode="decimal" autocomplete="off" placeholder="цена продажи" value="${show(Math.round(sal(id).u))}" aria-label="Цена продажи">
        </div>

        <h4>Вложения</h4>
        <div class="pr one">
          <div class="nm">Сколько денег вложить<small>приложение посчитает, сколько это принесёт</small></div>
          <input class="cin" id="invest" inputmode="decimal" autocomplete="off" placeholder="сумма вложений" value="${show(store.invest[id])}" aria-label="Сумма вложений">
        </div>
        <button class="act main" id="invest-go" style="margin-top:12px">Вложить деньги</button>
        <p class="nodata" id="invest-msg" style="margin-top:8px"></p>
        <p class="nodata" id="qnote" style="margin-top:8px"></p>

        <h4>Итог</h4>
        <ul class="stats result">
          <li class="st neutral"><span>Можно сделать</span><b id="r-count">0 шт.</b></li>
          <li class="st neutral"><span>Затраты на крафт</span><b id="r-cost">0</b></li>
          <li class="st neutral"><span>Остаток денег</span><b id="r-left">0</b></li>
          <li class="st neutral"><span>Сумма продажи</span><b id="r-sale">0</b></li>
          <li class="st neutral big"><span>Выгода с продажи</span><b id="r-profit">0</b></li>
        </ul>
        <p class="nodata" id="rnote" style="margin-top:8px"></p>`,
      after() {
        const $ = s => document.querySelector(s);
        const box = $('#prices');
        let last = null;
        const calc = () => {
          // стоимость одного крафта
          let perCraft = 0, missing = 0, counted = 0;
          const L = buyLines();
          L.forEach(l => {
            const fx = FIXED[l.g];
            const r = fx ? null : rec(l.g);
            const unit = fx ? fx.unit : (r.p ? r.p / r.n : 0);
            if (!unit && !OPTIONAL[l.g]) missing++;
            if (!OPTIONAL[l.g] || unit) counted++;
            perCraft += unit * l.amount;
            const sub = document.querySelector(`[data-sub="${l.g}"]`);
            if (sub) {
              const calcTxt = `${fmt2(l.amount)} × ${fmt2(unit)} = ${fmt2(unit * l.amount)}`;
              sub.textContent = unit ? (r && r.n > 1 ? `1 шт. = ${fmt2(unit)}; ${calcTxt}` : calcTxt) : '';
            }
          });
          const inv = store.invest[id] || 0;
          const s = sal(id), price = s.u;      // цена за 1 штуку
          const crafts = perCraft > 0 && inv > 0 ? Math.min(1e6, Math.floor(inv / perCraft)) : 0;
          const made = crafts * out, cost = crafts * perCraft, left = inv - cost;
          const sale = made * price, profit = sale - cost;
          last = { crafts, made, cost, sale, profit };
          $('#invest-go').disabled = !crafts;
          $('#r-count').textContent = `${fmt(made)} шт.`;
          $('#r-cost').textContent = fmt(cost);
          $('#r-left').textContent = fmt(left);
          $('#r-sale').textContent = fmt(sale);
          const p = $('#r-profit');
          p.textContent = (profit > 0 ? '+' : profit < 0 ? '−' : '') + fmt(Math.abs(profit));
          p.parentElement.className = 'st big ' + (profit > 0 ? 'buff' : profit < 0 ? 'nerf' : 'neutral');
          const one = armor ? 'Одна готовая вещь' : 'Один крафт';
          $('#qnote').textContent = made ? `${armor ? 'Вещей' : 'Крафтов'}: ${fmt(crafts)}, ${one.toLowerCase()} стоит ${fmt2(perCraft)}.` : (perCraft > 0 ? `${one} стоит ${fmt2(perCraft)}.` : '');
          $('#rnote').textContent = missing
            ? `Не указаны цены расходников (${missing} из ${counted}), затраты посчитаны не полностью.`
            : !inv ? 'Впишите сумму вложений.'
            : !crafts ? `Этой суммы не хватает на один крафт (нужно ${fmt2(perCraft)}).`
            : !price ? 'Укажите цену продажи, чтобы увидеть выгоду.' : '';
        };
        const renderRow = g => {
          const l = buyLines().find(x => x.g === g), row = box.querySelector(`[data-row="${g}"]`);
          if (l && row) row.innerHTML = rowInner(l);
        };
        const renderAll = () => { box.innerHTML = pricesHtml(); };

        // цены расходников (делегирование: строки перерисовываются при смене режима)
        box.addEventListener('input', e => {
          const el = e.target.closest('[data-ing]');
          if (!el) return;
          const raw = el.value.trim(), v = raw === '' ? 0 : parse(raw);
          el.classList.toggle('bad', v === null);
          if (v === null) return;
          rec(el.dataset.ing).p = v;
          save(); calc();
        });
        box.addEventListener('click', e => {
          const pk = e.target.closest('[data-pack]'), sh = e.target.closest('[data-shulk]'), bl = e.target.closest('[data-blocks]');
          if (pk) {                                   // «беру за раз»: цена за 1 штуку остаётся прежней
            const g = pk.dataset.pack, r = rec(g), n = Number(pk.dataset.n);
            if (r.n === n) return;
            if (r.p) r.p = Math.round(r.p / r.n * n);
            r.n = n;
            renderRow(g);
          } else if (sh) {                            // покупка шалкерами / обычная
            const g = sh.dataset.shulk, r = rec(g), unit = r.p ? r.p / r.n : 0;
            if (r.sh) { r.sh = 0; r.n = 1; r.p = Math.round(unit); }
            else { r.sh = 1; r.n = stackOf(g) * 27; r.p = Math.round(unit * r.n); }
            renderRow(g);
          } else if (bl) {                            // алмазы ↔ алмазные блоки (1 блок = 9 алмазов)
            const on = !store.blocks.diamond;
            const from = rec(on ? 'diamond' : 'dblock'), to = rec(on ? 'dblock' : 'diamond');
            if (!to.p && from.p) {
              const unit = from.p / from.n;
              to.sh = 0; to.n = 1; to.p = Math.round(on ? unit * 9 : unit / 9);
            }
            store.blocks.diamond = on;
            renderAll();
          } else return;
          save(); calc();
        });

        // цена продажи и «по сколько предметов продавать»
        $('#sale').addEventListener('input', () => {
          const el = $('#sale'), raw = el.value.trim(), v = raw === '' ? 0 : parse(raw);
          el.classList.toggle('bad', v === null);
          if (v === null) return;
          sal(id).u = v;
          save(); calc();
        });
        $('#invest-go').addEventListener('click', () => {
          if (!last || !last.crafts) return;
          window.profitAdd({ name: it.name, made: last.made, cost: last.cost, sale: last.sale, profit: last.profit });
          const m = $('#invest-msg');
          m.textContent = `Записано в «Прибыль»: ${last.profit > 0 ? '+' : last.profit < 0 ? '−' : ''}${fmt(Math.abs(last.profit))}`;
          m.style.color = 'var(--green)';
        });
        $('#invest').addEventListener('input', () => {
          $('#invest-msg').textContent = '';
          const el = $('#invest'), raw = el.value.trim(), v = raw === '' ? 0 : parse(raw);
          el.classList.toggle('bad', v === null);
          if (v === null) return;
          store.invest[id] = v;
          save(); calc();
        });
        calc();
      },
    };
  }

  window.craftHome = craftHome;
  window.craftList = craftList;
  window.craftTools = craftTools;
  window.craftArmor = craftArmor;
  window.craftCalc = craftCalc;
})();
