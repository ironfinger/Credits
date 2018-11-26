const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Blockchain');
const P2pSerevr = require('./p2p-server');
const Wallet = require('../Wallet');
const TransactionPool = require('../Wallet/transaction-pool');

const HTTP_PORT = process.env.HTTP_PORT ||  3010;

const app = express();
const bc = new Blockchain(); // Blockchain object.
const tp = new TransactionPool(); // Transaction Pool.
const p2pServer = new P2pSerevr(bc, tp);
const wallet = new Wallet();

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString}`);

    p2pServer.syncChains();
    
    res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body; // Get the recipient and the amount to transact.
    const transaction = wallet.createTransaction(recipient, amount, tp); // Create the transaction.
    p2pServer.broadcastTransaction(transaction); // Broadcast the transaction.
    res.redirect('/transactions');
});

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}`));
p2pServer.listen();