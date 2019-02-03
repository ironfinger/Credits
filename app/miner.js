const Transaction = require('../Wallet/transaction');
const Wallet = require('../Wallet');


class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() { 
        console.log(`transaction pool: ${JSON.stringify(this.transactionPool)}`);

        const validTransactions = this.transactionPool.validTransactions();

        console.log(`Valid Transactions: ${validTransactions}`); 

        // include a reward for the miner.
        //validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));

        // create a block consisiting of the valid transactions.
        const block = this.blockchain.addBlock(validTransactions);

        // synvhronize chains in the peer-to-peer server.
        this.p2pServer.syncChains();

        // clear the transaction pool.
        this.transactionPool.clear();

        // broadcast to every miner to clear their transaction pools.
        this.p2pServer.broadcastClearTransactions();

        return block;
    }
}

module.exports = Miner;