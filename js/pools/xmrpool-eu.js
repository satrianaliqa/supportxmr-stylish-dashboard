import { BasePool } from './base-pool.js';

class XMRPoolEU extends BasePool {
    constructor() {
        super('https://web.xmrpool.eu:8119');
    }

    async getStats(wallet) {
        try {
            const response = await fetch(`${this.apiEndpoint}/miner/${wallet}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const stats = await response.json();
            if (!stats || typeof stats !== 'object') {
                throw new Error('Invalid response from XMRPool.eu');
            }

            // XMRPool.eu uses node-cryptonote-pool format
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
            throw new Error('Failed to fetch data from XMRPool.eu');
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