#!/usr/bin/env node

const fs = require('fs');
const { Command } = require('commander');

const Tokenizer = require('./Token.js');
const Lexer = require('./Lexer.js');
const Parser = require('./Parser.js');
const Interpreter = require('./Interpreter.js');
const Compiler = require('./Compiler.js');
const { exit } = require('process');

const program = new Command();

program
    .name('zipcc')
    .description('Zip esoteric language interpreter-compiler\nGithub: https://Github.com/KamilMalicki/Zip')
    .argument('<file.zp>', 'sciezka do pliku wejsciowego')
    .option('-i, --interpreter', 'Tryb interpretera')
    .option('-c, --compile', 'Kompilacja do formatu ELF')
    .option('-o, --output <wyjscie>', 'Nazwa pliku wynikowego')
    .action((sciezka, opcje) => {

        try {
            /*
            i = 0;
            process.argv.forEach(function (val, index, array) {
                console.log(index + ': ' + val + ' - ' + array[index]);
                i++;
            });
            */
            if (!sciezka.toString().endsWith(".zp")) {
                console.error("error: no valid file format")
                exit(-1);
            }  
            if (Object.keys(opcje).length === 0) {
                console.error("error: please provide options (-i or -c) for using the program");
                exit(-1);
            }
            const dane = fs.readFileSync(sciezka, 'utf8');
            const tokens = new Tokenizer(dane); //console.log(dane);
            const lexer = new Lexer(tokens.getTokens());  // console.log(tokens.getTokens());
            const parser = new Parser(lexer.getLexeredCode()); //console.log(lexer.getLexeredCode());
            const ast = parser.parse(); //console.log(JSON.stringify(ast, null, 2));

            if (opcje.interpreter) {
                const interp = new Interpreter();
                interp.run(JSON.stringify(ast, null, 2));

                if (opcje.compile) console.log('\n\n');
            }
            
            if (opcje.compile) {
                const compiler = new Compiler();
                const binarka = compiler.compile(ast);
                
                const nazwaWyjsciowa = opcje.output || 'program';
                fs.writeFileSync(nazwaWyjsciowa, binarka);
                
                fs.chmodSync(nazwaWyjsciowa, 0o755);
                
                process.stdout.write(`[ZIPCC]: ${nazwaWyjsciowa}\n`);
                process.stdout.write(`[ZIPLD]: ./${nazwaWyjsciowa}\n`);
            }

        } catch (blad) {
            console.error(blad.message || blad.toString());
        }
    });

program.parse(process.argv);