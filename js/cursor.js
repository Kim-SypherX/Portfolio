// ========================================
// CUSTOM CURSOR
// Magnetic cursor with glow and trail effects
// ========================================

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorGlow = document.querySelector('.cursor-glow');
        this.trailCanvas = document.getElementById('cursor-trail');
        this.trailCtx = this.trailCanvas.getContext('2d');

        this.mouse = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.trail = [];
        this.maxTrailLength = 20;

        this.isHovering = false;

        this.init();
    }

    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Hover effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-item, .about-panel');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.cursor.classList.add('hover');
            });

            el.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.cursor.classList.remove('hover');
            });
        });

        // Start animation loop
        this.animate();
    }

    resizeCanvas() {
        this.trailCanvas.width = window.innerWidth;
        this.trailCanvas.height = window.innerHeight;
    }

    updateCursor() {
        // Smooth cursor follow with easing
        const ease = 0.15;
        this.cursorPos.x += (this.mouse.x - this.cursorPos.x) * ease;
        this.cursorPos.y += (this.mouse.y - this.cursorPos.y) * ease;

        // Update cursor position
        this.cursor.style.left = `${this.cursorPos.x}px`;
        this.cursor.style.top = `${this.cursorPos.y}px`;

        // Add to trail
        this.trail.push({
            x: this.cursorPos.x,
            y: this.cursorPos.y,
            life: 1
        });

        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    drawTrail() {
        // Clear canvas
        this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

        // Draw trail
        this.trail.forEach((point, index) => {
            const opacity = (index / this.trail.length) * point.life;
            const size = (index / this.trail.length) * 8;

            const gradient = this.trailCtx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, size
            );

            gradient.addColorStop(0, `rgba(0, 240, 255, ${opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(0, 240, 255, 0)`);

            this.trailCtx.fillStyle = gradient;
            this.trailCtx.beginPath();
            this.trailCtx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.trailCtx.fill();

            // Decay life
            point.life *= 0.95;
        });

        // Remove dead points
        this.trail = this.trail.filter(point => point.life > 0.01);
    }

    animate() {
        this.updateCursor();
        this.drawTrail();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize cursor when DOM is ready
if (!Utils.device.isMobile()) {
    document.addEventListener('DOMContentLoaded', () => {
        new CustomCursor();
    });
}
