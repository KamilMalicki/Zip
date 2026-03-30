#!/usr/bin/env node

const fs = require('fs');

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
    console.log(dane);
} catch (e) {
    // coś tu nie gra
}