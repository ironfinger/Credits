const ClientWallet = require('./index');
const TransactionPool = require('../Wallet/transaction-pool');
const Blockchain = require('../Blockchain');
const { INITIAL_BALANCE } = require('../config');
const Transaction = require('../Wallet/transaction');

let wallet, tp, bc;

wallet = new ClientWallet('tom', 500); 
tp = new TransactionPool();
bc = new Blockchain();

var transaction, sendAmount, recipient;
sendAmount = 50; 
recipient = 'imy30';
transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);

console.log(transaction);
console.log(tp);