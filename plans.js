// Планы: список дел на будущее (хранится на устройстве)
(function () {
  const KEY = 'ft_plans_v1';
  const load = () => {
    try { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d : []; }
    catch (e) { return []; }
  };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function plansScreen() {
    let confirmClear = false;
    return {
      title: 'Планы', back: 'menu',
      html: `
        <div class="pr one planadd">
          <input class="cin plantext" id="plan-text" type="text" maxlength="300" autocomplete="off" placeholder="Что планируете?" aria-label="Новый план">
          <button class="ok" id="plan-add" aria-label="Добавить план">+</button>
        </div>
        <div id="plan-list"></div>`,
      after() {
        const input = document.getElementById('plan-text'), box = document.getElementById('plan-list');
        const draw = () => {
          const list = load();
          const todo = list.filter(p => !p.done), done = list.filter(p => p.done);
          const row = p => `
            <li class="plan${p.done ? ' done' : ''}">
              <button class="chk" data-toggle="${p.id}" aria-label="${p.done ? 'Вернуть в планы' : 'Отметить выполненным'}">${p.done ? '✓' : ''}</button>
              <span class="pt">${esc(p.text)}</span>
              <button class="mini" data-del="${p.id}" aria-label="Удалить план">✕</button>
            </li>`;
          box.innerHTML = list.length ? `
            ${todo.length ? `<h4>В планах · ${todo.length}</h4><ul class="plans">${todo.map(row).join('')}</ul>` : ''}
            ${done.length ? `<h4>Выполнено · ${done.length}</h4><ul class="plans">${done.map(row).join('')}</ul>
              <div id="clear-box">${confirmClear
                ? '<div class="confirm"><span>Убрать выполненные?</span><button class="mini danger" data-clear="yes">Да</button><button class="mini" data-clear="no">Нет</button></div>'
                : '<button class="mini" data-clear="ask">Убрать выполненные</button>'}</div>` : ''}`
            : '<p class="nodata" style="margin-top:14px">Пока пусто. Впишите план и нажмите «+» или Enter.</p>';
        };
        const add = () => {
          const text = input.value.trim();
          if (!text) { input.focus(); return; }
          const list = load();
          list.push({ id: Date.now() + '' + Math.floor(Math.random() * 1000), text, done: false });
          save(list);
          input.value = '';
          draw();
          input.focus();
        };
        document.getElementById('plan-add').addEventListener('click', add);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
        box.addEventListener('click', e => {
          const t = e.target.closest('[data-toggle]'), d = e.target.closest('[data-del]'), c = e.target.closest('[data-clear]');
          if (t) { save(load().map(p => (p.id === t.dataset.toggle ? Object.assign(p, { done: !p.done }) : p))); }
          else if (d) { save(load().filter(p => p.id !== d.dataset.del)); }
          else if (c) {
            if (c.dataset.clear === 'yes') save(load().filter(p => !p.done));
            confirmClear = c.dataset.clear === 'ask';
          } else return;
          draw();
        });
        draw();
      },
    };
  }
  window.plansScreen = plansScreen;
})();
