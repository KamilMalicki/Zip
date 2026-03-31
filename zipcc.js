#!/usr/bin/env node

const fs = require('fs');
const Tokenizer = require('./Token.js');
const Lexer = require('./Lexer.js');
const Parser = require('./Parser.js');

let scieska = "";

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        scieska += val;
    } else if (index > 2) {
        scieska = scieska + "/" + val;
    }
});

try {
    const dane = fs.readFileSync(scieska, 'utf8'); 
    const tokens = new Tokenizer(dane); 
    const lexer = new Lexer(tokens.getTokens()); 
    const parser = new Parser(lexer.getLexeredCode()); 
    const ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));

} catch (e) {
    console.error(e.toString().slice(14));
}