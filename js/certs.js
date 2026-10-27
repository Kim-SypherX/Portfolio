// =============================================================
// ORBITE DES CERTIFICATS — spirale 3D (CSS 3D piloté en JS)
// Les certificats tournent en hélice autour de la photo ;
// à tour de rôle, l'un d'eux sort de la spirale et se présente.
// =============================================================

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

export function initCertOrbit({ certs, onOpen }) {
  const orbit = document.getElementById('orbit');
  const scene = document.getElementById('orbit-scene');
  const cardsEl = document.getElementById('orbit-cards');
  const spot = document.getElementById('spotlight');
  if (!orbit || !cardsEl) return;

  const $ = (id) => document.getElementById(id);
  const ui = {
    index: $('spot-index'), total: $('spot-total'), issuer: $('spot-issuer'),
    body: $('spot-body'), platform: $('spot-platform'), title: $('spot-title'),
    meta: $('spot-meta'), date: $('spot-date'), open: $('spot-open'), verify: $('spot-verify'),
    progress: $('spot-progress'), prev: $('spot-prev'), next: $('spot-next'), play: $('spot-play'),
  };

  const N = certs.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOVE = 1150;
  const HOLD = 3800;
  const STEP = (Math.PI * 2) / 7;

  // ---------- Construction des cartes ----------
  const cards = certs.map((c, i) => {
    const b = document.createElement('button');
    b.className = 'ocard';
    b.type = 'button';
    b.style.setProperty('--c', c.color);
    b.setAttribute('aria-label', `Ouvrir le certificat ${c.title} — ${c.issuer}`);
    b.dataset.index = i;
    b.dataset.cursor = 'Voir';
    if (c.img) {
      b.innerHTML = `<img src="${c.img}-thumb.webp" alt="" width="520" height="400" loading="lazy" decoding="async" draggable="false">`;
    } else {
      b.innerHTML = `<div class="ocard__fallback"><small>${c.issuer}</small><b>${c.title}</b><small>${c.date}</small></div>`;
    }
    cardsEl.appendChild(b);
    return b;
  });
  ui.total.textContent = String(N).padStart(2, '0');
  ui.progress.innerHTML = certs.map(() => '<i></i>').join('');
  const segs = [...ui.progress.children];

  // ---------- Géométrie responsive ----------
  let G = {};
  function measure() {
    const w = orbit.clientWidth;
    const mobile = w < 560;
    const R = clamp(w * 0.36, 140, 330);
    G = {
      mobile, R,
      pitch: mobile ? 24 : 34,
      y0: mobile ? 40 : 30,
      theta0: mobile ? 0 : 0.5,
      photoHalfW: mobile ? 85 : 125,
      photoBottom: mobile ? 85 : 130,
      cardW: mobile ? 112 : 180,
      target: mobile
        ? { x: 0, y: 175, z: R * 0.5, s: 1.45 }
        : { x: R * 0.86, y: 34, z: R * 0.55, s: 1.38 },
    };
    scene.querySelectorAll('.orbit__lines i').forEach((el) => el.style.setProperty('--r', `${R}px`));
  }
  measure();
  new ResizeObserver(measure).observe(orbit);

  const wrapRel = (d) => ((((d % N) + N) % N) + N / 2) % N - N / 2;
  const mod = (v) => ((v % N) + N) % N;

  // ---------- État du timeline ----------
  const S = {
    progress: 0, from: 0, to: 0, phase: 'hold', elapsed: 0,
    present: 0, userPaused: reduce, hoverPaused: false, dialogOpen: false,
    dragging: false, dragStartX: 0, dragStartP: 0, moved: false, visible: false,
    lastIdx: -1,
  };

  function startMove(from, to, dur = MOVE) {
    S.from = from; S.to = to; S.phase = 'move'; S.elapsed = 0; S.moveDur = dur;
    updateSpotlight(mod(Math.round(to)));
  }
  function go(delta) {
    const base = S.phase === 'move' ? S.to : Math.round(S.progress);
    startMove(S.progress, base + delta, 900);
  }
  function goTo(i) {
    const base = S.phase === 'move' ? S.to : Math.round(S.progress);
    const delta = wrapRel(i - mod(base));
    if (delta === 0 && S.phase === 'hold') return;
    startMove(S.progress, base + delta, 900 + Math.abs(delta) * 90);
  }

  // ---------- Spotlight ----------
  let swapTimer;
  function updateSpotlight(i) {
    if (i === S.lastIdx) return;
    S.lastIdx = i;
    const c = certs[i];
    spot.style.setProperty('--c', c.color);
    ui.body.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      ui.index.textContent = String(i + 1).padStart(2, '0');
      ui.issuer.textContent = c.issuer;
      ui.platform.textContent = c.platform;
      ui.title.textContent = c.title;
      ui.meta.textContent = c.meta;
      ui.date.textContent = `Obtenu · ${c.date}`;
      if (c.verify) {
        ui.verify.href = c.verify;
        ui.verify.removeAttribute('aria-disabled');
        ui.verify.tabIndex = 0;
      } else {
        ui.verify.removeAttribute('href');
        ui.verify.setAttribute('aria-disabled', 'true');
        ui.verify.tabIndex = -1;
      }
      ui.body.classList.remove('is-swapping');
    }, reduce ? 0 : 260);
    segs.forEach((s, k) => {
      s.classList.toggle('is-done', k < i);
      s.classList.toggle('is-current', k === i);
      s.style.setProperty('--p', 0);
    });
    cards.forEach((el, k) => el.classList.toggle('is-presenting', k === i));
  }

  // ---------- Rendu d'une frame ----------
  function renderCards() {
    const { R, pitch, y0, theta0, target, photoHalfW, photoBottom, cardW } = G;
    const presentIdx = mod(Math.round(S.progress));
    for (let i = 0; i < N; i++) {
      const rel = wrapRel(i - S.progress);
      const th = rel * STEP + theta0;
      let x = Math.sin(th) * R;
      let z = Math.cos(th) * R;
      let y = y0 + rel * pitch;
      let ry = (th * 180) / Math.PI;
      let s = 1;

      // Visibilité : fondu aux extrémités de l'hélice
      let op = 1 - smooth(5.2, 7.6, Math.abs(rel));
      // Profondeur : assombrir l'arrière
      let shade = (1 - (z / R + 1) / 2) * 0.62;
      // Cartes passant devant le visage : translucides
      if (z > 0 && y < photoBottom) {
        const ghost = 1 - smooth(photoHalfW - 30, photoHalfW + cardW * 0.55, Math.abs(x));
        op *= 1 - ghost * 0.72;
      }

      if (i === presentIdx && S.present > 0) {
        const p = S.present;
        x = lerp(x, target.x, p);
        y = lerp(y, target.y, p);
        z = lerp(z, target.z, p);
        ry = lerp(ry, 0, p);
        s = lerp(1, target.s, p);
        op = lerp(op, 1, p);
        shade = lerp(shade, 0, p);
      }

      const el = cards[i];
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.setProperty('--shade', shade.toFixed(3));
      el.style.pointerEvents = op < 0.2 ? 'none' : '';
      el.tabIndex = op < 0.2 ? -1 : 0;
    }
  }

  // ---------- Boucle ----------
  let last = performance.now();
  let raf = 0;
  function tick(now) {
    const dt = Math.min(now - last, 64);
    last = now;
    const paused = S.userPaused || S.hoverPaused || S.dialogOpen;

    if (S.dragging) {
      S.present = Math.max(0, S.present - dt / 200);
    } else if (S.phase === 'move') {
      S.elapsed += dt;
      const t = clamp(S.elapsed / S.moveDur, 0, 1);
      S.progress = lerp(S.from, S.to, easeInOut(t));
      S.present = Math.max(0, S.present - dt / 220);
      if (t >= 1) { S.phase = 'hold'; S.elapsed = 0; S.progress = S.to; }
    } else {
      if (!paused) S.elapsed += dt;
      const t = clamp(S.elapsed / HOLD, 0, 1);
      const rise = easeOut(clamp(t / 0.16, 0, 1));
      const fall = paused ? 0 : easeInOut(clamp((t - 0.86) / 0.14, 0, 1));
      const targetP = rise * (1 - fall);
      // si en pause : la carte reste présentée
      S.present = paused ? lerp(S.present, 1, 0.12) : targetP;
      const cur = segs[mod(Math.round(S.progress))];
      if (cur) cur.style.setProperty('--p', t.toFixed(3));
      if (t >= 1 && !paused) startMove(S.progress, Math.round(S.progress) + 1);
    }

    renderCards();
    if (S.visible) raf = requestAnimationFrame(tick);
  }

  new IntersectionObserver(([e]) => {
    S.visible = e.isIntersecting;
    if (S.visible) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  }, { rootMargin: '100px' }).observe(orbit);

  // ---------- Interactions ----------
  // Glisser pour faire tourner la spirale
  orbit.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    S.dragStartX = e.clientX;
    S.dragStartP = S.progress;
    S.moved = false;
    S.pointerDown = true;
  });
  addEventListener('pointermove', (e) => {
    if (!S.pointerDown) return;
    const dx = e.clientX - S.dragStartX;
    if (!S.dragging && Math.abs(dx) > 6) {
      S.dragging = true; S.moved = true;
      orbit.classList.add('is-dragging');
      try { orbit.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    }
    if (S.dragging) S.progress = S.dragStartP - dx / (G.mobile ? 70 : 110);
  });
  const endDrag = () => {
    if (!S.pointerDown) return;
    S.pointerDown = false;
    if (S.dragging) {
      S.dragging = false;
      orbit.classList.remove('is-dragging');
      startMove(S.progress, Math.round(S.progress), 600);
    }
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  // Parallaxe légère de la scène
  orbit.addEventListener('pointermove', (e) => {
    if (S.dragging || G.mobile) return;
    const r = orbit.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    scene.style.setProperty('--tilt-y', `${(nx * 10).toFixed(2)}deg`);
    scene.style.setProperty('--tilt-x', `${(-8 - ny * 8).toFixed(2)}deg`);
  });
  orbit.addEventListener('pointerleave', () => {
    scene.style.setProperty('--tilt-y', '0deg');
    scene.style.setProperty('--tilt-x', '-8deg');
  });

  // Clic sur une carte : amener + ouvrir
  cardsEl.addEventListener('click', (e) => {
    const card = e.target.closest('.ocard');
    if (!card || S.moved) { S.moved = false; return; }
    const i = Number(card.dataset.index);
    goTo(i);
    onOpen?.(certs[i]);
  });
  // Survol d'une carte : pause
  cardsEl.addEventListener('pointerover', (e) => { if (e.target.closest('.ocard')) S.hoverPaused = true; });
  cardsEl.addEventListener('pointerout', (e) => { if (e.target.closest('.ocard')) S.hoverPaused = false; });
  spot.addEventListener('pointerenter', () => (S.hoverPaused = true));
  spot.addEventListener('pointerleave', () => (S.hoverPaused = false));

  // Clavier
  orbit.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Enter' && e.target === orbit) onOpen?.(certs[mod(Math.round(S.progress))]);
  });

  ui.next.addEventListener('click', () => go(1));
  ui.prev.addEventListener('click', () => go(-1));
  ui.play.addEventListener('click', () => {
    S.userPaused = !S.userPaused;
    ui.play.setAttribute('aria-pressed', String(S.userPaused));
    ui.play.setAttribute('aria-label', S.userPaused ? 'Reprendre la présentation' : 'Mettre en pause la présentation');
  });
  ui.open.addEventListener('click', () => onOpen?.(certs[mod(Math.round(S.progress))]));

  if (reduce) {
    ui.play.setAttribute('aria-pressed', 'true');
    ui.play.setAttribute('aria-label', 'Reprendre la présentation');
  }

  updateSpotlight(0);
  renderCards();

  return {
    setDialogOpen(v) { S.dialogOpen = v; },
  };
}
