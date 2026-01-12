// ========================================
// CONTACT SECTION
// Futuristic terminal interface
// ========================================

class ContactSection {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.response = document.getElementById('form-response');
        this.inputs = document.querySelectorAll('.form-input');

        this.init();
    }

    init() {
        this.setupFormHandling();
        this.setupInputEffects();
        this.setup3DElements();
    }

    setupFormHandling() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Simulate form submission
        this.showResponse('success', '> Message transmitted successfully!');

        // Reset form
        setTimeout(() => {
            this.form.reset();
            this.hideResponse();
        }, 3000);
    }

    showResponse(type, message) {
        this.response.textContent = message;
        this.response.classList.add('show');
        this.response.style.borderLeftColor = type === 'success' ? '#00ff88' : '#ff0080';
        this.response.style.color = type === 'success' ? '#00ff88' : '#ff0080';
    }

    hideResponse() {
        this.response.classList.remove('show');
    }

    setupInputEffects() {
        this.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.createScanlineEffect(input);
            });

            input.addEventListener('input', (e) => {
                this.createTypingEffect(e.target);
            });
        });
    }

    createScanlineEffect(input) {
        input.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.3)';
    }

    createTypingEffect(input) {
        // Add subtle glow on typing
        input.style.borderColor = '#00f0ff';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 100);
    }

    setup3DElements() {
        window.addEventListener('loadingComplete', () => {
            if (!window.sceneManager) return;

            const scene = window.sceneManager.getScene();

            // Create holographic grid
            const gridHelper = new THREE.GridHelper(10, 10, 0x00f0ff, 0xff00ff);
            gridHelper.position.y = -35;
            gridHelper.position.z = -5;
            gridHelper.material.transparent = true;
            gridHelper.material.opacity = 0.3;
            scene.add(gridHelper);

            // Animate grid
            const animateGrid = () => {
                requestAnimationFrame(animateGrid);
                gridHelper.rotation.y += 0.001;
            };
            animateGrid();
        });
    }
}

// Initialize contact section
document.addEventListener('DOMContentLoaded', () => {
    new ContactSection();
});
