class PoolManager {
    constructor() {
        this.pools = new Map();
        this.activePool = null;
    }

    /**
     * Register a new pool implementation
     * @param {string} id - Unique identifier for the pool
     * @param {BasePool} poolInstance - Instance of a pool implementation
     */
    registerPool(id, poolInstance) {
        if (!(poolInstance instanceof BasePool)) {
            throw new Error('Pool instance must extend BasePool');
        }
        this.pools.set(id, poolInstance);
        // Set first registered pool as default if none active
        if (!this.activePool) {
            this.activePool = id;
        }
    }

    /**
     * Set the active pool
     * @param {string} poolId - ID of the pool to set as active
     */
    setActivePool(poolId) {
        if (!this.pools.has(poolId)) {
            throw new Error(`Pool '${poolId}' not found`);
        }
        this.activePool = poolId;
        localStorage.setItem('selectedPool', poolId);
    }

    /**
     * Get the active pool
     * @returns {BasePool} - The active pool instance
     */
    getActivePool() {
        return this.pools.get(this.activePool);
    }

    /**
     * Get stats from the currently active pool
     * @param {string} wallet - Wallet address to get stats for
     */
    async getStats(wallet) {
        const pool = this.getActivePool();
        if (!pool) {
            throw new Error('No active pool selected');
        }
        if (!pool.validateWalletAddress(wallet)) {
            throw new Error('Invalid wallet address format');
        }
        return pool.getStats(wallet);
    }

    /**
     * Get list of available pools
     * @returns {Array<{id: string, name: string, website: string}>}
     */
    getAvailablePools() {
        return Array.from(this.pools.entries()).map(([id, pool]) => ({
            id,
            name: pool.getPoolName()
        }));
    }

    /**
     * Initialize the pool manager with the last selected pool or default
     * @param {string} defaultPoolId - Default pool ID to use if none was previously selected
     */
    initialize(defaultPoolId) {
        // Try to load last used pool from localStorage
        const savedPool = localStorage.getItem('selectedPool');
        this.activePool = (savedPool && this.pools.has(savedPool)) ? savedPool : defaultPoolId;
        if (!this.pools.has(this.activePool)) {
            throw new Error(`Pool ${this.activePool} not found`);
        }
        localStorage.setItem('selectedPool', this.activePool);
    }
}