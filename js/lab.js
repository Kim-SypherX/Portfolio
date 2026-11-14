// =============================================================
// LAB INTERACTIF — démos de vision par ordinateur dans le navigateur
//  · Naruto : hand tracking (Rasengan / Chidori)
//  · Dragon Ball Z : pose tracking (charge + Kamehameha)
// MediaPipe Tasks Vision (WASM/GPU) chargé à la demande.
// Tout est calculé localement : aucune image ne quitte l'appareil.
// =============================================================

const MP_VERSION = '0.10.21';
const VISION_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`;
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODELS = {
  hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  pose: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
};

const HAND_LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];
const POSE_LINKS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- Chargement paresseux de MediaPipe ----------
let visionPromise = null;
const landmarkers = {};
function loadVision() {
  visionPromise ??= import(/* @vite-ignore */ VISION_URL).then(async (mod) => ({
    mod,
    fileset: await mod.FilesetResolver.forVisionTasks(WASM_URL),
  }));
  return visionPromise;
}
async function getLandmarker(kind) {
  if (landmarkers[kind]) return landmarkers[kind];
  const { mod, fileset } = await loadVision();
  const Ctor = kind === 'hand' ? mod.HandLandmarker : mod.PoseLandmarker;
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath: MODELS[kind], delegate },
    runningMode: 'VIDEO',
    ...(kind === 'hand'
      ? { numHands: 2, minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6 }
      : { numPoses: 1, minPoseDetectionConfidence: 0.6, minPosePresenceConfidence: 0.6, minTrackingConfidence: 0.6 }),
  });
  try {
    landmarkers[kind] = await Ctor.createFromOptions(fileset, opts('GPU'));
  } catch (e) {
    console.warn('GPU indisponible, bascule CPU :', e);
    landmarkers[kind] = await Ctor.createFromOptions(fileset, opts('CPU'));
  }
  return landmarkers[kind];
}

function fxVideo(src) {
  const v = document.createElement('video');
  v.src = src;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'none';
  return v;
}
// Les vidéos d'effets ne sont téléchargées qu'au lancement d'une démo
const warm = (...vids) => vids.forEach((v) => { if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } });
const ready = (v) => v.readyState >= 2;

// =============================================================
// Expérience NARUTO
// =============================================================
function createNaruto() {
  const rasengan = fxVideo('assets/lab/naruto.mp4');
  const chidori = fxVideo('assets/lab/sasuke.mp4');
  const st = { pwr: [0, 0], open: [false, false], pos: [null, null], size: [80, 80], seen: false };

  function checkOpen(p) {
    let n = 0;
    for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) if (dist(p[tip], p[0]) > dist(p[pip], p[0])) n++;
    return n >= 3;
  }

  // idx 0 = Rasengan (main droite de l'utilisateur), idx 1 = Chidori (main gauche)
  function feed(idx, open, center, size) {
    if (open && !st.open[idx]) {
      const v = idx ? chidori : rasengan;
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    st.open[idx] = open;
    st.pwr[idx] = clamp(st.pwr[idx] + (open ? 0.06 : -0.15), 0, 1);
    if (center) {
      const prev = st.pos[idx];
      st.pos[idx] = prev ? { x: prev.x + (center.x - prev.x) * 0.55, y: prev.y + (center.y - prev.y) * 0.55 } : center;
      st.size[idx] += (size - st.size[idx]) * 0.3;
    }
  }

  return {
    id: 'naruto',
    kind: 'hand',
    title: 'Naruto — Rasengan & Chidori',
    kicker: 'Hand tracking · MediaPipe Hands',
    darken: 0.25,
    meterLabel: 'Chakra',
    start() { warm(rasengan, chidori); st.pwr = [0, 0]; st.open = [false, false]; st.pos = [null, null]; },
    stop() { rasengan.pause(); chidori.pause(); },
    fromCamera(res, map, ctx, showSkeleton) {
      const hands = res.landmarks || [];
      const labels = res.handedness || res.handednesses || [];
      const found = [false, false];
      hands.forEach((lm, i) => {
        const pts = lm.map(map);
        // Image non inversée → « Right » MediaPipe = main gauche réelle → Chidori
        const idx = labels[i]?.[0]?.categoryName === 'Right' ? 1 : 0;
        found[idx] = true;
        const size = dist(pts[0], pts[9]);
        const w = pts[0], k = pts[9];
        const center = idx
          ? { x: (w.x + k.x) / 2, y: (w.y + k.y) / 2 }
          : { x: k.x + (k.x - w.x) * 0.8, y: k.y + (k.y - w.y) * 0.8 };
        feed(idx, checkOpen(lm), center, size);
        if (showSkeleton) drawSkeleton(ctx, pts, HAND_LINKS, '#22d3ee');
      });
      for (const idx of [0, 1]) if (!found[idx]) feed(idx, false, null, 0);
      st.seen = hands.length > 0;
    },
    fromPointer(p) {
      feed(0, p.down && !p.alt, p.down && !p.alt ? { x: p.x, y: p.y } : null, p.unit);
      feed(1, p.down && p.alt, p.down && p.alt ? { x: p.x, y: p.y } : null, p.unit);
      st.seen = true;
    },
    draw(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      [[0, rasengan, 10, 0.45, '120, 200, 255'], [1, chidori, 13, 0.48, '140, 150, 255']].forEach(([idx, v, k, cy, rgb]) => {
        const a = st.pwr[idx];
        const pos = st.pos[idx];
        if (a < 0.01 || !pos) return;
        const s = st.size[idx];
        // Halo lumineux sous l'effet
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 2.6);
        g.addColorStop(0, `rgba(${rgb}, ${0.45 * a})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(pos.x - s * 3, pos.y - s * 3, s * 6, s * 6);
        if (ready(v)) {
          const w = s * k, h = w * (v.videoHeight / v.videoWidth);
          ctx.globalAlpha = a;
          ctx.drawImage(v, pos.x - w / 2, pos.y - h * cy, w, h);
        }
      });
      ctx.restore();
    },
    meter() { return Math.max(st.pwr[0], st.pwr[1]); },
    hint(mode) {
      if (st.pwr[0] > 0.6 && st.pwr[1] > 0.6) return '<b>Rasengan + Chidori</b> · le combo ultime 🔥';
      if (st.pwr[0] > 0.5) return '<b>RASENGAN !</b> · essayez l\u2019autre main pour le Chidori';
      if (st.pwr[1] > 0.5) return '<b>CHIDORI !</b> · essayez l\u2019autre main pour le Rasengan';
      if (mode === 'pointer') return 'Maintenez le clic pour le <b>Rasengan</b> · <kbd>Maj</kbd> + clic pour le <b>Chidori</b>';
      if (!st.seen) return 'Montrez vos mains à la caméra 👋';
      return 'Ouvrez grand la main ✋ · <b>droite</b> = Rasengan · <b>gauche</b> = Chidori';
    },
  };
}

