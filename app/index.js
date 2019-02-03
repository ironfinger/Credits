const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Blockchain');
const P2pSerevr = require('./p2p-server');
const Wallet = require('../Wallet');
const TransactionPool = require('../Wallet/transaction-pool');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT ||  3000;

const app = express();
const bc = new Blockchain(); // Blockchain object.
const tp = new TransactionPool(); // Transaction Pool.
const p2pServer = new P2pSerevr(bc, tp);
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet, p2pServer);

var tempAddress = '';
var tempBalance;

// We need to change the signature process to a security code process where the user has to give their security code:
// Change the signature verification method to an 'OR' Where it accepts a security code,
// Wallet security code is comprised of the address plus the private key which is a hash of their special code and special information in a hash function.

const consoleColor = {
    fgBlack: "\x1b[30m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgBlue: "\x1b[34m",
    fgMagenta: "\x1b[35m",
    fgCyan: "\x1b[36m",
    fgWhite: "\x1b[37m"
};


const Header = `
            ████████████
        ██████████████████
        ███████  ██  █████████
    █████              █████
    █████████  ██  ███  ██████
    █████████████████  ███████
    ████████████████  ████████
      ██████████████  ████████
      ████████████  ████████
        ██████████████████
            ████████████
`;

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.get('/newWallet', (req, res) => { // Creates a new Wallet.
    let newWallet = new Wallet();
    const walletData = newWallet.getWalletEs();
    res.send(walletData);
});

app.post('/get-balance', (req, res) => {
    const { publickey } = req.body;

    tempBalance = Wallet.calculateBalanceWithPublicKey(publickey, bc);
    console.log(Wallet.calculateBalanceWithPublicKey(publickey, bc));
    console.log(tempBalance);
    res.redirect('/balance');
});

app.get('/getBalance', (req, res) => {
    let localBalance = wallet.calculateBalance(bc);
    console.log(`Local balance: ${localBalance}`);

    res.send(localBalance);
});

app.get('/balance', (req, res) => {
    res.json({
        balance: tempBalance
    });
});

app.post('/transact-nostwo', (req, res) => {
    // Create sender wallet:
    const { senderKeys, recipient, amount } = req.body;
    wallet.reCreateWallet(senderKeys);
    
    // Create transaction:
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.post('/transact-nosthree', (req, res) => {
    const {sender, recipient, amount } = req.body;
    wallet.publicKey = sender;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/transactions', (req, res) => {
    console.log(JSON.stringify(tp));
    res.json(tp.transactions);
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString}`);

    p2pServer.syncChains();
    
    res.redirect('/blocks');
});

app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New Block added: ${block.toString()}`);
    res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body; // Get the recipient and the amount to transact.
    const transaction = wallet.createTransaction(recipient, amount, bc, tp); // Create the transaction.
    p2pServer.broadcastTransaction(transaction); // Broadcast the transaction.
    res.redirect('/transactions');
});

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}`));
console.log(consoleColor.fgRed, 'Color Test');  //cyan

console.log(consoleColor.fgRed, `





`)



p2pServer.listen();
