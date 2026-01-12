// ========================================
// UTILITY FUNCTIONS
// Performance, easing, and helper utilities
// ========================================

const Utils = {
    // Easing functions
    easing: {
        easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
        easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
        easeOutElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeOutBack: (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
    },

    // Linear interpolation
    lerp: (start, end, t) => start * (1 - t) + end * t,

    // Clamp value between min and max
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    // Map value from one range to another
    map: (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    // Random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,

    // Random integer between min and max
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Get scroll percentage
    getScrollPercentage: () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Performance monitoring
    performance: {
        fps: 0,
        frames: 0,
        lastTime: performance.now(),
        
        update: function() {
            this.frames++;
            const currentTime = performance.now();
            if (currentTime >= this.lastTime + 1000) {
                this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
                this.frames = 0;
                this.lastTime = currentTime;
            }
        },
        
        getFPS: function() {
            return this.fps;
        }
    },

    // Device detection
    device: {
        isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: () => /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent),
        isDesktop: () => !Utils.device.isMobile() && !Utils.device.isTablet(),
        hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        getGPU: () => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return null;
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null;
        }
    },

    // Color utilities
    color: {
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            } : null;
        },
        
        rgbToHex: (r, g, b) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    },

    // Vector utilities
    vector: {
        distance: (x1, y1, x2, y2) => {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },
        
        normalize: (x, y) => {
            const length = Math.sqrt(x * x + y * y);
            return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
        }
    }
};

// Export for use in other modules
window.Utils = Utils;
