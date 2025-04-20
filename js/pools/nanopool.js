import { BasePool } from './base-pool.js';

class NanoPool extends BasePool {
    constructor() {
        super('https://api.nanopool.org/v1/xmr');
    }

    async getStats(wallet) {
        try {
            const response = await fetch(`${this.apiEndpoint}/user/${wallet}`);
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
            
            const data = await response.json();
            if (!data.status) {
                // Return empty stats if account not found
                if (data.error && data.error.toLowerCase().includes('account not found')) {
                    return {
                        amtPaid: 0,
                        amtDue: 0,
                        hashrate: 0,
                        validShares: 0,
                        invalidShares: 0,
                        totalHashes: 0
                    };
                }
                throw new Error(data.error || 'Failed to fetch data from Nanopool');
            }

            const poolData = data.data || {};
            let totalValidShares = 0;
            let totalInvalidShares = 0;

            if (poolData.workers && Array.isArray(poolData.workers)) {
                poolData.workers.forEach(worker => {
                    totalValidShares += parseInt(worker.validShares || 0);
                    totalInvalidShares += parseInt(worker.invalidShares || 0);
                });
            }

            return {
                amtPaid: Math.floor(parseFloat(poolData.paid || 0) * 1e12),
                amtDue: Math.floor(parseFloat(poolData.balance || 0) * 1e12),
                hashrate: parseFloat(poolData.hashrate || 0),
                validShares: totalValidShares,
                invalidShares: totalInvalidShares,
                totalHashes: parseInt(poolData.totalHashes || 0)
            };
        } catch (error) {
            console.error('Nanopool API Error:', error);
            throw new Error('Wallet belum ada di Nanopool atau sedang offline');
        }
    }

    validateWalletAddress(wallet) {
        // Basic XMR address validation
        return /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/.test(wallet);
    }

    getPoolName() {
        return "Nanopool";
    }

    getPoolWebsite() {
        return "https://xmr.nanopool.org";
    }
}

export { NanoPool };