const ClientWallet = require('./index');
const TransactionPool = require('../Wallet/transaction-pool');
const Blockchain = require('../Blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('ClientWallet', () => {
    let wallet, tp, bc;

    beforeEach(() => {
        wallet = new ClientWallet('tom', 500); 
        tp = new TransactionPool();
        bc = new Blockchain();
    });

    describe('create a transaction', () => {
        let transaction, sendAmount, recipient;

        beforeEach(() => {
            sendAmount = 50; 
            recipient = 'imy30';
            transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
        });
    });
});