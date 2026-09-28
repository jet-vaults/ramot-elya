/* JetVaults accessibility widget for ramot-elya.co.il
   Self-contained: injects its own CSS + markup. Buttons match the site's
   accessibility statement (/accessibility/). State persists in localStorage. */
(function () {
  'use strict';

  var KEY = 'ramot-elya-a11y';
  var INK = '#2a432d';
  var ACCENT = '#65705a';

  var LTR = (document.documentElement.getAttribute('dir') || 'rtl') === 'ltr';
  var SIDE = LTR ? 'right' : 'left';
  var css = [
    '#jv-a11y{position:fixed;bottom:18px;' + SIDE + ':18px;z-index:99999;font-family:"Noto Sans Hebrew","Segoe UI",Arial,sans-serif;direction:' + (LTR ? 'ltr' : 'rtl') + '}',
    '#jv-a11y-toggle{display:grid;place-items:center;width:52px;height:52px;border:none;border-radius:50%;background:' + INK + ';color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(42,67,45,.35);transition:background .2s ease,box-shadow .2s ease}',
    '#jv-a11y-toggle:hover{background:' + ACCENT + ';box-shadow:0 12px 30px rgba(42,67,45,.4)}',
    '#jv-a11y-toggle svg{width:30px;height:30px}',
    '#jv-a11y-panel{position:absolute;bottom:64px;' + SIDE + ':0;width:304px;max-width:calc(100vw - 36px);background:#fff;border:1px solid rgba(42,67,45,.15);border-radius:16px;box-shadow:0 24px 60px rgba(42,67,45,.3);padding:18px;box-sizing:border-box}',
    '#jv-a11y-panel *{box-sizing:border-box}',
    '#jv-a11y-panel .jv-a11y-title{font-weight:600;color:' + INK + ';margin:0 0 12px;font-size:16px}',
    '#jv-a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '#jv-a11y-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;font-family:inherit;font-size:13px;font-weight:500;color:' + INK + ';background:#f1f4f8;border:1px solid rgba(42,67,45,.15);border-radius:10px;padding:10px 6px;cursor:pointer;transition:background-color .15s ease,border-color .15s ease,color .15s ease}',
    '#jv-a11y-grid button:hover{border-color:' + INK + '}',
    '#jv-a11y-grid button[aria-pressed="true"]{background:' + INK + ';border-color:' + INK + ';color:#fff}',
    '#jv-a11y-grid button[data-a11y="reset"]{grid-column:1/-1;flex-direction:row;justify-content:center}',
    '#jv-a11y-grid .jv-ico{font-size:17px;line-height:1}',
    '#jv-a11y-statement{display:block;margin-top:12px;text-align:center;font-size:14px;font-weight:600;color:' + INK + ';text-decoration:underline}',

    /* --- effect modes (classes on <html>) --- */
    'html.jv-a11y-fontup body{zoom:1.2}',
    'html.jv-a11y-fontdown body{zoom:0.88}',

    /* visual filters: applied to page containers, never to body, so
       fixed/sticky elements keep their viewport anchoring */
    'html.jv-a11y-gray{--jv-filter:grayscale(1)}',
    'html.jv-a11y-contrast{--jv-filter:contrast(1.35)}',
    'html.jv-a11y-invert{--jv-filter:invert(1) hue-rotate(180deg)}',
    'html[class*="jv-a11y-"] .header,html[class*="jv-a11y-"] .menu,html[class*="jv-a11y-"] main,html[class*="jv-a11y-"] .footer{filter:var(--jv-filter,none)}',

    /* light background */
    'html.jv-a11y-light .header,html.jv-a11y-light .menu,html.jv-a11y-light main,html.jv-a11y-light main section,html.jv-a11y-light .section--dark,html.jv-a11y-light .section--stone,html.jv-a11y-light .section--paper,html.jv-a11y-light .track,html.jv-a11y-light .unit,html.jv-a11y-light .footer,html.jv-a11y-light body{background-color:#fff!important;background-image:none!important}',
    'html.jv-a11y-light .cta::before,html.jv-a11y-light .grain::after{display:none!important}',
    'html.jv-a11y-light h1,html.jv-a11y-light h2,html.jv-a11y-light h3,html.jv-a11y-light p,html.jv-a11y-light span,html.jv-a11y-light li,html.jv-a11y-light a,html.jv-a11y-light strong,html.jv-a11y-light b,html.jv-a11y-light dt,html.jv-a11y-light dd,html.jv-a11y-light small,html.jv-a11y-light label{color:#111!important}',
    'html.jv-a11y-light .btn--solid{background:#111!important;color:#fff!important;border-color:#111!important}',
    'html.jv-a11y-light .footer .brand img{filter:invert(1)}',

    /* highlight links */
    'html.jv-a11y-links a{text-decoration:underline!important;text-underline-offset:2px}',

    /* readable font */
    'html.jv-a11y-readable body *:not(.jv-ico){font-family:Arial,Helvetica,sans-serif!important;letter-spacing:.02em}'
  ].join('\n');

  var buttons = LTR ? [
    { key: 'fontup',   ico: 'A+', label: 'Bigger text' },
    { key: 'fontdown', ico: 'A-', label: 'Smaller text' },
    { key: 'gray',     ico: '▦',  label: 'Grayscale' },
    { key: 'contrast', ico: '◐',  label: 'High contrast' },
    { key: 'invert',   ico: '◑',  label: 'Inverted contrast' },
    { key: 'light',    ico: '☀',  label: 'Light background' },
    { key: 'links',    ico: '⎁',  label: 'Highlight links' },
    { key: 'readable', ico: 'R',  label: 'Readable font' },
    { key: 'reset',    ico: '↺',  label: 'Reset' }
  ] : [
    { key: 'fontup',   ico: 'א+', label: 'הגדל טקסט' },
    { key: 'fontdown', ico: 'א-', label: 'הקטן טקסט' },
    { key: 'gray',     ico: '▦',  label: 'גווני אפור' },
    { key: 'contrast', ico: '◐',  label: 'ניגודיות גבוהה' },
    { key: 'invert',   ico: '◑',  label: 'ניגודיות הפוכה' },
    { key: 'light',    ico: '☀',  label: 'רקע בהיר' },
    { key: 'links',    ico: '⎁',  label: 'הדגשת קישורים' },
    { key: 'readable', ico: 'ק',  label: 'פונט קריא' },
    { key: 'reset',    ico: '↺',  label: 'איפוס' }
  ];

  /* modes that cannot combine */
  var groups = [
    ['fontup', 'fontdown'],
    ['gray', 'contrast', 'invert', 'light']
  ];

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'jv-a11y';
  var btnHtml = buttons.map(function (b) {
    return '<button type="button" data-a11y="' + b.key + '" aria-pressed="false">' +
      '<span class="jv-ico" aria-hidden="true">' + b.ico + '</span><span>' + b.label + '</span></button>';
  }).join('');
  root.innerHTML =
    '<button id="jv-a11y-toggle" type="button" aria-expanded="false" aria-controls="jv-a11y-panel" aria-label="' + (LTR ? 'Accessibility menu' : 'תפריט נגישות') + '">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>' +
      '</svg>' +
    '</button>' +
    '<div id="jv-a11y-panel" role="dialog" aria-label="' + (LTR ? 'Accessibility settings' : 'הגדרות נגישות') + '" hidden>' +
      '<p class="jv-a11y-title">' + (LTR ? 'Accessibility settings' : 'הגדרות נגישות') + '</p>' +
      '<div id="jv-a11y-grid">' + btnHtml + '</div>' +
      '<a id="jv-a11y-statement" href="' + (LTR ? '/en/accessibility/' : '/accessibility/') + '">' + (LTR ? 'Accessibility statement' : 'להצהרת הנגישות') + '</a>' +
    '</div>';
  document.body.appendChild(root);

  var toggle = document.getElementById('jv-a11y-toggle');
  var panel = document.getElementById('jv-a11y-panel');

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }

  function applyState() {
    buttons.forEach(function (b) {
      if (b.key === 'reset') return;
      var on = !!state[b.key];
      document.documentElement.classList.toggle('jv-a11y-' + b.key, on);
      var btn = root.querySelector('[data-a11y="' + b.key + '"]');
      if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () { openPanel(panel.hidden); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { openPanel(false); toggle.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !root.contains(e.target)) openPanel(false);
  });

  root.querySelectorAll('[data-a11y]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-a11y');
      if (key === 'reset') { state = {}; applyState(); return; }
      var turningOn = !state[key];
      if (turningOn) {
        groups.forEach(function (group) {
          if (group.indexOf(key) !== -1) {
            group.forEach(function (k) { state[k] = false; });
          }
        });
      }
      state[key] = turningOn;
      applyState();
    });
  });

  applyState();
})();
