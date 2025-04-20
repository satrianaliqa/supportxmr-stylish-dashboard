import { BasePool } from './base-pool.js';

class MoneroOceanPool extends BasePool {
    constructor() {
        super('https://api.moneroocean.stream');
    }

    async getStats(wallet) {
        try {
            // MoneroOcean requires different endpoints for different stats
            const [statsResponse, paymentsResponse] = await Promise.all([
                fetch(`${this.apiEndpoint}/miner/${wallet}/stats/allWorkers`),
                fetch(`${this.apiEndpoint}/miner/${wallet}/payments`)
            ]);

            if (!statsResponse.ok || !paymentsResponse.ok) {
                // For new/unknown wallets, return empty stats
                if (statsResponse.status === 404 || paymentsResponse.status === 404) {
                    return {
                        amtPaid: 0,
                        amtDue: 0,
                        hashrate: 0,
                        validShares: 0,
                        invalidShares: 0,
                        totalHashes: 0
                    };
                }
                throw new Error(`HTTP error! status: ${statsResponse.status}`);
            }
            
            const stats = await statsResponse.json();
            const payments = await paymentsResponse.json();

            // Calculate total paid from payments history
            const totalPaid = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

            return {
                amtPaid: parseInt(totalPaid),
                amtDue: parseInt(stats.due || 0),
                hashrate: parseFloat(stats.hash || 0),
                validShares: parseInt(stats.validShares || 0),
                invalidShares: parseInt(stats.invalidShares || 0),
                totalHashes: parseInt(stats.hashes || 0)
            };
        } catch (error) {
            console.error('MoneroOcean API Error:', error);
            throw new Error('Wallet belum ada di MoneroOcean atau sedang offline');
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