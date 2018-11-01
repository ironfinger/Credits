const Block = require('./blockchain/block');
const Blockchain = require('./blockchain');

var chain = new Blockchain();
console.log(chain.chain[0]);
chain.addBlockV2("Tom");
console.log(chain.isValidChainV2(chain.chain));
console.log(chain);