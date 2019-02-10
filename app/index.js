const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Blockchain');
const P2pSerevr = require('./p2p-server');
const Wallet = require('../Wallet');
const TransactionPool = require('../Wallet/transaction-pool');
const Miner = require('./miner');
const ClientWallet = require('../ClientWallet');

const HTTP_PORT = process.env.HTTP_PORT ||  3000;

const app = express();
const bc = new Blockchain(); // Blockchain object.
const tp = new TransactionPool(); // Transaction Pool.
const p2pServer = new P2pSerevr(bc, tp);
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet, p2pServer);

// DynamicVariables:
var userWallet;

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.get('/tom', (req, res) => {
    res.send('hello');
});

app.get('/wallet', (req, res) => {
    res.json(wallet);
});

app.post('/new-wallet', (req, res) => {
    const { name } = req.body;

    // Create new client wallet:
    userWallet = new ClientWallet(name);
    res.redirect('/client-wallet'); 
});

app.get('/client-wallet', (req, res) => {
    const data = {
        publicAddr: userWallet.publicKey,
        privateAddr: userWallet.privateAddress,
        privateAddressKey: userWallet.privateAddressKey
    }
    res.json(data);
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

app.post('/client-transact', (req, res) => {
    var { name, nonce, publicAddress, amount, recipient } = req.body;

    var client = ClientWallet.reConstruct(name, publicAddress, nonce);

    var transaction = client.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}`));
p2pServer.listen();