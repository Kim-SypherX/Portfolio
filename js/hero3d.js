// =============================================================
// HERO 3D — Galaxie de particules + noyau organique (Three.js)
// =============================================================
import * as THREE from 'three';

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

export function initHero3D(canvas) {
  if (!canvas) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060b, 0.045);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9);

  const root = new THREE.Group();
  scene.add(root);

  // ---------- Galaxie de particules ----------
  const COUNT = innerWidth < 700 ? 6000 : 14000;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const rnd = new Float32Array(COUNT);
  const cA = new THREE.Color('#8b5cf6'), cB = new THREE.Color('#22d3ee'), cC = new THREE.Color('#f2c46d');
  const ARMS = 4;
  for (let i = 0; i < COUNT; i++) {
    const r = Math.pow(Math.random(), 1.6) * 11 + 0.6;
    const arm = (i % ARMS) / ARMS * Math.PI * 2;
    const spin = r * 0.55;
    const spread = 0.35 + r * 0.06;
    const rx = (Math.random() - 0.5) * spread * 2.2;
    const ry = (Math.random() - 0.5) * spread * 0.7;
    const rz = (Math.random() - 0.5) * spread * 2.2;
    pos[i * 3] = Math.cos(arm + spin) * r + rx;
    pos[i * 3 + 1] = ry;
    pos[i * 3 + 2] = Math.sin(arm + spin) * r + rz;
    const t = Math.min(r / 11, 1);
    const c = t < 0.5 ? cB.clone().lerp(cA, t * 2) : cA.clone().lerp(cC, (t - 0.5) * 2 * 0.6);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    rnd[i] = Math.random();
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  gGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  gGeo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const gMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uTime: { value: 0 }, uPixel: { value: renderer.getPixelRatio() }, uScroll: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uPixel; uniform float uScroll;
      attribute float aRnd; varying vec3 vColor; varying float vAlpha;
      void main(){
        vec3 p = position;
        float r = length(p.xz);
        float ang = atan(p.z, p.x) + uTime * (0.06 + 0.25 / (r + 1.0)) + uScroll * 1.2;
        p.x = cos(ang) * r; p.z = sin(ang) * r;
        p.y += sin(uTime * 0.8 + aRnd * 6.2831) * 0.06;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (aRnd * 2.2 + 0.8) * uPixel * (14.0 / -mv.z);
        vColor = color;
        vAlpha = 0.45 + 0.55 * sin(uTime * 1.5 + aRnd * 40.0) * 0.5 + 0.25;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }`,
  });
  const galaxy = new THREE.Points(gGeo, gMat);
  galaxy.rotation.x = 0.42;
  root.add(galaxy);

  // ---------- Noyau organique (blob iridescent) ----------
  const core = new THREE.Group();
  root.add(core);
  const blobMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 }, uHover: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uHover;
      varying vec3 vNormal; varying vec3 vView; varying float vDisp;
      ${NOISE}
      void main(){
        float n = snoise(normal * 1.4 + uTime * 0.35);
        float n2 = snoise(normal * 3.2 - uTime * 0.25) * 0.35;
        float disp = (n + n2) * (0.28 + uHover * 0.18);
        vDisp = disp;
        vec3 p = position + normal * disp;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; varying vec3 vNormal; varying vec3 vView; varying float vDisp;
      void main(){
        float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
        vec3 a = vec3(0.545, 0.361, 0.965);
        vec3 b = vec3(0.133, 0.827, 0.933);
        vec3 c = vec3(0.949, 0.769, 0.427);
        float t = 0.5 + 0.5 * sin(vDisp * 6.0 + uTime * 0.6 + vNormal.y * 2.0);
        vec3 col = mix(a, b, t);
        col = mix(col, c, smoothstep(0.75, 1.0, fres) * 0.6);
        vec3 base = vec3(0.02, 0.025, 0.06);
        vec3 outc = base + col * (0.25 + fres * 1.35);
        gl_FragColor = vec4(outc, 0.92);
      }`,
  });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 48), blobMat);
  core.add(blob);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.05, 1)),
    new THREE.LineBasicMaterial({ color: 0x8b9dff, transparent: true, opacity: 0.16 })
  );
  core.add(wire);

  const ringMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.DoubleSide });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.008, 8, 200), ringMat(0x22d3ee, 0.55));
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.006, 8, 200), ringMat(0x8b5cf6, 0.45));
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.005, 8, 200), ringMat(0xf2c46d, 0.3));
  ring1.rotation.set(1.2, 0.2, 0); ring2.rotation.set(1.5, -0.5, 0.3); ring3.rotation.set(0.9, 0.7, -0.2);
  core.add(ring1, ring2, ring3);

  // Satellites
  const sats = [];
  const satGeo = new THREE.SphereGeometry(0.05, 16, 16);
  [[ring1, 0x22d3ee], [ring2, 0x8b5cf6], [ring3, 0xf2c46d]].forEach(([ring, c], k) => {
    const s = new THREE.Mesh(satGeo, new THREE.MeshBasicMaterial({ color: c }));
    ring.add(s);
    sats.push({ mesh: s, r: ring.geometry.parameters.radius, speed: 0.5 + k * 0.22, off: k * 2 });
  });

  // ---------- Layout / resize ----------
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const mobile = w < 900;
    core.position.set(mobile ? 0 : 3.1, mobile ? 1.4 : 0.1, 0);
    core.scale.setScalar(mobile ? 0.62 : 1);
    blobMat.uniforms.uTime.value += 0;
  }
  layout();
  new ResizeObserver(layout).observe(canvas);

  // ---------- Interactions ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  let hover = 0, hoverT = 0;
  canvas.parentElement.addEventListener('pointerenter', () => (hoverT = 1));
  canvas.parentElement.addEventListener('pointerleave', () => (hoverT = 0));

  let scrollP = 0;
  addEventListener('scroll', () => {
    scrollP = Math.min(scrollY / innerHeight, 1.5);
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(canvas);

  const clock = new THREE.Clock();
  let raf = 0;
  function render() {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    hover += (hoverT - hover) * 0.04;

    gMat.uniforms.uTime.value = t;
    gMat.uniforms.uScroll.value = scrollP;
    blobMat.uniforms.uTime.value = t;
    blobMat.uniforms.uHover.value = hover;

    core.rotation.y = t * 0.15 + mouse.x * 0.4;
    core.rotation.x = mouse.y * 0.25;
    wire.rotation.y = -t * 0.1;
    wire.rotation.z = t * 0.05;
    ring1.rotation.z = t * 0.2; ring2.rotation.z = -t * 0.15; ring3.rotation.z = t * 0.1;
    sats.forEach((s) => {
      const a = t * s.speed + s.off;
      s.mesh.position.set(Math.cos(a) * s.r, Math.sin(a) * s.r, 0);
    });

    camera.position.x = mouse.x * 0.8;
    camera.position.y = 0.6 - mouse.y * 0.5 + scrollP * 1.2;
    camera.position.z = 9 + scrollP * 3;
    camera.lookAt(0, scrollP * 0.6, 0);
    root.rotation.z = scrollP * 0.15;

    renderer.render(scene, camera);
  }
  function loop() {
    cancelAnimationFrame(raf);
    if (!visible) return;
    render();
    if (!reduce) raf = requestAnimationFrame(loop);
  }
  loop();
}
