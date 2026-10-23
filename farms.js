// Фермы без СП: список + карточка фермы (фото по шагам, схема, материалы)
(function () {
  const FARMS = [
    {
      id: 'golem',
      name: 'Ферма железных големов',
      icon: 'iron_ingot',
      size: '16×16×8',
      lead: 'Камера 16×16 высотой 8 блоков в одном чанке. В четырёх углах на высоте 3-го блока стоят ячейки с жителями и зомби. В центре воронки с сундуками, рядом колонна с «Дамагером» и «Прогрузчиком». Воду льют по углам и по краям камеры.',
      steps: [
        { t: 'Выкопайте территорию 16×16 с высотой 8 блоков.', img: 1 },
        { t: 'В каждом углу, на высоте 3-го блока, постройте такую конструкцию: ячейка с кроватью, спереди бочки и вокруг ограда.', img: 2 },
        { t: 'Призовите по 3 жителя в каждой ячейке.', img: 3 },
        { t: 'Напротив жителей призовите зомби и дайте ему имя биркой.', img: 4 },
        { t: 'Должно получиться вот так.', img: 5 },
        { t: 'В центре фермы выкопайте 4 блока (яма 2×2), поставьте воронки и подключите их к сундукам.', img: 7 },
        { t: 'Выше воронок поставьте «Прогрузчик» (зелёная шерсть) и «Дамагер» (красная шерсть).', img: 8 },
        { t: 'Налейте воду во все углы, как на фото, и по всем краям камеры. Готово.', img: 6 },
      ],
      cost: 'примерно 12–15 млн монет',
      income: 'примерно 2 млн монет в час',
      materials: [
        ['Блок «Дамагер»', 'красная шерсть: моб рядом получает урон и погибает, блок сам собирает опыт и монеты. 4 790 токенов (/donshop special)'],
        ['Меч', 'вставляется в Дамагер: его бонусы применяются при ударах по мобам'],
        ['Прогрузчик чанков 1×1', 'зелёная шерсть: прогружает чанк, пока вас нет. 3 490 токенов (/donshop special или крафт /crafts)'],
        ['Кровати', '12 штук (по 3 в каждой из 4 ячеек)'],
        ['Бочки', '12 штук'],
        ['Строительные блоки', 'основание ячеек, подставки под воду, колонна'],
        ['Ограда', 'вокруг каждой ячейки'],
        ['Вода', 'ведро воды: для воды в углах и по краям'],
      ],
    },
  ];

  const sec = (h, b) => `<h4>${h}</h4>${b}`;

  function farmsScreen() {
    return {
      title: 'Фермы без СП', back: 'pve',
      html: `<div class="buttons">${FARMS.map(f => `
        <button class="tile" data-go="farm:${f.id}">
          <span class="ico"><img class="px" src="img/items/${f.icon}.png" alt=""></span>
          <span class="label">${f.name}</span><i class="arr">→</i>
        </button>`).join('')}</div>`,
    };
  }

  function farmScreen(id) {
    const f = FARMS.find(x => x.id === id);
    let h = `<div class="chips"><span class="chip">${f.size}</span><span class="chip">1 чанк</span></div>
      <p class="item-desc" style="margin-top:14px">${f.lead}</p>
      <ul class="stats money"><li class="st neutral"><span>Затраты на ферму</span><b>${f.cost}</b></li><li class="st buff"><span>Доход</span><b>${f.income}</b></li></ul>`;
    h += sec('Как построить', `<ol class="steps">${f.steps.map(s => `<li>
        <span>${s.t}</span>
        ${s.img ? `<figure class="fphoto"><img src="img/farms/${f.id}-${s.img}.jpg" alt="" loading="lazy"></figure>` : ''}
      </li>`).join('')}</ol>`);
    h += sec('Схема сверху', `<figure class="fphoto"><img src="img/farms/${f.id}-top.jpg" alt="Ферма сверху" loading="lazy"></figure>
      <p class="nodata" style="margin-top:8px">Так выглядит готовая ферма сверху: ячейки по углам, вода в середине, колонна в центре.</p>`);
    h += sec('Материалы', `<ul class="stats">${f.materials.map(([n, d]) => `<li class="st"><span><b>${n}</b><br><small>${d}</small></span></li>`).join('')}</ul>`);
    return { title: f.name, back: 'pve-nosp', html: h };
  }

  // просмотр фото на весь экран
  document.addEventListener('click', e => {
    const img = e.target.closest('.fphoto img');
    if (img) {
      const ov = document.createElement('div');
      ov.className = 'lightbox';
      ov.innerHTML = `<img src="${img.src}" alt="">`;
      ov.addEventListener('click', () => ov.remove());
      document.body.appendChild(ov);
    }
  });

  window.farmsScreen = farmsScreen;
  window.farmScreen = farmScreen;
})();
