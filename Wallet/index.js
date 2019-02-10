const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE; // Set the initial balance.
        this.keyPair = ChainUtil.genKeyPair(); // This generates a key pair object.
        this.publicKey = this.keyPair.getPublic().encode('hex'); // Get the public key and turn it into it's hex form.
        this.privateAddress = 'mmm';
    }

    toString() {
        return ` Wallet:
            publicKey: ${this.publicKey.toString()}
            balance  : ${this.balance}
        `
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }
    
    // Replace a transaction in the pool by the sender with an upadted version.
    // Or crreate a fresh new transaction and add it to the pool.
    createTransaction(recipient, amount, blockchain, transactionPool) { 
        // Variables: Recipient of the money, the amount to transact, given transactionPool.
        // Check to tsee if the amount currently ecveeds the balance of the wallet.
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        // Check to see if a transaction attributed to the sender already exists.
        let transaction = transactionPool.existingTransaction(this.publicKey);
        console.log(`Does trasaction exist: ${transaction}`);
        if (transaction) {
            // Update the transaction.
            transaction.update(this, recipient, amount);
        } else {
            // Create a new transaction:
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];

        // Run a loop on the blockchain to look at each block one at a time.
        // blockchain.chain.forEach(block => {
        //     console.log(block);
        //     block.data.forEach(transaction => {
        //         transactions.push(transaction);
        //     });
        // });

        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));

        const walletInputTs = transactions.filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0;

        if (walletInputTs.length > 0) {
            const recentInputT = walletInputTs.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            );
            
            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                }); 
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
}

module.exports = Wallet;