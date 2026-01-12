// ========================================
// PROJECTS SECTION
// Interactive 3D project cards
// ========================================

class ProjectsSection {
    constructor() {
        this.container = document.getElementById('projects-3d-container');
        this.scene = null;
        this.projectObjects = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        window.addEventListener('loadingComplete', () => {
            this.setup3DProjects();
            this.setupCardInteractions();
            this.animate();
        });
    }

    setup3DProjects() {
        if (!window.sceneManager) return;

        this.scene = window.sceneManager.getScene();

        // Create 3D card frames
        const cardGeometry = new THREE.BoxGeometry(2.5, 1.8, 0.1);
        const cardMaterial = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 3; i++) {
            const card = new THREE.Mesh(cardGeometry, cardMaterial);

            card.position.set(
                (i - 1) * 4,
                -25,
                -3
            );

            // Add wireframe
            const edgesGeometry = new THREE.EdgesGeometry(cardGeometry);
            const edgesMaterial = new THREE.LineBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.6
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            card.add(edges);

            card.userData.baseY = card.position.y;
            card.userData.index = i;

            this.scene.add(card);
            this.projectObjects.push(card);
        }
    }

    setupCardInteractions() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                if (this.projectObjects[index]) {
                    this.projectObjects[index].userData.hovered = true;
                }
            });

            card.addEventListener('mouseleave', () => {
                if (this.projectObjects[index]) {
                    this.projectObjects[index].userData.hovered = false;
                }
            });
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate project cards
        this.projectObjects.forEach((card, index) => {
            const hoverOffset = card.userData.hovered ? 0.5 : 0;
            const targetY = card.userData.baseY + Math.sin(time + index) * 0.2 + hoverOffset;

            card.position.y += (targetY - card.position.y) * 0.1;
            card.rotation.y = Math.sin(time * 0.5 + index) * 0.1;

            if (card.userData.hovered) {
                card.rotation.z += 0.01;
            } else {
                card.rotation.z *= 0.95;
            }
        });
    }
}

// Initialize projects section
new ProjectsSection();
