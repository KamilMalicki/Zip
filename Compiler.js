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
            this.generujMmap();
            this.generuj(ast);
            this.nextBajt([0x48, 0xc7, 0xc0, 0x3c, 0x00, 0x00, 0x00]);
            this.nextBajt([0x48, 0xc7, 0xc7, 0x00, 0x00, 0x00, 0x00]);
            this.nextBajt([0x0f, 0x05]);
        }

        return this.platforma === 'windows' ? this.PE_EXE_maker() : this.ELF_EXE_maker();
    }

    nextBajt(bajty) {
        bajty.forEach(b => this.instrukcje.push(b));
    }

    emitWartosc32(liczba) {
        const bufor = Buffer.alloc(4);
        bufor.writeInt32LE(liczba);
        this.nextBajt([...bufor]);
    }

    generujMmap() {
        this.nextBajt([0x48, 0xC7, 0xC7, 0x00, 0x00, 0x00, 0x00]);
        this.nextBajt([0x48, 0xC7, 0xC6, 0x00, 0x00, 0x01, 0x00]);
        this.nextBajt([0x48, 0xC7, 0xC2, 0x03, 0x00, 0x00, 0x00]);
        this.nextBajt([0x49, 0xC7, 0xC2, 0x22, 0x00, 0x00, 0x00]);
        this.nextBajt([0x49, 0xC7, 0xC0, 0xFF, 0xFF, 0xFF, 0xFF]);
        this.nextBajt([0x49, 0xC7, 0xC1, 0x00, 0x00, 0x00, 0x00]);
        this.nextBajt([0x48, 0xC7, 0xC0, 0x09, 0x00, 0x00, 0x00]);
        this.nextBajt([0x0F, 0x05]);                              
        this.nextBajt([0x49, 0x89, 0xC4]);                        
    }

    generuj(wezel) {
        if (!wezel) return;

        switch (wezel.type) {
            case 'Program':
                wezel.body.forEach(instrukcja => this.generuj(instrukcja));
                break;

            case 'Literal':
                this.nextBajt([0x48, 0xC7, 0xC0]); // mov rax, imm32
                this.emitWartosc32(wezel.value);
                break;

            case 'MemoryAccess':
                this.generuj(wezel.index); // Ewaluacja indeksu
                this.nextBajt([0x49, 0x8B, 0x04, 0xC4]); // mov rax, [r12 + rax*8]
                break;

            case 'AssignmentStatement':
                this.generuj(wezel.target.index); // Ewaluacja indeksu
                this.nextBajt([0x50]); // push rax
                this.generuj(wezel.value); // Ewaluacja wartości
                this.nextBajt([0x5B]); // pop rbx (przywraca indeks do rbx)
                this.nextBajt([0x49, 0x89, 0x04, 0xDC]); // mov [r12 + rbx*8], rax
                break;

            case 'BinaryExpression':
                this.generuj(wezel.left);
                this.nextBajt([0x50]); // push rax
                this.generuj(wezel.right);
                this.nextBajt([0x5B]); // pop rbx (lewa strona w rbx, prawa w rax)
                if (wezel.operator === '+') {
                    this.nextBajt([0x48, 0x01, 0xD8]); // add rax, rbx
                } else {
                    this.nextBajt([0x48, 0x29, 0xC3]); // sub rbx, rax
                    this.nextBajt([0x48, 0x89, 0xD8]); // mov rax, rbx
                }
                break;

            case 'PrintStatement':
                this.generuj(wezel.expression);
                this.nextBajt([0x50]); // push rax (zapisujemy znak na stosie)
                this.nextBajt([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]); // mov rax, 1 (sys_write)
                this.nextBajt([0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00]); // mov rdi, 1 (stdout)
                this.nextBajt([0x48, 0x89, 0xE6]);                         // mov rsi, rsp (adres znaku)
                this.nextBajt([0x48, 0xC7, 0xC2, 0x01, 0x00, 0x00, 0x00]); // mov rdx, 1 (dlugosc)
                this.nextBajt([0x0F, 0x05]);                               // syscall
                this.nextBajt([0x58]); // pop rax (czyscimy stos)
                break;

            case 'InputStatement':
                this.nextBajt([0x48, 0x83, 0xEC, 0x08]);                   // sub rsp, 8 (miejsce na znak)
                this.nextBajt([0x48, 0xC7, 0xC0, 0x00, 0x00, 0x00, 0x00]); // mov rax, 0 (sys_read)
                this.nextBajt([0x48, 0xC7, 0xC7, 0x00, 0x00, 0x00, 0x00]); // mov rdi, 0 (stdin)
                this.nextBajt([0x48, 0x89, 0xE6]);                         // mov rsi, rsp
                this.nextBajt([0x48, 0xC7, 0xC2, 0x01, 0x00, 0x00, 0x00]); // mov rdx, 1 (dlugosc)
                this.nextBajt([0x0F, 0x05]);                               // syscall
                this.nextBajt([0x58]);                                     // pop rax (pobieramy znak do rax)
                this.nextBajt([0x48, 0x25, 0xFF, 0x00, 0x00, 0x00]);       // and rax, 0xFF (zostawiamy kod ASCII)
                break;

            case 'RepeatStatement':
                this.generujPętle(wezel);
                break;

            default:
                throw new Error(`Kompilator napotkal nieznany wezel: ${wezel.type}`);
        }
    }

    generujPętle(wezel) {
        const czesci = wezel.condition.trim().match(/(-e|-ne|-l|-g)|(\$\[.+?\])|(-?\d+)/g);
        if (!czesci || czesci.length < 3) return;

        const operator = czesci[0];
        const lewa = czesci[1];
        const prawa = czesci[2];

        const adresPoczatku = this.instrukcje.length;

        // Ewaluacja lewej strony
        this.generujWarunek(lewa);
        this.nextBajt([0x50]); // push rax
        
        // Ewaluacja prawej strony
        this.generujWarunek(prawa);
        this.nextBajt([0x5B]); // pop rbx

        this.nextBajt([0x48, 0x39, 0xC3]); // cmp rbx, rax

        // Konwersja zaleznosci na skoki warunkowe z petli
        let bajtSkoku;
        switch (operator) {
            case '-e':  bajtSkoku = 0x84; break; // JE
            case '-ne': bajtSkoku = 0x85; break; // JNE
            case '-l':  bajtSkoku = 0x8C; break; // JL
            case '-g':  bajtSkoku = 0x8F; break; // JG
        }

        this.nextBajt([0x0F, bajtSkoku]);
        const indeksSkokuNaKoniec = this.instrukcje.length;
        this.nextBajt([0x00, 0x00, 0x00, 0x00]); // Miejsce do wypelnienia offsetem po skompilowaniu wnetrza

        // Kompilacja wnetrza petli
        wezel.body.forEach(instrukcja => this.generuj(instrukcja));

        // Skok powrotny na poczatek
        this.nextBajt([0xE9]); // jmp
        const przesuniecieNaPoczatek = adresPoczatku - (this.instrukcje.length + 4);
        this.emitWartosc32(przesuniecieNaPoczatek);

        // Uzupelnienie pustego miejsca po skoku relatywnym
        const przesuniecieKoniec = this.instrukcje.length - (indeksSkokuNaKoniec + 4);
        const buforWypelnienia = Buffer.alloc(4);
        buforWypelnienia.writeInt32LE(przesuniecieKoniec);
        
        this.instrukcje[indeksSkokuNaKoniec]     = buforWypelnienia[0];
        this.instrukcje[indeksSkokuNaKoniec + 1] = buforWypelnienia[1];
        this.instrukcje[indeksSkokuNaKoniec + 2] = buforWypelnienia[2];
        this.instrukcje[indeksSkokuNaKoniec + 3] = buforWypelnienia[3];
    }

    generujWarunek(ciagZnakow) {
        if (ciagZnakow.startsWith('$[')) {
            let srodek = ciagZnakow.slice(2, -1);
            if (srodek.startsWith('$[')) {
                this.generujWarunek(srodek); // Umozliwia zagniezdzenia np. $[$[0]]
            } else {
                this.nextBajt([0x48, 0xC7, 0xC0]);
                this.emitWartosc32(parseInt(srodek, 10));
            }
            this.nextBajt([0x49, 0x8B, 0x04, 0xC4]); // mov rax, [r12 + rax*8]
        } else {
            this.nextBajt([0x48, 0xC7, 0xC0]);
            this.emitWartosc32(parseInt(ciagZnakow, 10));
        }
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