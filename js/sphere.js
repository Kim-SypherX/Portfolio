// =============================================================
// SPHÈRE 3D DE COMPÉTENCES — nuage de tags (DOM + maths 3D)
// =============================================================

export function initSkillSphere(el, tags) {
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = tags.length;
  const palette = ['#c4b5fd', '#67e8f9', '#f2c46d', '#eef0ff'];

  // Points répartis sur une sphère de Fibonacci
  const pts = tags.map((t, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    const span = document.createElement('span');
    span.className = 'sphere__tag';
    span.textContent = t;
    span.style.color = palette[i % palette.length];
    el.appendChild(span);
    return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r, el: span };
  });

  let radius = 200;
  const measure = () => { radius = el.clientWidth * 0.4; };
  measure();
  new ResizeObserver(measure).observe(el);

  let ax = 0.0025, ay = 0.004; // vitesses angulaires
  let tx = ax, ty = ay;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ty = nx * 0.03;
    tx = -ny * 0.03;
  });
  el.addEventListener('pointerleave', () => { tx = 0.0025; ty = 0.004; });

  let visible = false, raf = 0;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  }).observe(el);

  function rotate(p, a, b) {
    // rotation autour de X (a) puis Y (b)
    const cosA = Math.cos(a), sinA = Math.sin(a), cosB = Math.cos(b), sinB = Math.sin(b);
    const y1 = p.y * cosA - p.z * sinA;
    const z1 = p.y * sinA + p.z * cosA;
    const x2 = p.x * cosB + z1 * sinB;
    const z2 = -p.x * sinB + z1 * cosB;
    p.x = x2; p.y = y1; p.z = z2;
  }

  function draw() {
    for (const p of pts) {
      const scale = (p.z + 2) / 3; // 0.33 → 1
      const op = 0.18 + ((p.z + 1) / 2) * 0.82;
      p.el.style.transform = `translate3d(${(p.x * radius).toFixed(1)}px, ${(p.y * radius).toFixed(1)}px, 0) scale(${(scale * 1.15).toFixed(3)})`;
      p.el.style.opacity = op.toFixed(3);
      p.el.style.zIndex = String(Math.round(p.z * 100) + 100);
      p.el.style.fontSize = `${(0.8 + scale * 0.35).toFixed(3)}rem`;
    }
  }

  function frame() {
    ax += (tx - ax) * 0.05;
    ay += (ty - ay) * 0.05;
    if (!reduce) for (const p of pts) rotate(p, ax, ay);
    draw();
    if (visible && !reduce) raf = requestAnimationFrame(frame);
  }
  draw();
}
