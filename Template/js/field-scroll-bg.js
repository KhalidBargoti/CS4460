/* ═══════════════════════════════════════════════════════════════════════════
   field-scroll-bg.js  —  uploaded v3, goal post fixed to page bottom
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FIELD_HEIGHT = 6000;
  var PARALLAX     = 0.5;

  /* ── Progress bar ───────────────────────────────────────────────────────── */
  var progressBar = document.createElement('div');
  progressBar.id = 'field-progress';
  document.documentElement.appendChild(progressBar);

  /* ── Field wrapper ──────────────────────────────────────────────────────── */
  var bg = document.createElement('div');
  bg.id = 'field-bg';

  var inner = document.createElement('div');
  inner.id = 'field-scroll-inner';

  /* End zones */
  var ezTop = document.createElement('div');
  ezTop.className = 'field-endzone field-endzone-top';
  ezTop.textContent = 'OFFENSE';
  inner.appendChild(ezTop);

  var ezBot = document.createElement('div');
  ezBot.className = 'field-endzone field-endzone-bottom';
  ezBot.textContent = 'CHAMPIONS';
  inner.appendChild(ezBot);

  /* Yard numbers + glow stripes */
  var yards = [10, 20, 30, 40, 50, 40, 30, 20, 10];
  yards.forEach(function(num, i) {
    var yPx = (i + 1) * 500;

    var nl = document.createElement('div');
    nl.className = 'field-yard-num left';
    nl.style.top = yPx + 'px';
    nl.textContent = num;
    inner.appendChild(nl);

    var nr = document.createElement('div');
    nr.className = 'field-yard-num right';
    nr.style.top = yPx + 'px';
    nr.textContent = num;
    inner.appendChild(nr);

    var glow = document.createElement('div');
    glow.className = 'field-stripe-glow';
    glow.style.top = (yPx - 1) + 'px';
    inner.appendChild(glow);
  });

  bg.appendChild(inner);
  document.documentElement.appendChild(bg);

  /* ── Goal post — fixed to page bottom, fades in only on last screen ─────── */
  var ns = 'http://www.w3.org/2000/svg';

  function makeLine(x1, y1, x2, y2, w) {
    var l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', 'rgba(255,255,255,0.85)');
    l.setAttribute('stroke-width', w);
    l.setAttribute('stroke-linecap', 'round');
    return l;
  }

  var gp = document.createElementNS(ns, 'svg');
  gp.setAttribute('viewBox', '0 0 200 160');
  gp.id = 'field-goalpost';
  gp.appendChild(makeLine(100, 160, 100, 80, 6));
  gp.appendChild(makeLine(30,  80,  170, 80, 5));
  gp.appendChild(makeLine(30,  80,  30,  10, 5));
  gp.appendChild(makeLine(170, 80,  170, 10, 5));

  /* Fixed to bottom of viewport, centred, starts invisible */
  gp.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:50%',
    'transform:translateX(-50%)',
    'width:180px',
    'height:auto',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity 0.5s ease',
    'filter:drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    'z-index:0'
  ].join(';');

  document.documentElement.appendChild(gp);

  /* ── Parallax — starts at 50-yard line ─────────────────────────────────── */
  function getBaseOffset() {
    return -(2500 - window.innerHeight / 2);
  }

  var ticking = false;

  function update() {
    var scrolled  = window.scrollY;
    var maxScroll = document.body.scrollHeight - window.innerHeight;
    var pct       = maxScroll > 0 ? scrolled / maxScroll : 0;

    var maxOffset   = FIELD_HEIGHT - window.innerHeight;
    var scrollPart  = -(pct * maxOffset * PARALLAX);
    var totalOffset = getBaseOffset() + scrollPart;

    inner.style.transform = 'translateY(' + totalOffset + 'px)';
    progressBar.style.height = (pct * 100) + '%';

    /* Show goal post only when within the last 15% of the page */
    gp.style.opacity = pct > 0.98 ? '1' : '0';

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  window.addEventListener('load', update);
  window.addEventListener('resize', update);
  update();

  /* ── Yard-line glow pulse ───────────────────────────────────────────────── */
  var glowTick = false;
  window.addEventListener('scroll', function () {
    if (!glowTick) {
      requestAnimationFrame(function () {
        var scrolled  = window.scrollY;
        var maxScroll = document.body.scrollHeight - window.innerHeight;
        var pct       = maxScroll > 0 ? scrolled / maxScroll : 0;
        var fieldPos  = pct * FIELD_HEIGHT * PARALLAX;

        document.querySelectorAll('.field-stripe-glow').forEach(function (g) {
          if (Math.abs(parseFloat(g.style.top) - fieldPos) < 80) {
            g.style.opacity = '1';
            clearTimeout(g._t);
            g._t = setTimeout(function () { g.style.opacity = '0'; }, 600);
          }
        });
        glowTick = false;
      });
      glowTick = true;
    }
  }, { passive: true });

})();
