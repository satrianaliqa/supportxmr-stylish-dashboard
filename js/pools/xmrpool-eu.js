import { BasePool } from './base-pool.js';

class XMRPoolEU extends BasePool {
    constructor() {
        // Updated API endpoint without port 8119
        super('https://api.xmrpool.eu/pool');
    }

    async getStats(wallet) {
        try {
            const response = await fetch(`${this.apiEndpoint}/miner/${wallet}/stats`);
            if (!response.ok) {
                if (response.status === 404) {
                    // Return empty stats for new/unknown wallets
                    return {
                        amtPaid: 0,
                        amtDue: 0,
                        hashrate: 0,
                        validShares: 0,
                        invalidShares: 0,
                        totalHashes: 0
                    };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const stats = await response.json();
            if (!stats || typeof stats !== 'object') {
                return {
                    amtPaid: 0,
                    amtDue: 0,
                    hashrate: 0,
                    validShares: 0,
                    invalidShares: 0,
                    totalHashes: 0
                };
            }

            return {
                amtPaid: parseInt(stats.paid || 0),
                amtDue: parseInt(stats.balance || 0),
                hashrate: parseFloat(stats.hashrate || 0),
                validShares: parseInt(stats.validShares || 0),
                invalidShares: parseInt(stats.invalidShares || 0),
                totalHashes: parseInt(stats.hashes || 0)
            };
        } catch (error) {
            console.error('XMRPool.eu API Error:', error);
            throw new Error('Wallet belum ada di XMRPool.eu atau sedang offline');
        }
    }

    validateWalletAddress(wallet) {
        // Basic XMR address validation
        return /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/.test(wallet);
    }

    getPoolName() {
        return "XMRPool.eu";
    }

    getPoolWebsite() {
        return "https://xmrpool.eu";
    }
}

export { XMRPoolEU };