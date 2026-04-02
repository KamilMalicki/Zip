#!/usr/bin/env node

const fs = require('fs');
const { Command } = require('commander');

const Tokenizer = require('./Token.js');
const Lexer = require('./Lexer.js');
const Parser = require('./Parser.js');
const Interpreter = require('./Interpreter.js');
const Compiler = require('./Compiler.js');

const con = new Command();
con
    .name('zipcc')
    .description('Zip esoteric language interpreter-compiler\nGithub: https://Github.com/KamilMalicki/Zip')
    .argument('<fileName>', 'path to the input file')
    .option('-i, --interpreter', 'Interpreting the code')
    .option('-c, --compile <type>', 'Compiling code')
    .option('-o, --output <path>', 'Returning compiled code under a given name')
    .action((scieska, opcje) => {

        try {
            const dane = fs.readFileSync(scieska, 'utf8');
            const tokens = new Tokenizer(dane);                 //console.log(dane);
            const lexer = new Lexer(tokens.getTokens());        // console.log(tokens.getTokens());
            const parser = new Parser(lexer.getLexeredCode());  //console.log(lexer.getLexeredCode());
            const ast = parser.parse();                         //console.log(JSON.stringify(ast, null, 2));

            if (opcje.interpreter) {
                const interp = new Interpreter();
                Eval = interp.run(JSON.stringify(ast, null, 2))
            }
            
            if (opcje.compile) {
                console.log(`[ZIPCC]: ${opcje.compile}`);
                const comp = new Compiler();
                const LLVM = comp.run(JSON.stringify(ast, null, 2))
                if (opcje.output) {
                    console.log(`[ZIPLLD]: ${opcje.output}`);
                }
            }

        } catch (e) {
            console.error(e.message || e.toString());
        }
    });

con.parse(process.argv);