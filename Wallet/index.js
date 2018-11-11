const ChainUtil = require('../chain-util');
const { INITIAL_BALANCE } = require('../config');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE; // Set the initial balance.
        this.keyPair = ChainUtil.genKeyPair(); // This generates a key pair object.
        this.publicKey = this.keyPair.getPublic().encode('hex'); // Get the public key and turn it into it's hex form.
    }

    toString() {
        return ` Wallet:
            publicKey: ${this.publicKey.toString()}
            balance  : ${this.balance}
        `
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }
}

module.exports = Wallet;