// Кастомные предметы для ПВП: список + карточка предмета с верстаком
(function () {
  const I = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const ICONS = {
    disorient: I('<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/>'),
    dust: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/><circle cx="12" cy="12" r="1.5"/>'),
    fireball: I('<circle cx="16" cy="8" r="4"/><path d="M13 11L4 20M11 8L4 9M15 12l-1 7"/>'),
    trap: I('<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M12 11v10M4 7l8 4 8-4"/>'),
    plast: I('<rect x="3" y="5" width="18" height="14"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19"/>'),
    snowball: I('<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>'),
    aura: I('<ellipse cx="12" cy="5" rx="6" ry="2"/><circle cx="12" cy="14" r="4"/><path d="M12 20v2M5 17l-1.5 1.5M19 17l1.5 1.5"/>'),
    sword: I('<path d="M20 4l-9.5 9.5"/><path d="M20 4h-4.5L20 8.5z" fill="currentColor"/><path d="M11 9l-2 2 4 4 2-2z"/><path d="M9 15l-4 4"/>'),
    crossbow: I('<path d="M3 9c5-3 13-3 18 0"/><path d="M12 6v15"/><path d="M3 9l9 7 9-7"/>'),
    elytra: I('<path d="M12 6c-3 0-8 2-9 6 2 4 5 7 9 9 4-2 7-5 9-9-1-4-6-6-9-6z"/><path d="M12 6v15"/>'),
    helmet: I('<path d="M5 15a7 7 0 0 1 14 0v5h-4v-3H9v3H5z"/>'),
    chest: I('<path d="M8 3L4 6v6l3 1v8h10v-8l3-1V6l-4-3-2 2h-4z"/>'),
    legs: I('<path d="M6 3h12v7l-2 11h-3.5L12 12l-.5 9H8L6 10z"/>'),
    boots: I('<path d="M8 3h5v9l7 3v5H5v-6z"/>'),
    mace: I('<circle cx="8" cy="8" r="3.5"/><path d="M10.5 10.5L20 20M8 2v2M2 8h2M4 4l1.4 1.4M12 4l-1.4 1.4M4 12l1.4-1.4"/>'),
    totem: I('<path d="M12 3c3 0 5 2 5 5 0 2-1 3-2 4l2 3-5 6-5-6 2-3c-1-1-2-2-2-4 0-3 2-5 5-5z"/>'),
    wind: I('<circle cx="12" cy="12" r="3"/><path d="M12 5a7 7 0 0 1 7 7M19 12a7 7 0 0 1-7 7M12 19a7 7 0 0 1-7-7"/>'),
    gapple: I('<path d="M12 7c-4-3-8 0-7 5 1 5 4 9 7 7 3 2 6-2 7-7 1-5-3-8-7-5z"/><path d="M12 7c0-2 1-4 3-4"/>'),
    egapple: I('<path d="M12 7c-4-3-8 0-7 5 1 5 4 9 7 7 3 2 6-2 7-7 1-5-3-8-7-5z"/><path d="M12 7c0-2 1-4 3-4"/><path d="M19 2v3M17.5 3.5h3"/>'),
    sphere: I('<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3"/><path d="M7.5 8.5a6 6 0 0 1 3-2.2"/>'),
    talisman: I('<path d="M8 3l4 5 4-5"/><path d="M12 8l5 5-5 8-5-8z"/><path d="M7 13h10"/>'),
  };

  // ингредиенты верстака: русское название, цвет, значок
  const ING = {
    gblock:   ['Золотой блок', '#ffd60a', '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M12 11v10M4 7l8 4 8-4"/>'],
    puffer:   ['Иглобрюх', '#f4a742', '<circle cx="12" cy="12" r="6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>'],
    magma:    ['Сгусток магмы', '#ff7a1a', '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>'],
    gunp:     ['Порох', '#a8a8a8', '<path d="M4 18c1-6 4-9 8-9s7 3 8 9z"/><path d="M9 14h.01M13 13h.01M15 16h.01M11 16h.01"/>'],
    eye:      ['Око Эндера', '#3ddc84', '<ellipse cx="12" cy="12" rx="9" ry="5.5"/><circle cx="12" cy="12" r="2.6"/>'],
    sugar:    ['Сахар', '#ffffff', '<path d="M4 18c1-6 4-9 8-9s7 3 8 9z"/><path d="M9 14h.01M13 13h.01M15 16h.01M11 16h.01"/>'],
    blaze:    ['Огненный порошок', '#ffb020', '<path d="M12 3c1 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/>'],
    diamond:  ['Алмаз', '#4de0e0', '<path d="M6 4h12l4 6-10 11L2 10z"/><path d="M2 10h20M9 4l-2 6 5 11M15 4l2 6-5 11"/>'],
    milk:     ['Ведро молока', '#ffffff', '<path d="M5 8h14l-2 12H7z"/><path d="M5 8c0-2 3-3 7-3s7 1 7 3"/>'],
    ningot:   ['Незеритовый слиток', '#b39a8f', '<path d="M4 15l3-7h13l-3 7z"/><path d="M4 15v3h13v-3M17 15v3l3-7"/>'],
    obsidian: ['Обсидиан', '#9b6bff', '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M12 11v10M4 7l8 4 8-4"/>'],
    breeze:   ['Вихревой стержень', '#8ecbff', '<path d="M6 20L18 4"/><path d="M8 14c3 0 5-2 6-5M12 9c3 0 5-2 6-4"/>'],
    snowball: ['Снежок', '#dff3ff', '<circle cx="12" cy="12" r="8"/><path d="M8 9a5 5 0 0 1 4-3"/>'],
    nstar:    ['Звезда Незера', '#fff3a0', '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'],
    gingot:   ['Золотой слиток', '#ffd60a', '<path d="M4 15l3-7h13l-3 7z"/><path d="M4 15v3h13v-3M17 15v3l3-7"/>'],
    log:      ['Бревно', '#a0673a', '<rect x="5" y="5" width="14" height="14"/>'],
    emerald:  ['Изумруд', '#3ddc6a', '<path d="M12 3l6 5-2 10H8L6 8z"/>'],
    stick:    ['Палка', '#a0673a', '<path d="M6 20L18 4"/>'],
    apple:    ['Яблоко', '#ff4d4d', '<path d="M12 7c-4-3-8 0-7 5 1 5 4 9 7 7 3 2 6-2 7-7 1-5-3-8-7-5z"/><path d="M12 7c0-2 1-4 3-4"/>'],
  };
  const ingSvg = id => `<img class="px" src="img/ing/${id}.png" alt="${ING[id][0]}">`;
  const pic = it => (it.img ? `<img class="${it.art ? 'art' : 'px'}" src="img/items/${it.img}.png" alt="">` : ICONS[it.icon]);

  const TABS = [['spec', 'Спец.'], ['sphere', 'Сферы'], ['talisman', 'Талисманы'], ['misc', 'Прочее']];
  const TAB_TITLE = { spec: 'Специальные предметы', sphere: 'Сферы', talisman: 'Талисманы', misc: 'Булава, Крушитель и ванильные предметы' };
  let tab = 'spec';

  const fmt = v => String(v).replace('.', ',');
  const stat = ([name, v, unit, dir]) => {
    const sign = v > 0 ? '+' : v < 0 ? '−' : '';
    const val = sign + fmt(Math.abs(v)) + (unit === 'percent' ? '%' : '');
    return `<li class="st ${dir}"><span>${name}</span><b>${val}</b></li>`;
  };
  const rows = (a, cls = 'neutral') => `<ul class="stats">${a.map(([k, v, d]) => `<li class="st ${d || cls}"><span>${k}</span><b>${v}</b></li>`).join('')}</ul>`;
  const list = a => `<ul class="bul">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
  const sec = (h, body) => `<h4>${h}</h4>${body}`;

  function bench(it) {
    const c = it.craft, need = {};
    c.grid.forEach(g => { if (g) need[g] = (need[g] || 0) + 1; });
    const cells = c.grid.map(g => `<i class="slot" ${g ? `title="${ING[g][0]}"` : ''}>${g ? ingSvg(g) : ''}</i>`).join('');
    const legend = Object.entries(need).map(([g, n]) => `<li>${ingSvg(g)}<span>${ING[g][0]}</span><b>×${n}</b></li>`).join('');
    return `<div class="bench">
      <div class="bench-head"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></svg><span>Верстак</span></div>
      <div class="bench-body">
        <div class="grid3">${cells}</div>
        <span class="arrow" aria-hidden="true"></span>
        <div class="res">${pic(it)}${c.count > 1 ? `<em>${c.count}</em>` : ''}</div>
      </div>
      <ul class="need">${legend}</ul>
      <p class="bench-note">Рецепт из игрового меню <b>/crafts</b>.</p>
    </div>`;
  }

  function listScreen() {
    const items = window.ITEMS.filter(i => i.group === tab);
    let prev = null, body = '';
    items.forEach(i => {
      if (tab === 'misc' && i.sub !== prev) { body += (prev === null ? `</div><p class="subhead first">${i.sub}</p><div class="items">` : `</div><p class="subhead">${i.sub}</p><div class="items">`); prev = i.sub; }
      body += `<button class="item" data-go="item:${i.id}"><span class="ico">${pic(i)}</span><span class="nm">${i.name.replace(/^(Сфера|Талисман) /, '<small>$1</small>')}</span></button>`;
    });
    return {
      title: 'Кастомные предметы', back: 'pvp',
      html: `<div class="seg tabs">${TABS.map(([id, t]) => `<button data-tab="${id}" class="${id === tab ? 'on' : ''}">${t}</button>`).join('')}</div>
        <p class="tab-title">${TAB_TITLE[tab]}</p><div class="items">${body}</div>`,
      after() {
        document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; window.go('pvp-custom'); }));
      },
    };
  }

  function itemScreen(id) {
    const it = window.ITEMS.find(i => i.id === id);
    tab = it.group;
    let h = `<div class="item-head"><span class="ico big">${pic(it)}</span>
      <div class="chips">${it.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div></div>
      <p class="item-desc">${it.desc}</p>`;
    if (it.craft) h += bench(it);

    if (it.group === 'sphere' || it.group === 'talisman') {
      h += `<p class="hold">${it.hold}</p>`;
      h += sec('Параметры', `<ul class="stats">${it.stats.map(stat).join('')}</ul>`);
      h += sec('Как получить', list(it.how));
    } else if (it.ench) {                       // снаряжение Крушителя
      h += sec('Основа', rows([['Предмет', it.base]].concat(it.upgrade.length ? [['Улучшение', it.upgrade.join(', ')]] : [])));
      h += sec('Зачарования', list(it.ench));
      it.attrs.forEach(([title, a]) => { h += sec(title, rows(a)); });
      if (it.cd) h += sec('Задержка', rows(it.cd));
      if (it.extra.length) h += sec('Ещё', list(it.extra));
    } else {
      if (it.info && it.info.length) h += sec('Применение', rows(it.info));
      if (it.effects) h += sec(it.effects.title, rows(it.effects.rows.map(([k, v]) => [k, v || '✓'])));
      if (it.note) h += `<p class="nodata">${it.note}</p>`;
      if (it.dur && it.dur.length) h += sec('Длительность', rows(it.dur));
      if (!it.nocd) h += sec('Задержка', it.cd ? rows(it.cd) : '<p class="nodata">Нет данных: в игровом описании и на вики она не указана.</p>');
      if (it.extra.length) h += sec('Ещё', list(it.extra));
    }
    return { title: it.name, back: 'pvp-custom', html: h };
  }

  window.benchHtml = bench;
  window.INGS = ING;
  window.itemPic = pic;
  window.customScreen = listScreen;
  window.itemScreen = itemScreen;
})();
