#!/usr/bin/env node

const fs = require('fs');
const Tokenizer = require('./Token.js');
const Lexer = require('./Lexer.js');

let scieska = "";

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        scieska += val;
    } else if (index > 2) {
        scieska = scieska + "/" + val;
    }
});

try {
    const dane = fs.readFileSync(scieska, 'utf8'); // console.log(dane);
    const tokens = new Tokenizer(dane); //console.log(tokens.getTokens())
    const lexer = new Lexer(tokens.getTokens()); 
    console.log(lexer.getLexeredCode())

} catch (e) {
    console.error("Error" + e.toString().slice(14));
}