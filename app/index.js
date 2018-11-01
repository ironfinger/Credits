const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../Blockchain');
const P2pSerevr = require('./p2p-server');

const HTTP_PORT = process.env.HTTP_PORT ||  3001;

const app = express();
const bc = new Blockchain();
const p2pServer = new P2pSerevr(bc);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString}`);

    p2pServer.syncChains();
    
    res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`Listening on ${HTTP_PORT}`));
p2pServer.listen();