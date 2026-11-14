/* Site editor for the Garmoniya salon, opened at <page>#admin.
   Texts, prices, links and all photos are stored in garmoniya-content.json; garmoniya-save.php checks the password,
   writes the file and changes the password. Without PHP (GitHub Pages) the editor works in demo mode: preview only. */
(function () {
  if (window.GARM_ADMIN) { window.GARM_ADMIN.open(); return; }
  var DATA = 'garmoniya-content.json', SAVE = 'garmoniya-save.php', DRAFT = 'garmoniya-preview', SESSION = 'garmoniya-adm';
  // sha256(SALT + password) for the starting password; the real check happens in obidina-save.php
  var SALT = '2b204183c4d8abb4', DEMO_HASH = 'e20938ca2518742576a0502036d0ba45f778968638284673b8e473116a8bb963';
  var LINKS = [
    { k: 'phone', label: 'Главный телефон для звонка (цифрами)', def: '+7 952 770-69-27' },
    { k: 'phone2', label: 'Второй телефон для звонка (цифрами)', def: '+7 910 131-33-26' },
    { k: 'whatsapp', label: 'WhatsApp (номер или ссылка)', def: 'https://wa.me/79101313326' },
    { k: 'telegram', label: 'Telegram', def: 'https://t.me/Garmony52' },
    { k: 'vk', label: 'Группа ВКонтакте', def: 'https://vk.ru/garmony52' }
  ];
  // every <img data-i data-label> on the page becomes a photo field

  var css = '\
.adm { position: fixed; inset: 0; z-index: 200; overflow: auto; background: #FBF6EE; color: #1E1A17; font: 400 15px/1.5 Raleway, Arial, sans-serif; }\
.adm * { box-sizing: border-box; } .adm button, .adm input, .adm textarea { font: inherit; color: inherit; }\
.adm-h { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 14px clamp(14px, 3vw, 32px); background: #fff; border-bottom: 1px solid #E8DCCB; }\
.adm-h h1 { margin: 0 auto 0 0; font: 700 18px/1.2 "Yeseva One", Georgia, serif; } .adm-h h1 small { display: block; font: 400 13px/1.3 Raleway, Arial, sans-serif; color: #6E625A; }\
.adm-b { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 30px; border: 0; background: #8E2C48; color: #fff !important; font-weight: 700; cursor: pointer; text-decoration: none; }\
.adm-b.o { background: transparent; color: #6E1F37 !important; box-shadow: inset 0 0 0 2px #8E2C48; } .adm-b.g { background: transparent; color: #6E625A !important; } .adm-b:disabled { opacity: .5; cursor: default; }\
.adm-w { display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 24px; max-width: 1180px; margin: 0 auto; padding: 24px clamp(14px, 3vw, 32px) 80px; }\
.adm-n { position: sticky; top: 90px; align-self: start; display: grid; gap: 4px; } .adm-n a { white-space: nowrap; padding: 9px 12px; border-radius: 12px; text-decoration: none; color: #6E625A; font-weight: 600; cursor: pointer; } .adm-n a:hover { background: #fff; color: #1E1A17; }\
.adm-n a b { float: right; min-width: 22px; padding: 0 6px; border-radius: 10px; background: #8E2C48; color: #fff; font-size: 12px; text-align: center; }\
.adm-q { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #E8DCCB; background: #fff; margin-bottom: 8px; }\
.adm main > section.adm-c { padding: 0; } .adm-c { background: #fff; border-radius: 20px; border: 1px solid #E8DCCB; margin-bottom: 18px; overflow: hidden; scroll-margin-top: 90px; } .adm-c h2 { margin: 0; padding: 16px 20px; font: 700 17px/1.3 "Yeseva One", Georgia, serif; border-bottom: 1px solid #E8DCCB; background: #FFFCF7; }\
.adm-f { display: grid; grid-template-columns: 220px minmax(0, 1fr) 34px; gap: 14px; align-items: start; padding: 12px 20px; border-bottom: 1px solid #E8DCCB; } .adm-f:last-child { border-bottom: 0; }\
.adm-f label { padding-top: 9px; font-weight: 600; font-size: 14px; color: #6E625A; }\
.adm-f textarea, .adm-f input[type=text] { width: 100%; padding: 9px 12px; border-radius: 10px; border: 1px solid #E8DCCB; background: #fff; resize: vertical; min-height: 40px; line-height: 1.45; }\
.adm-f.ch textarea, .adm-f.ch input[type=text] { background: #FFFBEB; border-color: #F3D27A; }\
.adm-f .rs { width: 34px; height: 34px; margin-top: 3px; border-radius: 50%; border: 0; background: transparent; cursor: pointer; color: #6E625A; font-size: 18px; visibility: hidden; } .adm-f.ch .rs { visibility: visible; }\
.adm-i { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; } .adm-i img { width: 84px; height: 104px; object-fit: cover; border-radius: 12px; background: #F6E6EA; }\
.adm-x { padding: 16px 20px; border-radius: 18px; background: #F6E6EA; margin-bottom: 18px; color: #6E1F37; } .adm-x.alert { background: #FFF4D6; color: #6B4A12; }\
.adm-login { min-height: 100%; display: grid; place-items: center; padding: 20px; }\
.adm-box { width: min(92vw, 400px); padding: 28px; border-radius: 24px; background: #fff; display: grid; gap: 12px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.35); }\
.adm-box h3 { margin: 0; font: 700 20px/1.3 "Yeseva One", Georgia, serif; } .adm-box p { margin: 0; color: #6E625A; font-size: 14px; }\
.adm-box input { padding: 12px 14px; border-radius: 12px; border: 1px solid #E8DCCB; } .adm-box .err { color: #C2412F; font-size: 14px; min-height: 1.2em; }\
.adm-m { position: fixed; inset: 0; z-index: 3; display: none; place-items: center; background: rgba(30,26,23,.5); } .adm-m.on { display: grid; }\
.adm-t { position: fixed; left: 50%; bottom: 22px; z-index: 4; transform: translate(-50%, 160%); max-width: min(92vw, 640px); padding: 14px 18px; border-radius: 16px; background: #1E1A17; color: #fff; transition: transform .4s; } .adm-t.on { transform: translate(-50%, 0); } .adm-t:not(.on) { visibility: hidden; } .adm-t.warn { background: #6B4A12; }\
.adm-pv { position: fixed; z-index: 199; left: 50%; bottom: 18px; transform: translateX(-50%); display: flex; gap: 8px; align-items: center; padding: 8px 8px 8px 18px; border-radius: 40px; background: #1E1A17; color: #fff; font: 600 14px/1.2 Raleway, Arial, sans-serif; box-shadow: 0 16px 40px -14px rgba(0,0,0,.5); }\
@media (max-width: 860px) { .adm-w { grid-template-columns: 1fr; } .adm-n { position: static; grid-auto-flow: column; overflow-x: auto; } .adm-f { grid-template-columns: 1fr 34px; } .adm-f label { grid-column: 1 / -1; padding: 0; } }';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var root = document.createElement('div'); root.className = 'adm'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Редактор сайта');
  var mode = null, pass = '', defaults = { texts: {}, links: {}, images: {} }, cur = null, built = false, pageHTML = null;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function toast(msg, warn) {
    var t = root.querySelector('.adm-t'); if (!t) return;
    t.textContent = msg; t.classList.toggle('warn', !!warn); t.classList.add('on');
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 5600);
  }
  function sha(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  // null when the hosting has no PHP (GitHub Pages answers with a 404 / 405 page instead of JSON)
  function api(body) {
    return fetch(SAVE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.text(); }).then(function (t) { try { return JSON.parse(t); } catch (e) { return null; } })
      .catch(function () { return null; });
  }
  function store() { try { localStorage.setItem(DRAFT, JSON.stringify(cur)); } catch (e) {} }
  function grow(ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; }

  function login(pw) {
    return api({ action: 'login', password: pw }).then(function (r) {
      if (r) { if (r.ok) { mode = 'server'; return true; } throw new Error(r.error || 'Неверный пароль'); }
      return sha(SALT + pw).then(function (h) { if (h !== DEMO_HASH) throw new Error('Неверный пароль'); mode = 'demo'; return true; });
    });
  }

  function showLogin(msg) {
    root.innerHTML = '';
    var w = el('div', 'adm-login'), f = el('form', 'adm-box');
    f.innerHTML = '<h3>Вход в редактор сайта</h3><p>Салон красоты «Гармония»</p><input type="password" autocomplete="current-password" placeholder="Пароль" required><div class="err"></div><div style="display:flex;gap:10px;justify-content:space-between"><button type="button" class="adm-b g">На сайт</button><button class="adm-b">Войти</button></div>';
    f.querySelector('.err').textContent = msg || '';
    f.querySelector('.g').addEventListener('click', close);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var pw = f.querySelector('input').value, btn = f.querySelector('button:not(.g)'); btn.disabled = true;
      login(pw).then(function () { pass = pw; try { sessionStorage.setItem(SESSION, pw); } catch (x) {} showEditor(); })
        .catch(function (x) { f.querySelector('.err').textContent = x.message; btn.disabled = false; });
    });
    w.appendChild(f); root.appendChild(w);
    setTimeout(function () { f.querySelector('input').focus(); }, 50);
  }

  function field(card, kind, key, label, def) {
    var row = el('div', 'adm-f'); row.dataset.search = (label + ' ' + def).toLowerCase();
    var lb = el('label'); lb.textContent = label;
    var val = cur[kind][key] != null ? cur[kind][key] : def, inp;
    if (kind === 'images') {
      inp = el('div', 'adm-i');
      var im = new Image(); im.src = val || def; im.alt = '';
      var file = el('input'); file.type = 'file'; file.accept = 'image/*';
      file.addEventListener('change', function () { var f = file.files[0]; if (f) shrink(f).then(function (d) { cur.images[key] = d; im.src = d; mark(); store(); }); });
      inp.append(im, file);
    } else {
      inp = el(kind === 'links' ? 'input' : 'textarea'); if (kind === 'links') inp.type = 'text';
      inp.value = val; inp.rows = 1;
      inp.addEventListener('input', function () { cur[kind][key] = inp.value; mark(); store(); if (inp.tagName === 'TEXTAREA') grow(inp); });
    }
    var rs = el('button', 'rs', '↺'); rs.type = 'button'; rs.title = 'Вернуть исходный текст';
    rs.addEventListener('click', function () {
      delete cur[kind][key];
      if (kind === 'images') inp.querySelector('img').src = def; else { inp.value = def; if (inp.tagName === 'TEXTAREA') grow(inp); }
      mark(); store();
    });
    function mark() { row.classList.toggle('ch', cur[kind][key] != null && cur[kind][key] !== def); counts(); }
    row.append(lb, inp, rs); card.appendChild(row); mark();
    if (inp.tagName === 'TEXTAREA') setTimeout(function () { grow(inp); }, 30);
  }
  function shrink(f) {
    return new Promise(function (res) {
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var k = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas');
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82));
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  function counts() {
    root.querySelectorAll('.adm-c').forEach(function (c) {
      var n = c.querySelectorAll('.adm-f.ch').length, a = root.querySelector('.adm-n a[data-to="' + c.id + '"]');
      if (a) a.innerHTML = a.dataset.t + (n ? '<b>' + n + '</b>' : '');
    });
  }
  function clean() {
    var out = { texts: {}, links: {}, images: {} };
    ['texts', 'links', 'images'].forEach(function (k) { Object.keys(cur[k]).forEach(function (x) { if (cur[k][x] !== defaults[k][x]) out[k][x] = cur[k][x]; }); });
    out.updated = new Date().toISOString();
    return out;
  }

  function showEditor() {
    root.innerHTML = '';
    var head = el('header', 'adm-h', '<h1>Редактор сайта<small>Салон красоты «Гармония»</small></h1>');
    var bPrev = el('button', 'adm-b o', 'Предпросмотр'), bDown = el('button', 'adm-b o', 'Скачать файл'), bSave = el('button', 'adm-b', 'Сохранить на сайте');
    var bPass = el('button', 'adm-b g', 'Сменить пароль'), bOut = el('button', 'adm-b g', 'Выйти');
    head.append(bPrev, bDown, bSave, bPass, bOut);
    var wrap = el('div', 'adm-w'), nav = el('nav', 'adm-n'), form = el('main');
    var q = el('input', 'adm-q'); q.placeholder = 'Найти поле…'; nav.appendChild(q);
    form.appendChild(el('div', 'adm-x', 'Меняйте текст прямо в полях. Изменённые поля подсвечиваются жёлтым, ↺ возвращает исходный текст. <b>Предпросмотр</b> показывает сайт с правками только вам. <b>Сохранить на сайте</b> публикует правки для всех посетителей.'));
    if (mode === 'demo') form.appendChild(el('div', 'adm-x alert', 'Сайт пока стоит на временном адресе, где нельзя сохранять изменения. Правки видны в предпросмотре, а кнопки «Сохранить на сайте» и «Сменить пароль» заработают после переноса сайта на ваш хостинг.'));
    wrap.append(nav, form); root.append(head, wrap, el('div', 'adm-t'));

    // password change dialog
    var m = el('div', 'adm-m'), pf = el('form', 'adm-box');
    pf.innerHTML = '<h3>Смена пароля</h3><input type="password" name="o" placeholder="Текущий пароль" autocomplete="current-password" required><input type="password" name="n" placeholder="Новый пароль (от 8 символов)" autocomplete="new-password" minlength="8" required><input type="password" name="r" placeholder="Повторите новый пароль" autocomplete="new-password" required><div class="err"></div><div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="adm-b g">Отмена</button><button class="adm-b">Сменить</button></div>';
    m.appendChild(pf); root.appendChild(m);
    pf.querySelector('.g').addEventListener('click', function () { m.classList.remove('on'); });
    bPass.addEventListener('click', function () { pf.reset(); pf.querySelector('.err').textContent = ''; m.classList.add('on'); pf.querySelector('input').focus(); });
    pf.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = pf.o.value, n = pf.n.value, r = pf.r.value, err = pf.querySelector('.err');
      if (n !== r) { err.textContent = 'Новые пароли не совпадают'; return; }
      if (n.length < 8) { err.textContent = 'Пароль должен быть не короче 8 символов'; return; }
      api({ action: 'passwd', password: o, newPassword: n }).then(function (res) {
        if (!res) { err.textContent = 'Смена пароля заработает после переноса сайта на ваш хостинг.'; return; }
        if (!res.ok) { err.textContent = res.error || 'Не удалось сменить пароль'; return; }
        pass = n; try { sessionStorage.setItem(SESSION, n); } catch (x) {}
        m.classList.remove('on'); toast('Пароль изменён. Запомните новый пароль.');
      });
    });

    bOut.addEventListener('click', function () { try { sessionStorage.removeItem(SESSION); } catch (x) {} pass = ''; close(); });
    bDown.addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(clean(), null, 2)], { type: 'application/json' }));
      a.download = DATA; a.click(); toast('Файл ' + DATA + ' скачан.');
    });
    bPrev.addEventListener('click', preview);
    bSave.addEventListener('click', function () {
      bSave.disabled = true;
      api({ action: 'save', password: pass, content: clean() }).then(function (r) {
        if (!r) toast('На этом адресе сохранение недоступно. Правки остались в предпросмотре, кнопка заработает после переноса сайта на ваш хостинг.', true);
        else if (r.ok) { try { localStorage.removeItem(DRAFT); } catch (x) {} toast('Сохранено. Посетители уже видят новую версию.'); }
        else if (/парол/i.test(r.error || '')) { showLogin('Пароль изменился, войдите заново'); }
        else toast(r.error || 'Не удалось сохранить', true);
        bSave.disabled = false;
      });
    });
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      form.querySelectorAll('.adm-f').forEach(function (r) { r.style.display = !v || r.dataset.search.indexOf(v) > -1 ? '' : 'none'; });
      form.querySelectorAll('.adm-c').forEach(function (c) { c.style.display = [].some.call(c.querySelectorAll('.adm-f'), function (r) { return r.style.display !== 'none'; }) ? '' : 'none'; });
    });

    var page = location.href.split('#')[0].split('?')[0];
    (pageHTML ? Promise.resolve(pageHTML) : fetch(page, { cache: 'no-store' }).then(function (r) { return r.text(); })).then(function (html) {
      pageHTML = html;
      var doc = new DOMParser().parseFromString(html, 'text/html');
      return fetch(DATA, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (pub) {
        var draft = null; try { draft = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (x) {}
        var base = draft || pub || {};
        cur = { texts: Object.assign({}, base.texts), links: Object.assign({}, base.links), images: Object.assign({}, base.images) };
        build(doc, nav, form);
      });
    });
  }

  function build(doc, nav, form) {
    var groups = {}, order = [], seen = {};
    function group(n) { if (!groups[n]) { groups[n] = []; order.push(n); } return groups[n]; }
    doc.querySelectorAll('[data-e]').forEach(function (e) {
      var k = e.dataset.e; if (seen[k]) return; seen[k] = 1;
      var b = e.closest('[data-block]'); defaults.texts[k] = e.textContent.trim();
      group(b ? b.dataset.block : 'Шапка и первый экран').push({ kind: 'texts', key: k, label: e.dataset.label || k, def: defaults.texts[k] });
    });
    var contacts = group('Контакты и ссылки');
    LINKS.forEach(function (l) { defaults.links[l.k] = l.def; contacts.push({ kind: 'links', key: l.k, label: l.label, def: l.def }); });
    var photos = group('Фотографии');
    doc.querySelectorAll('img[data-i]').forEach(function (e) { var k = e.dataset.i; defaults.images[k] = e.getAttribute('src'); photos.push({ kind: 'images', key: k, label: e.dataset.label || k, def: defaults.images[k] }); });
    order.forEach(function (name, n) {
      var card = el('section', 'adm-c'); card.id = 'adm-b' + n;
      var h = el('h2'); h.textContent = name; card.appendChild(h);
      groups[name].forEach(function (f) { field(card, f.kind, f.key, f.label, f.def); });
      form.appendChild(card);
      var a = el('a'); a.dataset.to = card.id; a.dataset.t = name; a.textContent = name;
      a.addEventListener('click', function () { card.scrollIntoView({ behavior: 'smooth' }); });
      nav.appendChild(a);
    });
    counts();
  }

  function preview() {
    root.style.display = 'none'; document.body.style.overflow = '';
    if (window.applyContent) window.applyContent(clean());
    var bar = el('div', 'adm-pv', 'Предпросмотр: так сайт увидят посетители');
    var back = el('button', 'adm-b', 'Вернуться в редактор'); bar.appendChild(back); document.body.appendChild(bar);
    back.addEventListener('click', function () { bar.remove(); root.style.display = ''; document.body.style.overflow = 'hidden'; });
  }

  function open() {
    if (!root.isConnected) document.body.appendChild(root);
    root.style.display = ''; document.body.style.overflow = 'hidden';
    if (built && pass) return;
    var saved = ''; try { saved = sessionStorage.getItem(SESSION) || ''; } catch (x) {}
    if (saved) login(saved).then(function () { pass = saved; built = true; showEditor(); }).catch(function () { showLogin(); });
    else showLogin();
  }
  function close() {
    root.style.display = 'none'; document.body.style.overflow = '';
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
    if (!pass) { root.remove(); }
    location.reload();
  }
  window.GARM_ADMIN = { open: open };
  open();
})();
