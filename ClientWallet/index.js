const SHA256 = require('crypto-js/sha256');

class ClientWallet {
    constructor(publicAddress, privateAddress, privateAddressKey) {
        this.publicAddress = publicAddress;
        this.privateAddress = privateAddress;
        this.privateAddressKey = privateAddressKey;
    }

    static newClient(name) {

        // Create a new hash:
        let hash;
        let nonce = 0;
        do {
            nonce++;
            hash = SHA256(`${name}${nonce}`);
        } while (hash.substring(0, 3) !== '3'.repeat(3));

        return hash;
    }
}

var person = new ClientWallet('5', '5', '5');

console.log(ClientWallet.newClient('tom'));





































// static mineBlock(lastBlock, data) {
//     let { difficulty } = lastBlock;
//     let nonce = 0;
//     let timestamp;
//     let hash; 
//     const lastHash = lastBlock.hash;

//     // Proof of work
//     do {
//         nonce++;
//         timestamp = Date.now();
//         difficulty = Block.adjustDifficulty(lastBlock, timestamp);
//         hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
//     }while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

//     return new this(timestamp, lastHash, hash, data, nonce.toString(), difficulty.toString());
// }