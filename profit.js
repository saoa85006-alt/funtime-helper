// Прибыль: записи о вложениях из «Заработка на крафте»
(function () {
  const KEY = 'ft_profit_v1';
  const load = () => {
    try { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
  const fmt = v => Math.round(v).toLocaleString('ru-RU');
  const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v));
  const cls = v => (v > 0 ? 'pos' : v < 0 ? 'neg' : '');

  // запись из калькулятора крафта: { name, made, cost, sale, profit }
  window.profitAdd = e => {
    const list = load();
    list.push(Object.assign({ t: Date.now() }, e));
    save(list);
    return list.length;
  };

  const when = t => new Date(t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  function profitScreen() {
    let confirmClear = false;
    return {
      title: 'Прибыль', back: 'menu',
      html: '<div id="pf"></div>',
      after() {
        const box = document.getElementById('pf');
        const draw = () => {
          const list = load(), total = list.reduce((s, e) => s + e.profit, 0);
          const rows = list.slice().reverse().map(e => `
            <li class="pe">
              <div class="pn"><b>${e.name}</b><small>${when(e.t)} · ${fmt(e.made)} шт. · затраты ${fmt(e.cost)} · продажа ${fmt(e.sale)}</small></div>
              <div class="pv ${cls(e.profit)}">${sign(e.profit)}</div>
              <button class="mini" data-del="${e.t}" aria-label="Удалить запись">✕</button>
            </li>`).join('');
          box.innerHTML = `
            <div class="card">
              <div class="card-head"><span>Общая прибыль</span></div>
              <div class="big ${cls(total)}">${sign(total)}</div>
              <p class="nodata" style="margin:0 0 8px">${list.length ? `Записей: ${list.length}` : 'Пока пусто'}</p>
            </div>
            ${list.length ? `<h4>Записи</h4><ul class="plist">${rows}</ul>
              <div id="clear-box">${confirmClear
                ? '<div class="confirm"><span>Удалить все записи?</span><button class="mini danger" data-clear="yes">Да</button><button class="mini" data-clear="no">Нет</button></div>'
                : '<button class="mini" data-clear="ask">Очистить</button>'}</div>`
              : '<p class="nodata">Здесь появится прибыль, когда вы нажмёте «Вложить деньги» в разделе «Заработок на крафте».</p>'}`;
        };
        box.addEventListener('click', e => {
          const del = e.target.closest('[data-del]'), cl = e.target.closest('[data-clear]');
          if (del) { save(load().filter(x => String(x.t) !== del.dataset.del)); draw(); }
          else if (cl) {
            if (cl.dataset.clear === 'yes') save([]);
            confirmClear = cl.dataset.clear === 'ask';
            draw();
          }
        });
        draw();
      },
    };
  }
  window.profitScreen = profitScreen;
})();
