const Wallet = require('./Wallet');
const wallet = new Wallet();
const rWallet = new Wallet();
console.log(wallet.toString());
const Transaction = require('./Wallet/transaction');
var transaction = new Transaction();
var myTransaction = Transaction.newTransaction(wallet, rWallet, 10);
console.log(myTransaction);