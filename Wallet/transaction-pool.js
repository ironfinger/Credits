class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        // Check to see if the transaction already exists in the pool.
        let transactionWithId = this.transactions.find(t => t.id == transaction);

        // Check if the transaction with Id variable actually exists:
        if (transactionWithId) {
            // Replace (update) the transaction with the same id.
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            // Add the new Transaction.
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address) {

        return this.transactions.find(t => t.input.address === address);
    }

}

module.exports = TransactionPool;