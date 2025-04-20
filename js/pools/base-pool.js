/**
 * Base class that all pool implementations must extend
 */
class BasePool {
    constructor(apiEndpoint) {
        if (this.constructor === BasePool) {
            throw new Error("Abstract class 'BasePool' cannot be instantiated directly.");
        }
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Get miner statistics from the pool
     * @param {string} wallet - The miner's wallet address
     * @returns {Promise<{
     *   amtPaid: number,
     *   amtDue: number,
     *   hashrate: number,
     *   validShares: number,
     *   invalidShares: number,
     *   totalHashes: number
     * }>}
     */
    async getStats(wallet) {
        throw new Error("Method 'getStats()' must be implemented.");
    }

    /**
     * Validates if the provided wallet address is in the correct format for this pool
     * @param {string} wallet - The wallet address to validate
     * @returns {boolean}
     */
    validateWalletAddress(wallet) {
        throw new Error("Method 'validateWalletAddress()' must be implemented.");
    }

    /**
     * Get the pool's display name
     * @returns {string}
     */
    getPoolName() {
        throw new Error("Method 'getPoolName()' must be implemented.");
    }

    /**
     * Get the pool's website URL
     * @returns {string}
     */
    getPoolWebsite() {
        throw new Error("Method 'getPoolWebsite()' must be implemented.");
    }
}