// =============================================================
// Expérience DRAGON BALL Z (port JS de app.py)
// =============================================================
function createDBZ() {
  const energy = fxVideo('assets/lab/energy.mp4');
  const kame = fxVideo('assets/lab/kamehameha.mp4');
  const st = {
    state: 'IDLE', idle: 0, hand: null, dir: 1, unit: 120, charge: 0, flash: 0,
    seen: false, pointerFireUntil: 0, pointerDownAt: 0, wasDown: false,
  };

  function angle3d(a, b, c) {
    const v1 = [a.x - b.x, a.y - b.y, a.z - b.z];
    const v2 = [c.x - b.x, c.y - b.y, c.z - b.z];
    const m1 = Math.hypot(...v1), m2 = Math.hypot(...v2);
    if (!m1 || !m2) return 0;
    const cos = clamp((v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / (m1 * m2), -1, 1);
    return (Math.acos(cos) * 180) / Math.PI;
  }

  function setState(next, hand) {
    if (next === 'IDLE' && st.state !== 'IDLE') {
      st.idle++;
      if (st.idle < 5) next = st.state; // tolérance aux pertes de détection
    } else st.idle = 0;

    if (hand) st.hand = st.hand ? { x: st.hand.x * 0.5 + hand.x * 0.5, y: st.hand.y * 0.5 + hand.y * 0.5 } : hand;
    else if (next === 'IDLE') st.hand = null;

    if (next === 'CHARGING' && st.state !== 'CHARGING') { energy.currentTime = 0; energy.play().catch(() => {}); }
    if (next === 'FIRING' && st.state !== 'FIRING') { kame.currentTime = 0; kame.play().catch(() => {}); st.flash = 1; }
    st.state = next;
  }

  return {
    id: 'dbz',
    kind: 'pose',
    title: 'Dragon Ball Z — Kamehameha',
    kicker: 'Pose tracking · MediaPipe Pose',
    darken: 0.5,
    meterLabel: 'Ki',
    start() { warm(energy, kame); Object.assign(st, { state: 'IDLE', idle: 0, hand: null, charge: 0, flash: 0, pointerFireUntil: 0 }); },
    stop() { energy.pause(); kame.pause(); },
    fromCamera(res, map, ctx, showSkeleton) {
      const lm = res.landmarks?.[0];
      st.seen = !!lm;
      let next = 'IDLE', hand = null;
      if (lm) {
        const [ls, rs, le, re, lw, rw] = [lm[11], lm[12], lm[13], lm[14], lm[15], lm[16]];
        const P = (i) => map(lm[i]);
        st.unit = dist(P(11), P(12)) || st.unit;
        if (showSkeleton) drawSkeleton(ctx, lm.map(map), POSE_LINKS, '#f2c46d', [11, 12, 13, 14, 15, 16]);
        if ((lw.visibility ?? 1) > 0.4 || (rw.visibility ?? 1) > 0.4) {
          const wd = Math.hypot(lw.x - rw.x, lw.y - rw.y);
          if (wd < (st.state === 'FIRING' ? 0.5 : 0.35)) {
            const ang = Math.max(angle3d(ls, le, lw), angle3d(rs, re, rw));
            if (ang > (st.state === 'FIRING' ? 120 : 135)) {
              next = 'FIRING';
              hand = (lw.visibility ?? 1) > (rw.visibility ?? 1) ? P(15) : P(16);
            } else {
              next = 'CHARGING';
              const a = P(15), b = P(16);
              hand = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            }
            // Direction du tir : du centre des épaules vers les mains
            if (next !== 'FIRING' || st.state !== 'FIRING') {
              const mid = (P(11).x + P(12).x) / 2;
              if (Math.abs(hand.x - mid) > st.unit * 0.15) st.dir = hand.x > mid ? 1 : -1;
            }
          }
        }
      }
      setState(next, hand);
    },
    fromPointer(p, now) {
      st.unit = p.unit * 2.2;
      st.seen = true;
      let next = 'IDLE';
      if (p.down) {
        if (!st.wasDown) st.pointerDownAt = now;
        next = 'CHARGING';
      } else if (st.wasDown && now - st.pointerDownAt > 350) {
        st.pointerFireUntil = now + 2400;
      }
      if (!p.down && now < st.pointerFireUntil) next = 'FIRING';
      st.wasDown = p.down;
      if (next !== 'FIRING') st.dir = p.x > p.w / 2 ? -1 : 1;
      st.idle = 10; // pas de tolérance en mode souris
      setState(next, next === 'IDLE' ? null : { x: p.x, y: p.y });
    },
    draw(ctx, cw, ch) {
      if (st.state === 'CHARGING') st.charge = Math.min(1, st.charge + 0.012);
      else if (st.state === 'FIRING') st.charge = Math.max(0.15, st.charge - 0.004);
      else st.charge = Math.max(0, st.charge - 0.02);
      st.flash *= 0.88;

      const h = st.hand;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (h && st.state === 'CHARGING') {
        const size = Math.max(ch * 0.2, st.unit * 1.15) * (0.75 + st.charge * 0.5);
        const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, size);
        g.addColorStop(0, `rgba(140, 220, 255, ${0.35 + st.charge * 0.3})`);
        g.addColorStop(1, 'rgba(140, 220, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(h.x - size, h.y - size, size * 2, size * 2);
        if (ready(energy)) ctx.drawImage(energy, h.x - size / 2, h.y - size / 2, size, size);
      } else if (h && st.state === 'FIRING' && ready(kame)) {
        const bh = Math.max(ch * 0.45, st.unit * 2.4);
        const bw = bh * (kame.videoWidth / kame.videoHeight);
        ctx.translate(h.x, h.y);
        ctx.scale(st.dir, 1);
        ctx.drawImage(kame, -bw * 0.04, -bh / 2, bw, bh);
      }
      ctx.restore();
      if (st.flash > 0.02) {
        ctx.fillStyle = `rgba(200, 240, 255, ${st.flash * 0.5})`;
        ctx.fillRect(0, 0, cw, ch);
      }
    },
    shake() { return st.state === 'FIRING' ? 5 : st.state === 'CHARGING' ? st.charge * 1.5 : 0; },
    meter() { return st.charge; },
    hint(mode) {
      if (st.state === 'FIRING') return '<b>HAAAAAAAA !!!</b>';
      if (st.state === 'CHARGING') return mode === 'pointer'
        ? '<b>Ka… me… ha… me…</b> · relâchez pour tirer !'
        : '<b>Ka… me… ha… me…</b> · tendez les bras pour tirer !';
      if (mode === 'pointer') return 'Maintenez le clic pour charger, relâchez pour lancer le <b>Kamehameha</b>';
      if (!st.seen) return 'Reculez : le haut du corps (épaules → mains) doit être visible';
      return 'Rapprochez vos <b>poignets</b> pour charger le ki 🔵';
    },
  };
}

function drawSkeleton(ctx, pts, links, color, only) {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (const [a, b] of links) { ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); }
  ctx.stroke();
  ctx.fillStyle = '#fff';
  (only || pts.map((_, i) => i)).forEach((i) => {
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// =============================================================
// Contrôleur de la scène (dialog plein écran)
// =============================================================
export function initLab({ onOpen, onClose } = {}) {
  const dlg = document.getElementById('lab-dialog');
  if (!dlg) return;
  const $ = (id) => document.getElementById(id);
  const canvas = $('lab-canvas');
  const ctx = canvas.getContext('2d');
  const ui = {
    title: $('lab-dialog-title'), kicker: $('lab-kicker'), status: $('lab-status'), statusText: $('lab-status-text'),
    statusActions: $('lab-status-actions'), hint: $('lab-hint'), meter: $('lab-meter-fill'), meterLabel: $('lab-meter-label'),
    skeleton: $('lab-skeleton'), close: $('lab-close'), mode: $('lab-mode'), retry: $('lab-retry'), pointerBtn: $('lab-pointer'),
  };
  const experiments = { naruto: createNaruto(), dbz: createDBZ() };
  const cam = document.createElement('video');
  cam.muted = true;
  cam.playsInline = true;

  const S = { exp: null, stream: null, raf: 0, mode: 'camera', skeleton: true, lastVideoTime: -1, res: null, session: 0, hint: '' };
  const pointer = { x: 0, y: 0, down: false, alt: false, unit: 70, w: 1 };

  function setStatus(text, { busy = false, error = false, actions = false } = {}) {
    ui.status.hidden = !text;
    ui.status.classList.toggle('is-busy', busy);
    ui.status.classList.toggle('is-error', error);
    ui.statusText.textContent = text || '';
    ui.statusActions.hidden = !actions;
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    pointer.unit = Math.min(canvas.width, canvas.height) * 0.09;
    pointer.w = canvas.width;
  }
  new ResizeObserver(() => dlg.open && resize()).observe(canvas);

  function stopCamera() {
    S.stream?.getTracks().forEach((t) => t.stop());
    S.stream = null;
    cam.srcObject = null;
  }

  async function startCamera() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw Object.assign(new Error('insecure'), { name: 'InsecureContext' });
    }
    S.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
    });
    cam.srcObject = S.stream;
    await cam.play();
  }

  function cameraError(err) {
    const msg = {
      NotAllowedError: 'Accès à la webcam refusé.',
      NotFoundError: 'Aucune webcam détectée sur cet appareil.',
      NotReadableError: 'La webcam est déjà utilisée par une autre application.',
      InsecureContext: 'La webcam nécessite une connexion sécurisée (https).',
    }[err?.name] || 'Impossible de démarrer la démo.';
    setStatus(`${msg} Vous pouvez réessayer ou jouer à la souris.`, { error: true, actions: true });
  }

  async function launch(id) {
    const exp = experiments[id];
    if (!exp) return;
    const session = ++S.session;
    S.exp = exp;
    S.mode = 'camera';
    S.res = null;
    exp.start();
    ui.title.textContent = exp.title;
    ui.kicker.textContent = exp.kicker;
    ui.meterLabel.textContent = exp.meterLabel;
    dlg.dataset.exp = id;
    dlg.classList.remove('is-pointer');
    if (!dlg.open) { dlg.showModal(); onOpen?.(); }
    resize();
    loop();
    try {
      setStatus('Activation de la webcam…', { busy: true });
      await startCamera();
      if (session !== S.session) return;
      setStatus('Chargement du modèle de vision (une seule fois)…', { busy: true });
      await getLandmarker(exp.kind);
      if (session !== S.session) return;
      setStatus('');
    } catch (err) {
      if (session !== S.session) return;
      console.warn('Lab :', err);
      stopCamera();
      cameraError(err);
    }
  }

  function usePointer() {
    stopCamera();
    S.mode = 'pointer';
    dlg.classList.add('is-pointer');
    setStatus('');
  }

  function close() {
    S.session++;
    cancelAnimationFrame(S.raf);
    stopCamera();
    S.exp?.stop();
    canvas.style.transform = '';
  }

  // ---------- Boucle de rendu ----------
  function loop() {
    cancelAnimationFrame(S.raf);
    const frame = (now) => {
      if (!dlg.open) return;
      const cw = canvas.width, ch = canvas.height;
      const exp = S.exp;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      const live = S.mode === 'camera' && S.stream && cam.readyState >= 2;
      if (live) {
        // Webcam en miroir, cadrage « cover »
        const vw = cam.videoWidth, vh = cam.videoHeight;
        const sc = Math.max(cw / vw, ch / vh);
        const dw = vw * sc, dh = vh * sc, ox = (cw - dw) / 2, oy = (ch - dh) / 2;
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(cam, ox, oy, dw, dh);
        ctx.restore();
        ctx.fillStyle = `rgba(4, 5, 12, ${exp.darken})`;
        ctx.fillRect(0, 0, cw, ch);

        const lmk = landmarkers[exp.kind];
        if (lmk && cam.currentTime !== S.lastVideoTime) {
          S.lastVideoTime = cam.currentTime;
          try { S.res = lmk.detectForVideo(cam, now); } catch (e) { console.warn(e); }
        }
        const map = (p) => ({ x: cw - (ox + p.x * dw), y: oy + p.y * dh, z: p.z });
        if (S.res) exp.fromCamera(S.res, map, ctx, S.skeleton);
      } else {
        // Fond animé (chargement ou mode souris)
        const g = ctx.createRadialGradient(cw / 2, ch * 0.45, 0, cw / 2, ch * 0.45, Math.max(cw, ch) * 0.7);
        g.addColorStop(0, '#141a3a');
        g.addColorStop(1, '#04050b');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cw, ch);
        ctx.strokeStyle = 'rgba(120, 160, 255, .07)';
        ctx.lineWidth = 1;
        const step = 48 * (cw / canvas.clientWidth || 1), off = (now * 0.02) % step;
        ctx.beginPath();
        for (let x = -off; x < cw; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, ch); }
        for (let y = off; y < ch; y += step) { ctx.moveTo(0, y); ctx.lineTo(cw, y); }
        ctx.stroke();
        if (S.mode === 'pointer') exp.fromPointer(pointer, now);
      }

      exp.draw(ctx, cw, ch);
      const sh = exp.shake?.() || 0;
      canvas.style.transform = sh ? `translate(${(Math.random() - 0.5) * sh}px, ${(Math.random() - 0.5) * sh}px)` : '';
      ui.meter.style.transform = `scaleX(${exp.meter().toFixed(3)})`;
      const hint = exp.hint(S.mode);
      if (S.hint !== hint) { S.hint = hint; ui.hint.innerHTML = hint; }
      S.raf = requestAnimationFrame(frame);
    };
    S.raf = requestAnimationFrame(frame);
  }

  // ---------- Interactions ----------
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * canvas.width;
    pointer.y = ((e.clientY - r.top) / r.height) * canvas.height;
  };
  canvas.addEventListener('pointermove', toCanvas);
  canvas.addEventListener('pointerdown', (e) => {
    toCanvas(e);
    pointer.down = true;
    pointer.alt = e.shiftKey || e.button === 2;
    canvas.setPointerCapture?.(e.pointerId);
  });
  const up = () => { pointer.down = false; };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  ui.close.addEventListener('click', () => dlg.close());
  ui.retry.addEventListener('click', () => S.exp && launch(S.exp.id));
  ui.pointerBtn.addEventListener('click', usePointer);
  ui.mode.addEventListener('click', () => (S.mode === 'pointer' ? launch(S.exp.id) : usePointer()));
  ui.skeleton.addEventListener('click', () => {
    S.skeleton = !S.skeleton;
    ui.skeleton.setAttribute('aria-pressed', String(S.skeleton));
  });
  dlg.addEventListener('close', () => { close(); onClose?.(); });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lab]');
    if (!btn) return;
    e.preventDefault();
    launch(btn.dataset.lab);
  });

  // Préchargement discret de MediaPipe quand la section Lab approche
  const section = document.getElementById('lab');
  if (section) {
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
      idle(() => loadVision().catch(() => { visionPromise = null; }));
    }, { rootMargin: '400px' }).observe(section);
  }

  return { launch };
}
