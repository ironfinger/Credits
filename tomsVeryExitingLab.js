const EC = require('elliptic').ec;

var ec = new EC('secp256k1');

var keyPair = ec.genKeyPair();
console.log(keyPair);
console.log('-------');
console.log(keyPair.getPublic().encode('hex'));
console.log('-------');
console.log(keyPair.getPrivate().toString('hex'));
const priv = keyPair.getPrivate().toString('hex');
console.log('-------');

console.log(keyPair.sign());

var ec02 = ec.keyFromPrivate(priv);
console.log('SIGN02');
ec02.sign();