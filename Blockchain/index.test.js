const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {
    let bc, bc2;
    
    beforeEach(() => {
        bc = new Blockchain();
        bc2 = new Blockchain();
    });

    it('should start with the genesis block first', () => {
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        const data = 'tom';
        bc.addBlock(data);

        expect(bc.chain[bc.chain.length - 1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        bc2.addBlock(`tom`);
        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it('replaces the chain with a valid chain', () => {
        bc2.addBlock('tom');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace the chain with one of less than or equal to length', () => {
        bc.addBlock('tom');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).not.toEqual(bc2.chain);
    });

});
