// ========================================
// ANIMATION CONTROLLER
// Smooth scroll, parallax, and intersection observers
// ========================================

class AnimationController {
    constructor() {
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollSpeed = 0;

        this.idleTimer = null;
        this.isIdle = false;
        this.idleDelay = 3000;

        this.init();
    }

    init() {
        this.setupSmoothScroll();
        this.setupIntersectionObserver();
        this.setupIdleDetection();
        this.setupSkillLevels();
        this.animate();
    }

    setupSmoothScroll() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');

                    // Trigger specific animations based on section
                    if (entry.target.classList.contains('about-panel')) {
                        this.animatePanel(entry.target);
                    } else if (entry.target.classList.contains('skill-item')) {
                        this.animateSkill(entry.target);
                    } else if (entry.target.classList.contains('project-card')) {
                        this.animateProject(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.about-panel, .skill-item, .project-card').forEach(el => {
            observer.observe(el);
        });
    }

    animatePanel(panel) {
        const delay = parseInt(panel.dataset.panel || 0) * 200;
        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, delay);
    }

    animateSkill(skill) {
        setTimeout(() => {
            skill.style.opacity = '1';
            skill.style.transform = 'translateX(0)';
        }, 100);
    }

    animateProject(project) {
        const delay = parseInt(project.dataset.project || 0) * 150;
        setTimeout(() => {
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
        }, delay);
    }

    setupSkillLevels() {
        const skillLevels = document.querySelectorAll('.skill-level');
        skillLevels.forEach(level => {
            const levelValue = level.dataset.level || 0;
            level.style.setProperty('--level', `${levelValue}%`);
        });
    }

    setupIdleDetection() {
        const resetIdleTimer = () => {
            clearTimeout(this.idleTimer);
            this.isIdle = false;
            document.body.classList.remove('idle');

            this.idleTimer = setTimeout(() => {
                this.isIdle = true;
                document.body.classList.add('idle');
                this.startIdleAnimations();
            }, this.idleDelay);
        };

        ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetIdleTimer);
        });

        resetIdleTimer();
    }

    startIdleAnimations() {
        // Subtle idle animations when user is inactive
        const panels = document.querySelectorAll('.about-panel');
        panels.forEach((panel, index) => {
            setTimeout(() => {
                panel.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    panel.style.transform = 'translateY(0)';
                }, 1000);
            }, index * 300);
        });
    }

    updateParallax() {
        const scrollPercent = Utils.getScrollPercentage();

        // Parallax effect on sections
        document.querySelectorAll('.section').forEach((section, index) => {
            const speed = (index % 2 === 0) ? 0.5 : -0.5;
            const yPos = scrollPercent * speed;
            section.style.transform = `translateY(${yPos}px)`;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth scroll interpolation
        this.targetScrollY = window.scrollY;
        this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;
        this.scrollSpeed = this.targetScrollY - this.scrollY;

        // Update parallax
        this.updateParallax();
    }
}

// Initialize animation controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
});
