import { CookieUtil, NumberAnimator, HashAnimator, ThemeManager } from './utils.js';
import { PoolManager } from './pools/pool-manager.js';
import { SupportXMRPool } from './pools/supportxmr-pool.js';
import { NanoPool } from './pools/nanopool.js';
import { MoneroOceanPool } from './pools/moneroocean.js';
import { XMRPoolEU } from './pools/xmrpool-eu.js';

class DashboardApp {
    constructor() {
        try {
            this.initializeElements();
            this.initializeServices();
            this.setupEventListeners();
            this.start();
        } catch (err) {
            this.showFatalError(err);
        }
    }

    initializeElements() {
        // Form elements
        this.walletFormContainer = document.getElementById('walletFormContainer');
        this.walletForm = document.getElementById('walletForm');
        this.walletInput = document.getElementById('walletInput');
        this.walletToggleBtn = document.getElementById('walletToggleBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.themeIcon = this.themeToggleBtn?.querySelector('.material-icons-outlined');
        this.poolSelect = document.getElementById('poolSelect');

        // Stats elements
        this.statsInfoDiv = document.getElementById('statsInfo');
        this.loadingMessageDiv = document.getElementById('loadingMessage');
        this.paidEl = document.getElementById('paid');
        this.pendingEl = document.getElementById('pending');
        this.metricsEl = document.getElementById('metrics');
        this.hashesEl = document.getElementById('hashes');
        this.miningHashEl = document.getElementById('mining-hash');

        // Tambahan pengecekan elemen
        if (!this.walletFormContainer || !this.walletForm || !this.walletInput || !this.walletToggleBtn || !this.themeToggleBtn || !this.themeIcon || !this.poolSelect || !this.statsInfoDiv || !this.loadingMessageDiv || !this.paidEl || !this.pendingEl || !this.metricsEl || !this.hashesEl || !this.miningHashEl) {
            throw new Error('Beberapa elemen DOM tidak ditemukan. Pastikan semua id pada HTML sesuai dengan yang di JavaScript.');
        }
    }

    initializeServices() {
        // Initialize managers
        this.poolManager = new PoolManager();
        this.themeManager = new ThemeManager();
        this.hashAnimator = new HashAnimator(this.miningHashEl);

        // Register all available pools
        this.poolManager.registerPool('supportxmr', new SupportXMRPool());
        this.poolManager.registerPool('nanopool', new NanoPool());
        this.poolManager.registerPool('moneroocean', new MoneroOceanPool());
        this.poolManager.registerPool('xmrpool-eu', new XMRPoolEU());
        
        // Initialize with default pool
        this.poolManager.initialize('supportxmr');

        // Setup pool selector
        this.updatePoolSelector();

        // Load saved wallet
        this.currentWallet = CookieUtil.get('xmrWallet');
        if (this.currentWallet) {
            this.walletInput.value = this.currentWallet;
        }
    }

    setupEventListeners() {
        // Wallet form events
        this.walletForm.addEventListener('submit', (e) => this.handleWalletSubmit(e));
        this.walletToggleBtn.addEventListener('click', () => this.toggleWalletForm());

        // Theme toggle
        this.themeToggleBtn.addEventListener('click', () => this.handleThemeToggle());

        // Pool selection
        this.poolSelect?.addEventListener('change', (e) => this.handlePoolChange(e));

        // Click outside wallet form
        document.addEventListener('click', (event) => {
            if (!this.walletFormContainer.contains(event.target) && 
                !this.walletToggleBtn.contains(event.target) && 
                this.walletFormContainer.classList.contains('visible')) {
                this.toggleWalletForm(false);
            }
        });
    }

    updatePoolSelector() {
        if (!this.poolSelect) return;
        const pools = this.poolManager.getAvailablePools();
        this.poolSelect.innerHTML = pools.map(pool => 
            `<option value="${pool.id}" ${this.poolManager.activePool === pool.id ? 'selected' : ''}>${pool.name}</option>`
        ).join('');
        // Pastikan poolSelect visible
        this.poolSelect.style.display = pools.length > 0 ? 'block' : 'none';
    }

    handleWalletSubmit(e) {
        e.preventDefault();
        const newWallet = this.walletInput.value.trim();
        if (newWallet && newWallet !== this.currentWallet) {
            this.currentWallet = newWallet;
            CookieUtil.set('xmrWallet', this.currentWallet);
            this.initDashboard();
        }
        this.toggleWalletForm(false);
    }

    handlePoolChange(e) {
        this.poolManager.setActivePool(e.target.value);
        this.initDashboard();
    }

    handleThemeToggle() {
        const newTheme = this.themeManager.toggleTheme();
        if (this.themeIcon) {
            this.themeIcon.textContent = newTheme === 'dark' ? 'dark_mode' : 'light_mode';
        }
        this.themeToggleBtn.setAttribute('aria-label', `Toggle ${newTheme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }

    toggleWalletForm(show = null) {
        const isVisible = show ?? !this.walletFormContainer.classList.contains('visible');
        this.walletFormContainer.classList.toggle('visible', isVisible);
        this.walletToggleBtn.setAttribute('aria-expanded', isVisible.toString());
        if (isVisible) {
            setTimeout(() => this.walletInput.focus(), 100);
        }
    }

    showLoading(message = "Memuat data...") {
        this.statsInfoDiv.querySelectorAll('.stat-item').forEach(el => el.style.display = 'none');
        this.loadingMessageDiv.textContent = message;
        this.loadingMessageDiv.className = 'loading-message';
        this.loadingMessageDiv.style.display = 'block';
    }

    showError(message = "Gagal mengambil data. Coba lagi nanti.") {
        this.statsInfoDiv.querySelectorAll('.stat-item').forEach(el => el.style.display = 'none');
        this.loadingMessageDiv.textContent = message;
        this.loadingMessageDiv.className = 'error-message';
        this.loadingMessageDiv.style.display = 'block';
        if (this.dashboardInterval) {
            clearInterval(this.dashboardInterval);
            this.dashboardInterval = null;
        }
    }

    showStats() {
        this.statsInfoDiv.querySelectorAll('.stat-item').forEach(el => el.style.display = 'block');
        this.loadingMessageDiv.style.display = 'none';
    }

    async fetchData(isAutoRefresh = false) {
        if (!this.currentWallet || this.isFetching) return;
        this.isFetching = true;
        
        if (!isAutoRefresh) this.showLoading();

        try {
            const stats = await this.poolManager.getStats(this.currentWallet);

            const paidAmount = (stats.amtPaid || 0) / 1e12;
            const pendingAmount = (stats.amtDue || 0) / 1e12;
            const hashrate = parseFloat(stats.hashrate || 0);
            const validShares = parseInt(stats.validShares || 0);
            const invalidShares = parseInt(stats.invalidShares || 0);
            const totalHashes = parseInt(stats.totalHashes || 0);

            this.showStats();

            NumberAnimator.animate(this.paidEl, paidAmount, { decimals: 12, suffix: " XMR", isAutoRefresh });
            NumberAnimator.animate(this.pendingEl, pendingAmount, { decimals: 12, suffix: " XMR", isAutoRefresh });
            NumberAnimator.animate(this.metricsEl, Math.round(hashrate), {
                decimals: 0,
                suffix: ` H/s - ${validShares.toLocaleString('en-US')}/${invalidShares.toLocaleString('en-US')}`,
                isAutoRefresh
            });
            NumberAnimator.animate(this.hashesEl, totalHashes, { decimals: 0, useCommas: true, isAutoRefresh });

        } catch (error) {
            console.error("Fetch error:", error);
            this.showError(error.message || "Gagal mengambil data.");
        } finally {
            this.isFetching = false;
        }
    }

    initDashboard() {
        if (this.dashboardInterval) clearInterval(this.dashboardInterval);
        if (!this.currentWallet) {
            this.showLoading("Masukkan alamat wallet XMR Anda...");
            return;
        }
        this.fetchData(false);
        const refreshInterval = 30000;
        this.dashboardInterval = setInterval(() => this.fetchData(true), refreshInterval);
    }

    start() {
        // Start hash animation
        this.hashAnimator.start(500);

        // Initialize dashboard if wallet exists
        if (this.currentWallet) {
            this.initDashboard();
        } else {
            this.showLoading("Masukkan alamat wallet XMR untuk memulai.");
        }
    }

    showFatalError(message) {
        if (typeof message === 'object' && message.message) message = message.message;
        document.body.innerHTML = `<div style="color:red;padding:2rem;text-align:center;font-size:1.2rem;">Terjadi error fatal: ${message}<br>Silakan cek console browser (F12) untuk detail error.</div>`;
        console.error('Fatal error:', message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardApp();
});