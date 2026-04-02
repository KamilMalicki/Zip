const fs = require('fs');

class Compiler {
    constructor() {
        this.instrukcje = [];
        this.adresBazowy = 0x400000n;
        this.offsetKodu = 0x1000n; 
    }

    compile(ast) {
        this.instrukcje = [];

        this.nextBajt([0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00]);
        this.nextBajt([0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00]);
        this.nextBajt([0x0f, 0x05]);

        return this.ELF_EXE_maker();
    }

    nextBajt(bajty) {
        bajty.forEach(b => this.instrukcje.push(b));
    }

    ELF_EXE_maker() {
        const kod = Buffer.from(this.instrukcje);
        const naglowekElf = Buffer.alloc(64);
        const naglowekProgramu = Buffer.alloc(56);

        naglowekElf.write('\x7fELF', 0);
        naglowekElf.writeUInt8(2, 4); 
        naglowekElf.writeUInt8(1, 5); 
        naglowekElf.writeUInt8(1, 6); 
        naglowekElf.writeUInt16LE(2, 16); 
        naglowekElf.writeUInt16LE(62, 18); 
        naglowekElf.writeUInt32LE(1, 20); 
        naglowekElf.writeBigUInt64LE(this.adresBazowy + this.offsetKodu, 24); 
        naglowekElf.writeBigUInt64LE(64n, 32); 
        naglowekElf.writeUInt16LE(64, 52); 
        naglowekElf.writeUInt16LE(56, 54); 
        naglowekElf.writeUInt16LE(1, 56); 

        naglowekProgramu.writeUInt32LE(1, 0); 
        naglowekProgramu.writeUInt32LE(5, 4); 
        naglowekProgramu.writeBigUInt64LE(0n, 8); 
        naglowekProgramu.writeBigUInt64LE(this.adresBazowy, 16); 
        naglowekProgramu.writeBigUInt64LE(this.adresBazowy, 24); 
        
        const rozmiarPliku = BigInt(Number(this.offsetKodu) + kod.length);
        naglowekProgramu.writeBigUInt64LE(rozmiarPliku, 32); 
        naglowekProgramu.writeBigUInt64LE(rozmiarPliku, 40); 
        naglowekProgramu.writeBigUInt64LE(0x1000n, 48); 

        const wypelnienie = Buffer.alloc(Number(this.offsetKodu) - 64 - 56);

        return Buffer.concat([
            naglowekElf,
            naglowekProgramu,
            wypelnienie,
            kod
        ]);
    }
}

module.exports = Compiler;