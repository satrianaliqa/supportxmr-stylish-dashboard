class PoolManager {
    constructor() {
        this.pools = new Map();
        this.currentPool = null;
    }

    /**
     * Register a new pool implementation
     * @param {string} id - Unique identifier for the pool
     * @param {BasePool} poolInstance - Instance of a pool implementation
     */
    registerPool(id, poolInstance) {
        if (!(poolInstance instanceof BasePool)) {
            throw new Error('Pool implementation must extend BasePool');
        }
        this.pools.set(id, poolInstance);
    }

    /**
     * Set the active pool
     * @param {string} poolId - ID of the pool to set as active
     */
    setActivePool(poolId) {
        if (!this.pools.has(poolId)) {
            throw new Error(`Pool '${poolId}' not found`);
        }
        this.currentPool = this.pools.get(poolId);
        localStorage.setItem('selectedPool', poolId);
    }

    /**
     * Get stats from the currently active pool
     * @param {string} wallet - Wallet address to get stats for
     */
    async getStats(wallet) {
        if (!this.currentPool) {
            throw new Error('No pool selected');
        }
        return await this.currentPool.getStats(wallet);
    }

    /**
     * Get list of available pools
     * @returns {Array<{id: string, name: string, website: string}>}
     */
    getAvailablePools() {
        const pools = [];
        for (const [id, pool] of this.pools) {
            pools.push({
                id,
                name: pool.getPoolName(),
                website: pool.getPoolWebsite()
            });
        }
        return pools;
    }

    /**
     * Initialize the pool manager with the last selected pool or default
     * @param {string} defaultPoolId - Default pool ID to use if none was previously selected
     */
    initialize(defaultPoolId) {
        const savedPool = localStorage.getItem('selectedPool') || defaultPoolId;
        if (this.pools.has(savedPool)) {
            this.setActivePool(savedPool);
        } else if (this.pools.size > 0) {
            this.setActivePool([...this.pools.keys()][0]);
        }
    }
}