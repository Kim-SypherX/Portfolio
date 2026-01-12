// ========================================
// MAIN APPLICATION
// Initialize and coordinate all modules
// ========================================

class PortfolioApp {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        // Wait for loading to complete
        window.addEventListener('loadingComplete', () => {
            this.onLoadComplete();
        });

        // Setup global event listeners
        this.setupGlobalEvents();
    }

    onLoadComplete() {
        this.initialized = true;
        console.log('Portfolio initialized');
        console.log('GPU:', Utils.device.getGPU());
        console.log('Device:', Utils.device.isDesktop() ? 'Desktop' : 'Mobile');

        // Start performance monitoring
        this.startPerformanceMonitoring();
    }

    setupGlobalEvents() {
        // Prevent right-click on canvas
        document.getElementById('webgl-canvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPageHidden();
            } else {
                this.onPageVisible();
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    onPageHidden() {
        // Pause animations when page is hidden to save resources
        console.log('Page hidden - pausing animations');
    }

    onPageVisible() {
        // Resume animations when page is visible
        console.log('Page visible - resuming animations');
    }

    startPerformanceMonitoring() {
        // Log FPS every 5 seconds in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setInterval(() => {
                const fps = Utils.performance.getFPS();
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                }
            }, 5000);
        }
    }

    cleanup() {
        // Cleanup resources before page unload
        if (window.sceneManager) {
            const renderer = window.sceneManager.getRenderer();
            if (renderer) {
                renderer.dispose();
            }
        }
    }
}

// Initialize application
new PortfolioApp();
