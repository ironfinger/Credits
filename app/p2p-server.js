// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5000;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = { // We need a way of differentiating between different message types.
    chain: 'CHAIN', // This will be used to recognise a chain.
    transactions: 'TRANSACTION', // This will be used to recognise a transaction.
    clear_transactions: 'CLEAR_TRANSACTIONS' // This will be used to recognise clear transaction signal.
};


class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain; // Add the blockchain to the node, to syncronise transaction pools.
        this.transactionPool = transactionPool; // Add the transactionpool to the node, to syncronise transaction pools.
        this.sockets = []; // This will contain a list of webSocket servers that will connect to this one.
    }

    listen() { // Do the job of creating and starting up the server.
        // Initial Setup:
        const server = new WebSocket.Server({ port: P2P_PORT }); // Create a new Websocket server object.
        this.connectToPeers(); // Connect to the other peers already on the network. Parameters given by env variables.
        // Event listener, can listen to incomming messages sent to the server.
        // First argument provides the event that we're listening for.
        server.on('connection', socket => this.connectSocket(socket)); //Listen for any connections.
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`); // Make sure that I know we are doing shit.
    }
    
    connectToPeers() { 
        /*
            This function will connect to all of the nodes already on the network.
            This function does not apply to existing nodes.
        */
        peers.forEach(peer => {
            // ws://localhost:5001
            const socket = new WebSocket(peer);
            socket.on('open', () => this.connectSocket(socket)); // This will connect to the socket and add it to the array.
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('socket connected');
        this.messageHandler(socket); // Attach message handler here becuase all sockets run through this function.
        this.sendChain(socket);
    }

    messageHandler(socket) { // Recieves blockchain object for the miner(socket).
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch(data.type) { // Decode the JSON object to see if the data is a transaction or a chain.
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain); // Replace the chain.
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction); // Update or add transactions.
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
            }
        });
    }

    sendChain(socket) {
        // Version without the type:
        //socket.send(JSON.stringify(this.blockchain.chain)); // Send something to a specific socket.
    
        // Version with the type:
        socket.send(JSON.stringify({
                type: MESSAGE_TYPES.chain, // Change the message type to chain.
                chain: this.blockchain.chain // Put the chain into the chain.
            })
        );
    }

    sendTransaction(socket, transaction) {
        // Send the transaction to the parsed socket.
        // Version without the type:
        //socket.send(JSON.stringify(transaction)); // Send the transaction.
    
        // Version with the type:
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction, // Change the message type to transaction.
            transaction // Put the transaction into the transaction part.
        })); 
    }

    broadcastTransaction(transaction) {
        // Simplified Code:
         this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
        
        // Same thing but detailed.
        // for (let i = 0; i < this.sockets.length; i++) {
        //      const socket = this.sockets[i]; // Get a socket in the sockets array.
        //      this.sendTransaction(socket, transaction); // Send the transaction to that socket.
        // }
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }
}

//WATCH THE VIDEO.

module.exports = P2pServer;