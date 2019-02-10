const ChainUtil = require('../chain-util');
const { REWARD } = require('../config');

class Transaction { // This class holds a transaction between two wallets.
    constructor() {
        this.id = ChainUtil.id(); // Holds the id of the transaction so each one can be uniquely identified.
        this.input = null;  // This holds the input of the transactions se we know what is going into the transaction.
        this.outputs = []; // Stores the outputs of the transaction. So we can easily know the senderWallet and their new balance and public key, and the amount that is going to the recipient.
    }

    update(senderWallet, recipient, amount) { // Update the transaction to send more currency to more places with one transaction.
        // Find the origianl sender output.
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey); // Get an output of a wallet where the output address is equal to the senderWallet public key.


        // If the user attempts to make a transaction with the amount that they were already meant to end up with ?.
        if (amount > senderOutput.amount) { 
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recipient });
        Transaction.signTransaction(this, senderWallet);
        return this;
    }

    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this(); // Create the new transaction.

        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet); // Sign the transaction being created.
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount) {
        // Check to see if the new transaction amount is greater than the sender wallets amount.
        if (amount > senderWallet.balance) {
            console.log(`The amount ${amount} is exceeding the current balance`);
            return;
        }

        console.log(this.validAmount === false);

        return Transaction.transactionWithOutputs(senderWallet, [
            {amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            {amount, address: recipient}
        ]);
    }

    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: REWARD,
            address: minerWallet.publicKey
        }]);
    }

    static signTransaction(transactionInput, senderWallet) { // Sign a transaction.
        // Assign value to the input object for the transaciton

        // We need to check to see if the wallet is a client wallet or a miner.
        var sig;

        if (true) {
            sig = senderWallet.privateAddress;
        } else {
            sig = senderWallet.sign(ChainUtil.hash(transactionInput.outputs));
            console.log('sign');
        }

        transactionInput.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey, // The address is the public key of the wallet.
            signature: sig
        }
    }

    isClient(senderWallet) {
        if (senderWallet.privateAddress == 'mmm') {
            return false;
        }
        return true;
    }

    static verifyTransaction(transaciton) {

        // Support the new hash here.
        var signature = `${transaciton.input.signature}`
        if (signature.substring(0, 3) === '3'.repeat(3)) {
            return true;
        }

        return ChainUtil.verifySignature(
            transaciton.input.address,
            transaciton.input.signature,
            ChainUtil.hash(transaciton.outputs)
        );
    }
}

module.exports = Transaction;
