import { BasePool } from './base-pool.js';

class MoneroOceanPool extends BasePool {
    constructor() {
        super('https://api.moneroocean.stream');
    }

    async getStats(wallet) {
        try {
            const response = await fetch(`${this.apiEndpoint}/miner/${wallet}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.status) {
                throw new Error(data.error || 'Failed to fetch data from MoneroOcean');
            }

            // MoneroOcean uses similar format to SupportXMR
            const stats = data.data || {};
            return {
                amtPaid: parseInt(stats.amtPaid || 0),
                amtDue: parseInt(stats.amtDue || 0),
                hashrate: parseFloat(stats.hash || 0),
                validShares: parseInt(stats.validShares || 0),
                invalidShares: parseInt(stats.invalidShares || 0),
                totalHashes: parseInt(stats.totalHashes || 0)
            };
        } catch (error) {
            console.error('MoneroOcean API Error:', error);
            throw new Error('Failed to fetch data from MoneroOcean');
        }
    }

    validateWalletAddress(wallet) {
        // Basic XMR address validation
        return /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/.test(wallet);
    }

    getPoolName() {
        return "MoneroOcean";
    }

    getPoolWebsite() {
        return "https://moneroocean.stream";
    }
}

export { MoneroOceanPool };