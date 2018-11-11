// $ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2pServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
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
            this.blockchain.replaceChain(data);
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain)); // Send something to a specific socket.
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }
}

module.exports = P2pServer;