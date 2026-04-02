const fs = require('fs');

class Compiler {
    constructor() {
        this.instrukcje = [];
        this.platforma = 'linux';
    }

    compile(ast, platforma = 'linux') {
        this.instrukcje = [];
        this.platforma = platforma;

        if (this.platforma === 'windows') {
            this.nextBajt([0xB8, 0x00, 0x00, 0x00, 0x00]); 
            this.nextBajt([0xC3]); 
        } else {
            this.nextBajt([0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00]);
            this.nextBajt([0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00]);
            this.nextBajt([0x0f, 0x05]);
        }

        return this.platforma === 'windows' ? this.PE_EXE_maker() : this.ELF_EXE_maker();
    }

    nextBajt(bajty) {
        bajty.forEach(b => this.instrukcje.push(b));
    }

    ELF_EXE_maker() {
        const kod = Buffer.from(this.instrukcje);
        const naglowekElf = Buffer.alloc(64);
        const naglowekProgramu = Buffer.alloc(56);
        const adresBazowy = 0x400000n;
        const offsetKodu = 0x1000n;

        naglowekElf.write('\x7fELF', 0);
        naglowekElf.writeUInt8(2, 4);
        naglowekElf.writeUInt8(1, 5);
        naglowekElf.writeUInt8(1, 6);
        naglowekElf.writeUInt16LE(2, 16);
        naglowekElf.writeUInt16LE(62, 18);
        naglowekElf.writeUInt32LE(1, 20);
        naglowekElf.writeBigUInt64LE(adresBazowy + offsetKodu, 24);
        naglowekElf.writeBigUInt64LE(64n, 32);
        naglowekElf.writeUInt16LE(64, 52);
        naglowekElf.writeUInt16LE(56, 54);
        naglowekElf.writeUInt16LE(1, 56);

        naglowekProgramu.writeUInt32LE(1, 0);
        naglowekProgramu.writeUInt32LE(5, 4);
        naglowekProgramu.writeBigUInt64LE(0n, 8);
        naglowekProgramu.writeBigUInt64LE(adresBazowy, 16);
        naglowekProgramu.writeBigUInt64LE(adresBazowy, 24);
        const rozmiarPliku = BigInt(Number(offsetKodu) + kod.length);
        naglowekProgramu.writeBigUInt64LE(rozmiarPliku, 32);
        naglowekProgramu.writeBigUInt64LE(rozmiarPliku, 40);
        naglowekProgramu.writeBigUInt64LE(0x1000n, 48);

        const wypelnienie = Buffer.alloc(Number(offsetKodu) - 64 - 56);
        return Buffer.concat([naglowekElf, naglowekProgramu, wypelnienie, kod]);
    }

    PE_EXE_maker() {
        const kod = Buffer.from(this.instrukcje);
        
        const naglowekDos = Buffer.alloc(64);
        naglowekDos.write('MZ', 0);
        naglowekDos.writeUInt32LE(0x80, 0x3C);

        const sygnaturaPe = Buffer.alloc(4);
        sygnaturaPe.write('PE\0\0', 0);

        const naglowekCoff = Buffer.alloc(20);
        naglowekCoff.writeUInt16LE(0x8664, 0); 
        naglowekCoff.writeUInt16LE(1, 2);    
        naglowekCoff.writeUInt32LE(Math.floor(Date.now() / 1000), 4);
        naglowekCoff.writeUInt16LE(240, 16); 
        naglowekCoff.writeUInt16LE(0x22, 18); 

        const naglowekOpcjonalny = Buffer.alloc(240);
        naglowekOpcjonalny.writeUInt16LE(0x20B, 0); 
        naglowekOpcjonalny.writeUInt32LE(kod.length, 4); 
        naglowekOpcjonalny.writeUInt32LE(0x1000, 16); 
        naglowekOpcjonalny.writeUInt32LE(0x1000, 20); 
        naglowekOpcjonalny.writeBigUInt64LE(0x140000000n, 24); 
        naglowekOpcjonalny.writeUInt32LE(0x1000, 32); 
        naglowekOpcjonalny.writeUInt32LE(0x200, 36);  
        naglowekOpcjonalny.writeUInt32LE(0x1000 + kod.length, 56); 
        naglowekOpcjonalny.writeUInt32LE(0x400, 60);  
        naglowekOpcjonalny.writeUInt16LE(3, 68);      
        naglowekOpcjonalny.writeBigUInt64LE(0x100000n, 72); 
        naglowekOpcjonalny.writeBigUInt64LE(0x1000n, 80);   
        naglowekOpcjonalny.writeUInt32LE(16, 108);    

        const naglowekSekcji = Buffer.alloc(40);
        naglowekSekcji.write('.text', 0);
        naglowekSekcji.writeUInt32LE(kod.length, 8);
        naglowekSekcji.writeUInt32LE(0x1000, 12);
        naglowekSekcji.writeUInt32LE(kod.length, 16);
        naglowekSekcji.writeUInt32LE(0x400, 20);
        naglowekSekcji.writeUInt32LE(0x60000020, 36); 

        const wypelnienieDos = Buffer.alloc(0x80 - 64);
        const wypelnienieSekcji = Buffer.alloc(0x400 - (0x80 + 4 + 20 + 240 + 40));

        return Buffer.concat([
            naglowekDos,
            wypelnienieDos,
            sygnaturaPe,
            naglowekCoff,
            naglowekOpcjonalny,
            naglowekSekcji,
            wypelnienieSekcji,
            kod
        ]);
    }
}

module.exports = Compiler;