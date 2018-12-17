const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE; // Set the initial balance.
        this.keyPair = ChainUtil.genKeyPair(); // This generates a key pair object.
        this.publicKey = this.keyPair.getPublic().encode('hex'); // Get the public key and turn it into it's hex form.
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
    createTransaction(recipient, amount, transactionPool) { 
        // Variables: Recipient of the money, the amount to transact, given transactionPool.
        // Check to tsee if the amount currently ecveeds the balance of the wallet.
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

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
}

module.exports = Wallet;