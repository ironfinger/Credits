const ChanUtil = require('../chain-util')
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block -
            Timestamp : ${this.timestamp}
            Last Hash : ${this.lastHash.substring(0, 10)}
            Hash      : ${this.hash.substring(0,10)}
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}
        `;
    }

    static genesis() { // This creates a genesis block which is the first block of the chain.
        return new this('Genesis time', '------', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    static mineBlock(lastBlock, data) {
        let { difficulty } = lastBlock;
        let nonce = 0;
        let timestamp;
        let hash; 
        const lastHash = lastBlock.hash;

        // Proof of work
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        }while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce.toString(), difficulty.toString());
    }
    
    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChanUtil.hash(`${timestamp}${lastHash}${data}${nonce}`).toString();
    }
    
    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) { // Adjusts the difficulty of the proof of work.
        let { difficulty } = lastBlock;
        
        // If difficulty is too easy we need to raise it:
        // If it took less that '3000' milliseconds to mine the last block, then we need to increase the difficulty.
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; // Ternary expression.

        /*
        if ((lastBlock.timestamp + MINE_RATE) > currentTime) {
            difficulty++;
        }else if ((lastBlock.timestamp + MINE_RATE) < currentTime) {
            difficulty--;
        }else {
            difficulty = difficulty;
        }
        */
        
        return difficulty;
    }
}

module.exports = Block;
 