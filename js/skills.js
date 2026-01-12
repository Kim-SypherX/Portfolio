// ========================================
// SKILLS SECTION
// 3D skill icons with orbital arrangement
// ========================================

class SkillsSection {
    constructor() {
        this.container = document.getElementById('skills-3d-container');
        this.scene = null;
        this.skillObjects = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        window.addEventListener('loadingComplete', () => {
            this.setup3DSkills();
            this.animate();
        });
    }

    setup3DSkills() {
        if (!window.sceneManager) return;

        this.scene = window.sceneManager.getScene();

        // Create 3D skill representations
        const skillGeometries = [
            new THREE.OctahedronGeometry(0.4),
            new THREE.TetrahedronGeometry(0.4),
            new THREE.IcosahedronGeometry(0.4),
            new THREE.DodecahedronGeometry(0.4)
        ];

        const skillCount = 8;
        const radius = 4;

        for (let i = 0; i < skillCount; i++) {
            const angle = (i / skillCount) * Math.PI * 2;
            const geometry = skillGeometries[i % skillGeometries.length];

            const material = new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? 0x00f0ff : 0xff00ff,
                emissive: i % 2 === 0 ? 0x00f0ff : 0xff00ff,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.6,
                wireframe: true
            });

            const skill = new THREE.Mesh(geometry, material);

            skill.position.set(
                Math.cos(angle) * radius,
                -15 + Math.sin(i) * 2,
                Math.sin(angle) * radius - 5
            );

            skill.userData.angle = angle;
            skill.userData.radius = radius;
            skill.userData.baseY = skill.position.y;

            this.scene.add(skill);
            this.skillObjects.push(skill);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Orbital animation
        this.skillObjects.forEach((skill, index) => {
            const angle = skill.userData.angle + time * 0.2;
            const radius = skill.userData.radius;

            skill.position.x = Math.cos(angle) * radius;
            skill.position.z = Math.sin(angle) * radius - 5;
            skill.position.y = skill.userData.baseY + Math.sin(time + index) * 0.3;

            skill.rotation.x += 0.01;
            skill.rotation.y += 0.01;
        });
    }
}

// Initialize skills section
new SkillsSection();
