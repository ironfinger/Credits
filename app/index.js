const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Blockchain');
const P2pSerevr = require('./p2p-server');
const Wallet = require('../Wallet');
const TransactionPool = require('../Wallet/transaction-pool');
const Miner = require('./miner');
const ChainUtil = require('../chain-util');

const HTTP_PORT = process.env.HTTP_PORT ||  3000;

const app = express();
const bc = new Blockchain(); // Blockchain object.
const tp = new TransactionPool(); // Transaction Pool.
const p2pServer = new P2pSerevr(bc, tp);
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet, p2pServer);

const clients = []; 
var tempBalance = null;
var tempWallet = null;

app.use(bodyParser.json());

app.get('/newWallet', (req, res) => {
    const newW = new Wallet();
    res.json({
        private: newW.getPrivate(),
        public: newW.getPublic()
    });
});

app.post('/recieve-client', (req, res) => {
    const { public, private } = req.body;

    const newClient = new Wallet();
    newClient.publicKey = public;
    newClient.keyPair = ChainUtil.keyPairFromPrivate(private);
    clients.unshift(newClient);
    res.redirect('/give-client-callback');
});

app.get('/give-client-callback', (req, res) => {
    res.json(clients[0]);
});

app.post('/client-transact',(req, res) => {
    const { publicKey, amount, recipient } = req.body;
    
    // Get the wallet from the array:
    const wallet = clients.find(w => w.publicKey === publicKey);

    // Get the amount and use the transact amount:
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    
    // Broadcast the transaction:
    p2pServer.broadcastTransaction(transaction);

    // Redirect:
    res.redirect('/transactions');
});

app.post('/balance', (req, res) => {
    const { publicKey } = req.body;

    const nWallet = new Wallet();
    nWallet.publicKey = publicKey;

    tempBalance = nWallet.calculateBalance(bc);

    res.redirect('/give-client-balance');
});

app.get('/give-client-balance', (req, res) => {
    res.json({
        balance: tempBalance
    });
});

app.post ('/client-transactions', (req, res) => {
    const { publicKey } = req.body;

    tempWallet = new Wallet();
    tempWallet.publicKey = publicKey;
    res.redirect('/give-client-transactions');
});

app.get('/give-client-transactions', (req, res) => {
    const transactions = Wallet.getTransactions(tempWallet.publicKey, bc);
    res.json(transactions);
});

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
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

app.get('/address', (req, res) => {
    res.send(wallet.publicKey);
});

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}`));
p2pServer.listen();
