const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const block = Block.mineBlock(
            this.chain[this.chain.length - 1],
            data
        );
        this.chain.push(block);
        console.log('added a block');
        return block; 
    }

    isValidChain(chain) {
        // Check to see if the incomming chain starts with correct genesis block.
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log('issue with genesis block');
             return false; 
        }    

        // Index through the chain to make sure that each block posses the correct hashes.
        for (let i = 1; i<chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];
            
            console.log(`Here is the block we need to test
                ${block}
            `);

            if (block.lastHash !== lastBlock.hash || block.hash !== Block.hash(block.timestamp, block.lastHash, block.data, block.nonce)) {    
                return false;
            }
        }

        return true;
    }

    replaceChain(newChain) {
        // Check to see if the incomming chain is longer than the current chain.
        if (newChain.length <= this.chain.length) {
            console.log('received chain is not longer than the current chain');
            return;
        } else if (!this.isValidChain(newChain)) { // Check to see if the chain is valid.
            console.log('The received chain is not valid');
            return;
        }

        console.log('Replacing blockchain with the new chain');
        this.chain = newChain;
    }
}

module.exports = Blockchain;