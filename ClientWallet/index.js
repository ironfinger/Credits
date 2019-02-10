const SHA256 = require('crypto-js/sha256');
const utils = require('../chain-util');
const Transaction = require('../Wallet/transaction');

class ClientWallet {
    constructor(name, balance) {
        this.publicKey = utils.id();
        let values = this.newClientPriv(name);
        this.privateAddress = values.privateAddress;
        this.privateAddressKey = values.nonce;
        this.balance = balance;
    }

    getPubKey() {
        return this.publicAddress;
    }

    getPrivateAddress() {
        return this.privateAddress;
    }

    newClientPriv(name) {
        // Create a new hash:
        let hash;
        let nonce = 0;
        do {
            nonce++;
            hash = SHA256(`${name}${nonce}${this.publicAddress}`).toString();
        } while (hash.substring(0, 3) !== '3'.repeat(3));

        const necessaryData = {
            privateAddress: hash,
            nonce: nonce,
            name: name
        }

        return necessaryData;
    }

    reCreatePriv(name, publicAddrKey, key) {
        return SHA256(`${name}${key}${publicAddrKey}`).toString();
    }

    createTransaction(recipient, amount, blockchain, transactionPool) { 
        // Variables: Recipient of the money, the amount to transact, given transactionPool.
        // Check to tsee if the amount currently ecveeds the balance of the wallet.
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        // Check to see if a transaction attributed to the sender already exists.
        let transaction = transactionPool.existingTransaction(this.publicAddress);
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

    static sign(name, pubAddr, privAddr, nonce) {
        let hash = SHA256(`${name}${nonce}${pubAddr}${privAddr}`).toString()

        if (hash.substring(0, 3) !== '3'.repeat(3)) {
            return true;
        }

        return false;
    }

    static reConstruct(name, publicAddress, key) {
        var rtn = new ClientWallet();
        rtn.name = name;
        rtn.publicAddress = publicAddress;
        rtn.privateAddressKey = key;
        rtn.privateAddress = SHA256(`${name}${key}${publicAddress}`).toString();
        return rtn;
    }
}

module.exports = ClientWallet;
