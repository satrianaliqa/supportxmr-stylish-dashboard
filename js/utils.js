// Utility functions for the dashboard

/**
 * Handle cookie operations
 */
const CookieUtil = {
    set: function(name, value, days = 365) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/; SameSite=Lax${secureFlag}`;
    },

    get: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return '';
    }
};

/**
 * Animated number display
 */
class NumberAnimator {
    static animate(element, targetValue, options = {}) {
        const {
            decimals = 0,
            duration = 800,
            isAutoRefresh = false,
            suffix = "",
            useCommas = false
        } = options;

        const effectiveDuration = isAutoRefresh ? 500 : duration;
        const frameRate = 30;
        const totalFrames = Math.round(effectiveDuration / frameRate);
        let currentFrame = 0;

        let startValue = 0;
        const currentText = element.textContent.replace(suffix, '').replace(/,/g, '').trim();
        if (!isNaN(parseFloat(currentText))) {
            startValue = useCommas ? parseInt(currentText) || 0 : parseFloat(currentText) || 0;
        }

        const range = targetValue - startValue;

        if (Math.abs(range) < (1 / Math.pow(10, decimals)) && decimals > 0) {
            element.textContent = this.formatNumber(targetValue, decimals, useCommas) + suffix;
            return;
        }
        if (range === 0 && decimals === 0) {
            element.textContent = this.formatNumber(targetValue, decimals, useCommas) + suffix;
            return;
        }

        if (element.animationInterval) {
            clearInterval(element.animationInterval);
        }

        element.animationInterval = setInterval(() => {
            currentFrame++;
            const progress = this.easeOutQuad(currentFrame / totalFrames);
            let currentValue = startValue + range * progress;

            let displayValue = currentValue;
            if (currentFrame < totalFrames * 0.7) {
                const randomFactor = (Math.random() - 0.5) * range * 0.2;
                const jitterValue = currentValue + randomFactor;
                displayValue = Math.max(0, jitterValue);
                if (decimals === 0) displayValue = Math.round(displayValue);
            } else {
                displayValue = currentValue;
            }

            element.textContent = this.formatNumber(displayValue, decimals, useCommas) + suffix;

            if (currentFrame >= totalFrames) {
                clearInterval(element.animationInterval);
                element.animationInterval = null;
                element.textContent = this.formatNumber(targetValue, decimals, useCommas) + suffix;
            }
        }, frameRate);
    }

    static formatNumber(value, decimals, useCommas) {
        if (useCommas) {
            return Number(value.toFixed(0)).toLocaleString('en-US');
        } else if (decimals > 0) {
            return value.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        } else {
            return Math.round(value).toString();
        }
    }

    static easeOutQuad(t) {
        return t * (2 - t);
    }
}

/**
 * Hash animation for visual effect
 */
class HashAnimator {
    constructor(element) {
        this.element = element;
        this.updateTimeout = null;
    }

    getRandomHex(length) {
        const hexChars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += hexChars[Math.floor(Math.random() * hexChars.length)];
        }
        return result;
    }

    update() {
        this.element.classList.add('hash-updating');
        this.element.textContent = this.getRandomHex(64);

        if (this.updateTimeout) clearTimeout(this.updateTimeout);

        this.updateTimeout = setTimeout(() => {
            this.element.classList.remove('hash-updating');
        }, 250);
    }

    start(interval = 500) {
        this.interval = setInterval(() => this.update(), interval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

/**
 * Theme manager
 */
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }
}

export { CookieUtil, NumberAnimator, HashAnimator, ThemeManager };