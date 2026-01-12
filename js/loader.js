// ========================================
// LOADING SCREEN
// Cinematic loading with progress tracking
// ========================================

class Loader {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.querySelector('.loading-progress');
        this.loadingPercentage = document.querySelector('.loading-percentage');

        this.progress = 0;
        this.targetProgress = 0;

        this.init();
    }

    init() {
        // Simulate asset loading
        this.simulateLoading();
    }

    simulateLoading() {
        const loadSteps = [
            { delay: 200, progress: 20, text: 'Loading assets...' },
            { delay: 400, progress: 40, text: 'Initializing 3D engine...' },
            { delay: 600, progress: 60, text: 'Compiling shaders...' },
            { delay: 800, progress: 80, text: 'Building scene...' },
            { delay: 1000, progress: 100, text: 'Ready' }
        ];

        let currentStep = 0;

        const loadNext = () => {
            if (currentStep < loadSteps.length) {
                const step = loadSteps[currentStep];

                setTimeout(() => {
                    this.setProgress(step.progress);
                    document.querySelector('.loading-text').textContent = step.text;
                    currentStep++;
                    loadNext();
                }, step.delay);
            } else {
                setTimeout(() => this.complete(), 500);
            }
        };

        loadNext();
    }

    setProgress(target) {
        this.targetProgress = target;
        this.animateProgress();
    }

    animateProgress() {
        const ease = 0.1;
        this.progress += (this.targetProgress - this.progress) * ease;

        this.loadingProgress.style.width = `${this.progress}%`;
        this.loadingPercentage.textContent = `${Math.round(this.progress)}%`;

        if (Math.abs(this.targetProgress - this.progress) > 0.5) {
            requestAnimationFrame(() => this.animateProgress());
        } else {
            this.progress = this.targetProgress;
            this.loadingProgress.style.width = `${this.progress}%`;
            this.loadingPercentage.textContent = `${Math.round(this.progress)}%`;
        }
    }

    complete() {
        this.loadingScreen.classList.add('hidden');

        // Trigger entrance animations
        document.body.classList.add('loaded');

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('loadingComplete'));
    }
}

// Initialize loader
document.addEventListener('DOMContentLoaded', () => {
    new Loader();
});
