import { BasePool } from './base-pool.js';

class NanoPool extends BasePool {
    constructor() {
        super('https://api.nanopool.org/v1/xmr');
    }

    async getStats(wallet) {
        try {
            const response = await fetch(`${this.apiEndpoint}/user/${wallet}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.status) {
                throw new Error(data.error || 'Failed to fetch data from Nanopool');
            }

            const poolData = data.data;
            let totalValidShares = 0;
            let totalInvalidShares = 0;

            if (poolData.workers && Array.isArray(poolData.workers)) {
                poolData.workers.forEach(worker => {
                    totalValidShares += parseInt(worker.validShares || 0);
                    totalInvalidShares += parseInt(worker.invalidShares || 0);
                });
            }

            // Convert to standard format
            return {
                amtPaid: Math.floor(parseFloat(poolData.paid || 0) * 1e12), // Convert to atomic units
                amtDue: Math.floor(parseFloat(poolData.balance || 0) * 1e12),
                hashrate: parseFloat(poolData.hashrate || 0),
                validShares: totalValidShares,
                invalidShares: totalInvalidShares,
                totalHashes: parseInt(poolData.totalHashes || 0)
            };
        } catch (error) {
            console.error('Nanopool API Error:', error);
            throw new Error('Failed to fetch data from Nanopool');
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