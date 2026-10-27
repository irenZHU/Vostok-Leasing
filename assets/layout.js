// Общие элементы всех страниц: шапка с меню, переход к соседним разделам, подвал,
// переключатель направлений логотипа.

// Три направления логотипа для презентации заказчику.
// Когда будут готовы файлы, добавьте путь к картинке: logo: "assets/logo-1.svg" —
// логотип встанет во все места с пометкой data-dir-logo.
const DIRECTIONS = [
  { name: "Направление 1" },
  { name: "Направление 2" },
  { name: "Направление 3" },
];

// Список разделов задаётся здесь один раз.
// Позже сюда добавятся: Кобрендинг, Редполитика, Графика направлений.
const SECTIONS = [
  { file: "logo.html",   title: "Логотип и знак" },
  { file: "colors.html", title: "Цвета" },
  { file: "fonts.html",  title: "Шрифты" },
];

(function () {
  const current = location.pathname.split("/").pop() || "index.html";
  const idx = SECTIONS.findIndex(s => s.file === current);

  const nav = SECTIONS.map(s =>
    `<a href="${s.file}"${s.file === current ? ' class="is-active"' : ""}>${s.title}</a>`
  ).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="header">
      <div class="wrap">
        <a class="logo-ph" href="index.html">ВОСТОК-ЛИЗИНГ</a>
        <nav class="nav">
          <a href="index.html"${current === "index.html" ? ' class="is-active"' : ""}>Концепция ребрендинга</a>
          ${nav}
        </nav>
        ${idx >= 0 ? `<div class="switch switch--mini" data-dir-switch role="tablist" aria-label="Направления логотипа">
          ${DIRECTIONS.map((d, k) => `<button role="tab" title="${d.name}"><span class="n">0${k + 1}</span></button>`).join("")}
        </div>` : ""}
      </div>
    </header>`);

  const main = document.querySelector("main");

  if (idx >= 0) {
    const prev = SECTIONS[idx - 1];
    const next = SECTIONS[idx + 1];
    main.insertAdjacentHTML("afterbegin", `
      <div class="crumbs">
        <a href="${prev ? prev.file : "index.html"}">← ${prev ? prev.title : "Концепция ребрендинга"}</a>
        ${next ? `<a href="${next.file}">${next.title} →</a>` : ""}
      </div>`);
    main.insertAdjacentHTML("beforeend", `
      <nav class="pager">
        <a href="${prev ? prev.file : "index.html"}"><span>← Назад</span><strong>${prev ? prev.title : "Концепция ребрендинга"}</strong></a>
        ${next ? `<a class="next" href="${next.file}"><span>Дальше →</span><strong>${next.title}</strong></a>` : ""}
      </nav>`);
  }

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="footer">
      <div class="wrap">
        <span>© Восток-Лизинг, 2026 · Концепция ребрендинга</span>
        <a href="#">Наверх ↑</a>
      </div>
    </footer>`);

  // Переключатель вкладок (палитры, направления)
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const buttons = group.querySelectorAll("button");
    buttons.forEach(btn => btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(`[data-panel^="${group.dataset.tabs}:"]`).forEach(p => {
        p.hidden = p.dataset.panel !== `${group.dataset.tabs}:${btn.dataset.tab}`;
      });
    }));
  });

  // ---------- Направления логотипа ----------
  // Выбор запоминается в браузере и сохраняется при переходе между разделами.
  // Ссылка с #1, #2 или #3 сразу открывает нужное направление.
  const KEY = "vl-direction";
  const fromHash = () => {
    const n = Number(location.hash.slice(1));
    return n >= 1 && n <= DIRECTIONS.length ? n - 1 : null;
  };
  const fromStore = () => {
    try { const n = Number(localStorage.getItem(KEY)); return n >= 1 && n <= DIRECTIONS.length ? n - 1 : null; }
    catch { return null; }
  };

  const targets = document.querySelectorAll("[data-dir]");
  targets.forEach(el => { el.dataset.base = el.innerHTML; });
  let dir = 0;

  function setDirection(i, animate) {
    dir = (i + DIRECTIONS.length) % DIRECTIONS.length;
    const d = DIRECTIONS[dir], n = dir + 1;

    targets.forEach(el => {
      if (el.hasAttribute("data-dir-logo") && d.logo) {
        el.innerHTML = `<img src="${d.logo}" alt="Логотип, ${d.name}">`;
        el.classList.add("has-img");
      } else {
        el.innerHTML = `${el.dataset.base}<span class="dir-tag">${d.name}</span>`;
        el.classList.remove("has-img");
      }
      if (animate) { el.classList.remove("is-in"); void el.offsetWidth; el.classList.add("is-in"); }
    });
    document.querySelectorAll("[data-dir-variant]").forEach(el => {
      el.textContent = `Вариант ${n}`;
    });
    document.querySelectorAll("[data-dir-note]").forEach(el => {
      el.innerHTML = `Показано: <b>${d.name}</b>`;
    });
    // Все переключатели на странице (на главной и в шапке) показывают одно и то же
    document.querySelectorAll("[data-dir-switch]").forEach(sw =>
      sw.querySelectorAll("button").forEach((t, k) => {
        t.classList.toggle("is-active", k === dir);
        t.setAttribute("aria-selected", k === dir);
      }));

    try { localStorage.setItem(KEY, n); } catch {}
    history.replaceState(null, "", `#${n}`);
  }

  document.querySelectorAll("[data-dir-switch]").forEach(sw =>
    sw.querySelectorAll("button").forEach((t, k) => t.addEventListener("click", () => setDirection(k, true))));

  // Клавиши ← → и 1/2/3 — удобно листать во время показа
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") setDirection(dir + 1, true);
    if (e.key === "ArrowLeft") setDirection(dir - 1, true);
    if (["1", "2", "3"].includes(e.key)) setDirection(Number(e.key) - 1, true);
  });

  window.addEventListener("hashchange", () => {
    const h = fromHash();
    if (h !== null && h !== dir) setDirection(h, true);
  });
  setDirection(fromHash() ?? fromStore() ?? 0, false);
})();
