const KeyEncoder = require('key-encoder')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keyEncoder = new KeyEncoder('secp256k1');

let keyPair = ec.genKeyPair();
console.log('Key Pair');
console.log(keyPair); 

let pub = keyPair.getPublic().encode('hex');
let priv = keyPair.getPrivate();
console.log(`Private Key: ${priv}`);

console.log('-------------------');
console.log(priv);

