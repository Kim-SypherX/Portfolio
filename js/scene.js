// ========================================
// THREE.JS SCENE MANAGER
// Main 3D scene, camera, lighting, and rendering
// ========================================

class SceneManager {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };

        this.particles = [];
        this.lights = [];

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupParticles();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0f, 0);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Cyan point light
        const cyanLight = new THREE.PointLight(0x00f0ff, 2, 20);
        cyanLight.position.set(-5, 5, 5);
        this.scene.add(cyanLight);
        this.lights.push(cyanLight);

        // Magenta point light
        const magentaLight = new THREE.PointLight(0xff00ff, 2, 20);
        magentaLight.position.set(5, -5, 5);
        this.scene.add(magentaLight);
        this.lights.push(magentaLight);

        // Purple spotlight
        const purpleLight = new THREE.SpotLight(0xb000ff, 1);
        purpleLight.position.set(0, 10, 10);
        purpleLight.angle = Math.PI / 6;
        purpleLight.penumbra = 0.5;
        this.scene.add(purpleLight);
        this.lights.push(purpleLight);
    }

    setupParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0x00f0ff),
            new THREE.Color(0xff00ff),
            new THREE.Color(0xb000ff)
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 50;
            positions[i3 + 1] = (Math.random() - 0.5) * 50;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    setupEventListeners() {
        // Mouse move for camera control
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            this.targetRotation.x = this.mouse.y * 0.1;
            this.targetRotation.y = this.mouse.x * 0.1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Scroll for depth effect
        window.addEventListener('scroll', () => {
            const scrollPercent = Utils.getScrollPercentage();
            this.camera.position.z = 5 + (scrollPercent / 100) * 2;
        });
    }

    updateCamera() {
        // Smooth camera rotation with inertia
        const ease = 0.05;
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * ease;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * ease;

        this.camera.rotation.x = this.currentRotation.x;
        this.camera.rotation.y = this.currentRotation.y;
    }

    updateParticles() {
        const time = this.clock.getElapsedTime();

        // Rotate particle system
        this.particleSystem.rotation.y = time * 0.05;

        // Animate individual particles
        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    updateLights() {
        const time = this.clock.getElapsedTime();

        // Animate lights
        this.lights[0].position.x = Math.sin(time * 0.5) * 5;
        this.lights[0].position.y = Math.cos(time * 0.5) * 5;

        this.lights[1].position.x = Math.cos(time * 0.7) * 5;
        this.lights[1].position.y = Math.sin(time * 0.7) * 5;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.updateCamera();
        this.updateParticles();
        this.updateLights();

        this.renderer.render(this.scene, this.camera);

        // Update performance monitor
        Utils.performance.update();
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }
}

// Initialize scene when loading is complete
window.addEventListener('loadingComplete', () => {
    window.sceneManager = new SceneManager();
});
