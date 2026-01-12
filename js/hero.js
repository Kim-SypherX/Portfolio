// ========================================
// HERO SECTION
// 3D holographic name with glitch effects
// ========================================

class HeroSection {
    constructor() {
        this.container = document.getElementById('hero-3d-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.hologramMesh = null;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // Wait for scene manager to be ready
        window.addEventListener('loadingComplete', () => {
            this.setupHologram();
            this.animate();
        });
    }

    setupHologram() {
        if (!window.sceneManager) return;

        this.scene = window.sceneManager.getScene();

        // Create 3D text geometry for name
        this.createHologramText();

        // Create floating geometric shapes
        this.createFloatingShapes();
    }

    createHologramText() {
        // Create extruded text geometry
        const textGroup = new THREE.Group();

        // Create simple geometric representation of text
        // Using boxes to represent letters (simplified for performance)
        const letterGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
        const hologramMaterial = new THREE.ShaderMaterial({
            uniforms: HologramShader.uniforms,
            vertexShader: HologramShader.vertexShader,
            fragmentShader: HologramShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Create letter blocks
        for (let i = 0; i < 8; i++) {
            const letter = new THREE.Mesh(letterGeometry, hologramMaterial);
            letter.position.x = (i - 3.5) * 0.7;
            letter.position.y = 0;
            textGroup.add(letter);
        }

        textGroup.position.set(0, 0, 0);
        this.scene.add(textGroup);
        this.hologramMesh = textGroup;

        // Add edge glow
        const edgesGeometry = new THREE.EdgesGeometry(letterGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 8; i++) {
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            edges.position.x = (i - 3.5) * 0.7;
            textGroup.add(edges);
        }
    }

    createFloatingShapes() {
        const shapes = [];
        const geometries = [
            new THREE.OctahedronGeometry(0.3),
            new THREE.TetrahedronGeometry(0.3),
            new THREE.IcosahedronGeometry(0.3)
        ];

        const material = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });

        for (let i = 0; i < 15; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const shape = new THREE.Mesh(geometry, material);

            shape.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10 - 5
            );

            shape.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            shape.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };

            this.scene.add(shape);
            shapes.push(shape);
        }

        this.floatingShapes = shapes;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        if (this.hologramMesh) {
            // Rotate hologram
            this.hologramMesh.rotation.y = time * 0.3;
            this.hologramMesh.position.y = Math.sin(time * 0.5) * 0.2;

            // Update shader time
            this.hologramMesh.children.forEach(child => {
                if (child.material && child.material.uniforms) {
                    child.material.uniforms.time.value = time;
                }
            });
        }

        // Animate floating shapes
        if (this.floatingShapes) {
            this.floatingShapes.forEach(shape => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;

                shape.position.y += Math.sin(time + shape.position.x) * 0.001;
            });
        }
    }
}

// Initialize hero section
new HeroSection();
