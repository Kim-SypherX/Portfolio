// =============================================================
// MAIN — orchestration du portfolio
// =============================================================
import { CERTIFICATIONS, PROJECTS, SKILL_TAGS } from './data.js';
import { initCertOrbit } from './certs.js';
import { initSkillSphere } from './sphere.js';
import { initLab } from './lab.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

document.body.classList.add('is-loading');

// ---------- Rendu des projets ----------
function renderProjects() {
  const featured = $('#featured-projects');
  const grid = $('#grid-projects');
  const chipLabel = { ia: 'IA', web: 'Web', mobile: 'Mobile', backend: 'Backend', '3d': '3D' };

  featured.innerHTML = PROJECTS.filter((p) => p.featured).map((p, i) => `
    <article class="fproject" style="--accent:${p.accent}" aria-labelledby="fp-${p.id}">
      <div class="fproject__media" data-parallax data-side="${i % 2 ? 1 : -1}" data-cursor="Explorer">
        <div class="fproject__img"><img src="${p.img}" alt="Visuel du projet ${p.name}" width="1200" height="896" loading="lazy" decoding="async"></div>
        <span class="fproject__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="fproject__chip">${p.tags.map((t) => chipLabel[t]).join(' · ')}</span>
      </div>
      <div class="fproject__info">
        <p class="fproject__kicker" data-reveal>${p.kicker}</p>
        <h3 class="fproject__name" id="fp-${p.id}" data-reveal>${p.name}</h3>
        <p class="fproject__desc" data-reveal>${p.desc}</p>
        <ul class="fproject__hl" data-reveal>${p.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
        <div class="stack" data-reveal>${p.stack.map((s) => `<span>${s}</span>`).join('')}</div>
      </div>
    </article>`).join('');

  grid.innerHTML = PROJECTS.filter((p) => !p.featured).map((p) => `
    <article class="pcard glass ${p.demo ? 'pcard--demo' : ''}" data-tags="${p.tags.join(' ')}" data-tilt data-reveal>
      <div class="pcard__media ${p.img ? '' : 'pcard__media--art'}">
        ${p.img ? `<img src="${p.img}" alt="Visuel du projet ${p.name}" loading="lazy" decoding="async" width="1200" height="750">` : `<span class="grad-text">${p.name}</span>`}
        ${p.demo ? `<span class="pcard__live"><i></i>Jouable en live</span>` : ''}
      </div>
      <div class="pcard__body">
        <p class="pcard__kicker">${p.kicker}</p>
        <h4 class="pcard__name">${p.name}${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" aria-label="Visiter ${p.name}">Visiter ↗</a>` : ''}</h4>
        <p class="pcard__desc">${p.desc}</p>
        <div class="stack">${p.stack.map((s) => `<span>${s}</span>`).join('')}</div>
        ${p.demo ? `<button class="btn btn--primary btn--sm pcard__play" type="button" data-lab="${p.demo}">Tester avec ma webcam ▶</button>` : ''}
      </div>
    </article>`).join('');
}

// ---------- Split text 3D ----------
function splitText(root) {
  let i = 0;
  const walk = (node, target) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const parts = n.textContent.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { target.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'word';
          [...part].forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = ch;
            c.style.setProperty('--i', i++);
            w.appendChild(c);
          });
          target.appendChild(w);
        });
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const clone = n.cloneNode(false);
        target.appendChild(clone);
        walk(n, clone);
      }
    });
  };
  const label = root.textContent.replace(/\s+/g, ' ').trim();
  const frag = document.createElement(root.tagName);
  walk(root, frag);
  root.innerHTML = '';
  root.append(...frag.childNodes);
  root.setAttribute('aria-label', label);
  $$('.word', root).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  root.classList.add('is-split');
}

// ---------- Reveal au scroll ----------
function initReveal() {
  // Décalage en cascade entre éléments frères
  const groups = new Map();
  $$('[data-reveal]').forEach((el) => {
    const p = el.parentElement;
    const k = groups.get(p) || 0;
    el.style.setProperty('--rd', `${Math.min(k, 6) * 90}ms`);
    groups.set(p, k + 1);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], [data-split]:not(.hero__title .line)').forEach((el) => io.observe(el));
}

// ---------- Loader ----------
function runLoader(onDone) {
  const loader = $('#loader');
  const bar = $('#loader-bar');
  const count = $('#loader-count');
  let p = 0, loaded = document.readyState === 'complete';
  addEventListener('load', () => (loaded = true));
  const start = performance.now();
  const step = () => {
    const elapsed = performance.now() - start;
    const cap = loaded ? 100 : 90;
    p += (cap - p) * (loaded ? 0.18 : 0.05);
    if (elapsed > 3500) p = 100;
    const v = Math.min(100, Math.round(p));
    bar.style.width = `${v}%`;
    count.textContent = v;
    if (v >= 100 && elapsed > 700) {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      onDone();
      return;
    }
    requestAnimationFrame(step);
  };
  if (reduce) { loader.classList.add('is-done'); document.body.classList.remove('is-loading'); onDone(); return; }
  requestAnimationFrame(step);
}

// ---------- Curseur ----------
function initCursor() {
  if (!fine) return;
  const cur = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('.cursor__label');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cur.classList.remove('is-hidden'); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
  const loop = () => {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    const hov = e.target.closest('a, button, [data-tilt], .sphere__tag');
    cur.classList.toggle('is-label', !!lab);
    label.textContent = lab ? lab.dataset.cursor : '';
    cur.classList.toggle('is-hover', !lab && !!hov);
  });
}

// ---------- Navigation ----------
function initNav() {
  const nav = $('#nav');
  const burger = $('#nav-burger');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 600 && !nav.classList.contains('is-open'));
    lastY = y;
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('[data-link]').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  const links = new Map($$('[data-link]').map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.remove('is-active'));
        links.get(e.target.id)?.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

// ---------- Compteurs ----------
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const end = Number(el.dataset.count);
      const dur = reduce ? 0 : 1800;
      const t0 = performance.now();
      const step = (now) => {
        const t = dur ? Math.min((now - t0) / dur, 1) : 1;
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => io.observe(el));
}

// ---------- Rotateur de rôles (machine à écrire) ----------
function initRotator() {
  const el = $('#role-rotator');
  const words = ['plateformes full stack', 'assistants IA locaux', 'expériences 3D temps réel', 'apps mobiles Flutter', 'API Spring Boot robustes'];
  if (reduce) return;
  let w = 0, c = words[0].length, del = true;
  const tick = () => {
    const word = words[w];
    c += del ? -1 : 1;
    el.textContent = word.slice(0, c);
    let delay = del ? 35 : 70;
    if (!del && c === word.length) { del = true; delay = 2200; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 3200);
}

// ---------- Boutons magnétiques ----------
function initMagnetic() {
  if (!fine || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// ---------- Tilt 3D + reflet ----------
function initTilt() {
  if (!fine || reduce) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest('[data-tilt]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    el.classList.add('is-tilting');
    el.style.setProperty('--ry', `${(nx - 0.5) * 10}deg`);
    el.style.setProperty('--rx', `${(0.5 - ny) * 10}deg`);
    el.style.setProperty('--mx', `${nx * 100}%`);
    el.style.setProperty('--my', `${ny * 100}%`);
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest('[data-tilt]');
    if (!el || el.contains(e.relatedTarget)) return;
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });

  // Médias des projets vedettes : la rotation 3D au survol est appliquée
  // par la boucle de mouvement (initMotion) via des cibles lissées.
  $$('[data-parallax]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el._hx = ((e.clientX - r.left) / r.width - 0.5);
      el._hy = ((e.clientY - r.top) / r.height - 0.5);
    });
    el.addEventListener('pointerleave', () => { el._hx = 0; el._hy = 0; });
  });
}

// ---------- Smooth scroll (Lenis, amélioration progressive) ----------
const smooth = { lenis: null };
async function initSmoothScroll() {
  if (reduce) return;
  try {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    smooth.lenis = lenis;
    if (document.body.classList.contains('is-loading')) lenis.stop();
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // Ancres internes : défilement fluide avec compensation de la barre de nav
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id === '#' ? null : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#hero' ? 0 : -64, duration: 1.6 });
      history.replaceState(null, '', id);
    });
  } catch (err) {
    console.warn('Smooth scroll indisponible :', err);
  }
}

// ---------- Moteur de mouvement lié au scroll ----------
function initMotion() {
  const heroContent = $('.hero__content');
  const heroStatus = $('.hero__status');
  const marquee = $('.marquee');
  const medias = $$('[data-parallax]');
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  // Seuls les médias proches de l'écran sont calculés
  const active = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target)));
  }, { rootMargin: '20% 0px' });
  medias.forEach((m) => {
    m._hx = 0; m._hy = 0; m._cx = 0; m._cy = 0;
    io.observe(m);
  });

  if (reduce) return;

  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine) addEventListener('pointermove', (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  let lastY = scrollY, vel = 0, heroDone = false;
  const frame = () => {
    const y = scrollY;
    const vh = innerHeight;
    vel += ((y - lastY) - vel) * 0.12;
    lastY = y;
    smx += (mx - smx) * 0.06;
    smy += (my - smy) * 0.06;

    // Hero : recul 3D + fondu au scroll, inclinaison suivant la souris
    if (y < vh * 1.3 || !heroDone) {
      heroDone = y >= vh * 1.3;
      const p = clamp01(y / (vh * 0.9));
      heroContent.style.transform = `perspective(1400px) translate3d(0, ${(-p * 140).toFixed(1)}px, ${(-p * 220).toFixed(1)}px) rotateX(${(p * 14 - smy * 5).toFixed(2)}deg) rotateY(${(smx * 7).toFixed(2)}deg)`;
      heroContent.style.opacity = (1 - p * 1.15).toFixed(3);
      if (heroStatus) heroStatus.style.translate = `${(smx * -24).toFixed(1)}px ${(smy * -18 - p * 60).toFixed(1)}px`;
    }

    // Marquee : inclinaison selon la vitesse de défilement
    if (marquee) marquee.style.setProperty('--skew', `${Math.max(-14, Math.min(14, vel * -0.35)).toFixed(2)}deg`);

    // Projets vedettes : entrée 3D + parallaxe interne + clip
    const reads = [];
    active.forEach((el) => reads.push([el, el.getBoundingClientRect()]));
    reads.forEach(([el, r]) => {
      const enter = ease(clamp01((vh - r.top) / (vh * 0.8)));
      const center = (r.top + r.height / 2 - vh / 2) / vh;
      const side = Number(el.dataset.side) || 1;
      el._cx += (el._hx - el._cx) * 0.1;
      el._cy += (el._hy - el._cy) * 0.1;
      el.style.setProperty('--sx', `${((1 - enter) * 28 - el._cy * 12).toFixed(2)}deg`);
      el.style.setProperty('--sy', `${((1 - enter) * 18 * side + el._cx * 12).toFixed(2)}deg`);
      el.style.setProperty('--sz', `${((1 - enter) * -260).toFixed(1)}px`);
      el.style.setProperty('--enter', enter.toFixed(3));
      el.style.setProperty('--iy', `${(center * -46).toFixed(1)}px`);
      el.style.setProperty('--px', `${(-el._cx * 20).toFixed(1)}px`);
      el.style.setProperty('--py', `${(-el._cy * 20).toFixed(1)}px`);
    });

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ---------- Filtres projets ----------
function initFilters() {
  const btns = $$('.filter');
  const cards = $$('.pcard');
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    btns.forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    let k = 0;
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.tags.split(' ').includes(f);
      c.classList.toggle('is-filtered', !show);
      c.classList.remove('is-entering');
      if (show) {
        c.style.setProperty('--i', k++);
        void c.offsetWidth;
        c.classList.add('is-entering', 'is-in');
      }
    });
  }));
}

// ---------- Timeline ----------
function initTimeline() {
  const tl = $('#timeline');
  const fill = $('#timeline-fill');
  const update = () => {
    const r = tl.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
    fill.style.height = `${p * 100}%`;
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

// ---------- Lightbox certificat ----------
function initDialog(orbitApi) {
  const dlg = $('#cert-dialog');
  const media = $('#cert-dialog-media');
  const verify = $('#cert-dialog-verify');
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dlg.addEventListener('click', (e) => {
      if (e.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) dlg.close();
    });
  }
  dlg.addEventListener('close', () => {
    orbitApi?.current?.setDialogOpen(false);
    smooth.lenis?.start();
  });
  return (c) => {
    $('#cert-dialog-title').textContent = c.title;
    $('#cert-dialog-issuer').textContent = `${c.issuer} · ${c.platform}`;
    $('#cert-dialog-meta').textContent = `${c.date} · ${c.meta}`;
    media.innerHTML = c.img
      ? `<img src="${c.img}.webp" alt="Certificat ${c.title} délivré par ${c.issuer}">`
      : `<div class="ocard__fallback"><small>${c.issuer}</small><b>${c.title}</b><small>${c.date} — certificat vérifiable sur demande</small></div>`;
    if (c.verify) { verify.href = c.verify; verify.hidden = false; } else { verify.hidden = true; }
    orbitApi?.current?.setDialogOpen(true);
    smooth.lenis?.stop();
    dlg.showModal();
  };
}

// ---------- Copier l'e-mail ----------
function initCopy() {
  const btn = $('#copy-email');
  const toast = $('#copy-toast');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('yargajosaphat@gmail.com');
      toast.textContent = 'Adresse copiée ✓';
    } catch {
      toast.textContent = 'yargajosaphat@gmail.com';
    }
    toast.classList.add('is-on');
    setTimeout(() => toast.classList.remove('is-on'), 2000);
  });
}

// ---------- Démarrage ----------
renderProjects();
$$('[data-split]').forEach(splitText);
$('#year').textContent = new Date().getFullYear();

initNav();
initCursor();
initCounters();
initMagnetic();
initTilt();
initFilters();
initTimeline();
initCopy();
initSkillSphere($('#skills-sphere'), SKILL_TAGS);
initSmoothScroll();
initMotion();

const orbitApi = { current: null };
const openCert = initDialog(orbitApi);
orbitApi.current = initCertOrbit({ certs: CERTIFICATIONS, onOpen: openCert });

// Lab interactif (Naruto / DBZ) : on fige le smooth scroll pendant la démo
initLab({
  onOpen: () => { smooth.lenis?.stop(); document.body.classList.add('is-lab'); },
  onClose: () => { smooth.lenis?.start(); document.body.classList.remove('is-lab'); },
});

// Scène 3D chargée dynamiquement (le site reste fonctionnel si le CDN échoue)
import('./hero3d.js')
  .then((m) => m.initHero3D($('#hero-canvas')))
  .catch((err) => console.warn('Hero 3D indisponible :', err));

runLoader(() => {
  smooth.lenis?.start();
  $$('.hero__title .line').forEach((l, k) => {
    l.style.setProperty('--d', `${k * 220}ms`);
    $$('.char', l).forEach((c) => c.style.setProperty('--d', `${k * 220}ms`));
    l.classList.add('is-in');
  });
  initReveal();
  initRotator();
});
