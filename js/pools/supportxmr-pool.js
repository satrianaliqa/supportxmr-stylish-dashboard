import { BasePool } from './base-pool.js';

class SupportXMRPool extends BasePool {
    constructor() {
        super('https://supportxmr.com/api');
    }

    async getStats(wallet) {
        const response = await fetch(`${this.apiEndpoint}/miner/${wallet}/stats`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Alamat Wallet tidak ditemukan.");
            }
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const stats = data.stats || data || {};

        return {
            amtPaid: stats.amtPaid || 0,
            amtDue: stats.amtDue || 0,
            hashrate: parseFloat(stats.hashrate || stats.hash || 0),
            validShares: parseInt(stats.validShares || 0),
            invalidShares: parseInt(stats.invalidShares || 0),
            totalHashes: parseInt(stats.totalHashes || 0)
        };
    }

    validateWalletAddress(wallet) {
        // Basic XMR address validation (can be enhanced)
        return /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/.test(wallet);
    }

    getPoolName() {
        return "SupportXMR";
    }

    getPoolWebsite() {
        return "https://supportxmr.com";
    }
}

export { SupportXMRPool };