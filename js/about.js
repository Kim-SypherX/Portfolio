// ========================================
// ABOUT SECTION
// Floating 3D panels in space
// ========================================

class AboutSection {
    constructor() {
        this.container = document.getElementById('about-3d-container');
        this.scene = null;
        this.panels3D = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        window.addEventListener('loadingComplete', () => {
            this.setup3DPanels();
            this.animate();
        });
    }

    setup3DPanels() {
        if (!window.sceneManager) return;

        this.scene = window.sceneManager.getScene();

        // Create 3D panel representations
        const panelGeometry = new THREE.PlaneGeometry(2, 1.5);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 3; i++) {
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);

            panel.position.set(
                (i - 1) * 3,
                -5,
                -2
            );

            panel.rotation.y = (i - 1) * 0.2;

            // Add wireframe edges
            const edgesGeometry = new THREE.EdgesGeometry(panelGeometry);
            const edgesMaterial = new THREE.LineBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.5
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            panel.add(edges);

            this.scene.add(panel);
            this.panels3D.push(panel);
        }

        // Create connecting particles
        this.createConnectingLines();
    }

    createConnectingLines() {
        const points = [];
        this.panels3D.forEach(panel => {
            points.push(panel.position);
        });

        for (let i = 0; i < points.length - 1; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                points[i],
                points[i + 1]
            ]);

            const material = new THREE.LineBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                opacity: 0.3
            });

            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate panels
        this.panels3D.forEach((panel, index) => {
            panel.position.y = -5 + Math.sin(time + index) * 0.3;
            panel.rotation.y = (index - 1) * 0.2 + Math.sin(time * 0.5) * 0.1;
        });
    }
}

// Initialize about section
new AboutSection();
