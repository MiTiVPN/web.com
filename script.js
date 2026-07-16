// ============================================
// MitiVPN — animated circuit background + notify form
// ============================================

(function circuitBackground() {
  const canvas = document.getElementById('circuit-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let nodes = [];
  let pulses = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  // Build a sparse "PCB trace" style grid: horizontal/vertical segments meeting at nodes
  function buildGrid() {
    nodes = [];
    const cols = Math.max(6, Math.floor(width / 140));
    const rows = Math.max(5, Math.floor(height / 140));
    const spacingX = width / cols;
    const spacingY = height / rows;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        // Only keep a sparse random subset to feel like circuitry, not a full grid
        if (Math.random() < 0.42) {
          nodes.push({
            x: i * spacingX + (Math.random() - 0.5) * spacingX * 0.4,
            y: j * spacingY + (Math.random() - 0.5) * spacingY * 0.4,
          });
        }
      }
    }

    // connect nearby nodes with orthogonal-ish traces
    pulses = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < spacingX * 1.3 && Math.random() < 0.5) {
          pulses.push({
            a: nodes[i],
            b: nodes[j],
            t: Math.random(),
            speed: 0.0018 + Math.random() * 0.0025,
            active: Math.random() < 0.35,
          });
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 1;

    // static traces
    pulses.forEach((p) => {
      ctx.strokeStyle = 'rgba(109, 158, 214, 0.10)';
      ctx.beginPath();
      ctx.moveTo(p.a.x, p.a.y);
      ctx.lineTo(p.b.x, p.b.y);
      ctx.stroke();
    });

    // node dots
    ctx.fillStyle = 'rgba(109, 158, 214, 0.18)';
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) {
      // moving pulses along active traces
      pulses.forEach((p) => {
        if (!p.active) return;
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grad.addColorStop(0, 'rgba(77, 184, 255, 0.9)');
        grad.addColorStop(1, 'rgba(77, 184, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ============================================
// Corner menu (top-right dropdown)
// ============================================
(function cornerMenu() {
  const trigger = document.getElementById('menu-trigger');
  const panel = document.getElementById('menu-panel');
  if (!trigger || !panel) return;

  function openMenu() {
    trigger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.setAttribute('data-open', 'true');
  }

  function closeMenu() {
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('data-open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== trigger) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
})();

// ============================================
// Notify form (client-side only — visual confirmation)
// ============================================
(function notifyForm() {
  const form = document.getElementById('notify-form');
  const hint = document.getElementById('notify-hint');
  if (!form || !hint) return;

  const defaultHint = hint.textContent;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    if (!email) return;

    hint.textContent = `Thanks — we'll email ${email} the moment we launch.`;
    hint.style.color = 'var(--blue-bright)';
    emailInput.value = '';
    emailInput.disabled = true;
    form.querySelector('button').disabled = true;
    form.querySelector('button').style.opacity = '0.6';
    form.querySelector('button').style.cursor = 'default';

    setTimeout(() => {
      hint.textContent = defaultHint;
      hint.style.color = '';
      emailInput.disabled = false;
      form.querySelector('button').disabled = false;
      form.querySelector('button').style.opacity = '';
      form.querySelector('button').style.cursor = '';
    }, 5000);
  });
})();
