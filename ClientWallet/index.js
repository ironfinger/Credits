const Wallet = require('../Wallet');

class ClientWallet extends Wallet {
    constructor(publicKey, privateKey) {
        this.balance = null;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    
}

module.exports = ClientWallet;