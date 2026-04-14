/**
 * Dark Mechanicum background — falling binary columns + rotating sigils
 */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Characters: binary digits mixed with runic/mechanical glyphs
  const CHARS = '01ΨΦΩ⚙⬡⬢✦⊕⊗⊘⋮⋯≡≢≣⌬⌭⌮⍙⍚⍛⌀◈◉◊▣▤▦▧▩';

  const FONT_SIZE = 14;
  let cols = 0;
  let drops = [];

  // Sigils drawn as large semi-transparent overlays
  const SIGIL_CHARS = ['⚙', '⬡', 'Ψ', 'Φ', 'Ω', '⊕', '⊗', '◈', '⌬'];
  const sigils = [];
  const SIGIL_COUNT = 6;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / FONT_SIZE);

    // Reinitialise drops only for new columns
    const prev = drops.length;
    drops.length = cols;
    for (let i = prev; i < cols; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height / FONT_SIZE);
    }

    // Reinitialise sigils
    sigils.length = 0;
    for (let i = 0; i < SIGIL_COUNT; i++) {
      sigils.push({
        char:   SIGIL_CHARS[Math.floor(Math.random() * SIGIL_CHARS.length)],
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        size:   80 + Math.random() * 120,
        speed:  (Math.random() - 0.5) * 0.3,   // rotation speed rad/s
        angle:  Math.random() * Math.PI * 2,
        alpha:  0.03 + Math.random() * 0.04,
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  let last = 0;
  const TICK_MS = 50; // ~20 fps — subtle, not distracting

  function draw(now) {
    requestAnimationFrame(draw);
    if (now - last < TICK_MS) return;
    last = now;

    // Fade trail
    ctx.fillStyle = 'rgba(8, 10, 8, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw rotating background sigils first
    for (const s of sigils) {
      s.angle += s.speed * (TICK_MS / 1000);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.font = `${s.size}px "Share Tech Mono", monospace`;
      ctx.fillStyle = `rgba(74, 102, 64, ${s.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.char, 0, 0);
      ctx.restore();
    }

    // Draw falling columns
    ctx.font = `${FONT_SIZE}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let i = 0; i < cols; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      // Head of column slightly brighter
      const isHead = drops[i] >= 0 && drops[i] < canvas.height / FONT_SIZE;
      if (isHead) {
        ctx.fillStyle = 'rgba(124, 252, 0, 0.7)';
      } else {
        ctx.fillStyle = 'rgba(42, 72, 32, 0.5)';
      }

      if (y >= 0 && y < canvas.height) {
        ctx.fillText(char, x, y);
      }

      // Reset column when it goes off screen
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = Math.floor(Math.random() * -20);
      }

      drops[i]++;
    }
  }

  requestAnimationFrame(draw);
})();

// ── Nav injection ─────────────────────────────────────────────────────────────
// Generates the nav from one source of truth. To add/remove a nav item, edit
// the links array below — it propagates to every page automatically.
(function () {
  const nav = document.querySelector('header nav');
  if (!nav) return;

  // Infer relative path prefix from the stylesheet link depth:
  //   style.css       → webpages/           → prefix legions/
  //   ../style.css    → webpages/legions/    → prefix (none)
  //   ../../style.css → webpages/legions/*/  → prefix ../
  const styleHref = (document.querySelector('link[href*="style.css"]') || {}).getAttribute('href') || 'style.css';
  const depth = (styleHref.match(/\.\.\//g) || []).length;
  const prefix = depth === 0 ? 'legions/' : depth === 1 ? '' : '../';

  // Determine which section is active
  const path = window.location.pathname;
  const active = {
    background:   path.endsWith('legions.html')        || path.includes('/background/'),
    armyLists:    path.endsWith('army-lists.html')      || path.includes('/lists/'),
    battleReports:path.endsWith('battle-reports.html')  || path.includes('/campaigns/'),
    timeline:     path.endsWith('timeline.html'),
  };

  const links = [
    { href: 'legions.html',        label: 'BACKGROUND',     key: 'background'    },
    { href: 'army-lists.html',     label: 'ARMY LISTS',     key: 'armyLists'     },
    { href: 'battle-reports.html', label: 'BATTLE REPORTS', key: 'battleReports' },
    { href: 'timeline.html',       label: 'TIMELINE',       key: 'timeline'      },
  ];

  const sep = '<span class="nav-sep">⬡</span>';

  nav.innerHTML = links.map((l, i) =>
    (i > 0 ? sep + '\n      ' : '') +
    `<a href="${prefix}${l.href}" class="nav-link${active[l.key] ? ' active' : ''}">${l.label}</a>`
  ).join('\n      ');
})();
