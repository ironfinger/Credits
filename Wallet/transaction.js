const ChainUtil = require('../chain-util');

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

    static newTransaction(senderWallet, recipient, amount) {
        const transaction = new this(); // Create the new transaction.

        if (amount > senderWallet.balance) { // Check to see if the new transaction amount is greater than the sender wallets amount.
            console.log(`the amount ${amount} is exceeding the current balance`);
            return;
        }

        transaction.outputs.push(...[
            {amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            {amount, address: recipient}
        ]);

        Transaction.signTransaction(transaction, senderWallet); // Sign the transaction being created.

        return transaction;
    }

    static signTransaction(transactionInput, senderWallet) { // Sign a transaction.
        // Assign value to the input object for the transaciton
        transactionInput.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey, // The address is the public key of the wallet.
            signature: senderWallet.sign(ChainUtil.hash(transactionInput.outputs))
        }
    }

    static verifyTransaction(transaciton) {
        return ChainUtil.verifySignature(
            transaciton.input.address,
            transaciton.input.signature,
            ChainUtil.hash(transaciton.outputs)
        );
    }
}

module.exports = Transaction;