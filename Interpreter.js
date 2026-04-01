const fs = require('fs');

class Interpreter {
    constructor() {
        this.environment = {
            '$': 0,
        };
        /**
         * to coś jest po to aby łapał np $[$[0]] -> $[2] -> 10 
         */
        this.memory =  {

        };
    }

    run(code) {
        const ast = typeof code === 'string' ? JSON.parse(code) : code;
        const Abydziałało = process.stdin.isTTY;

        if (Abydziałało) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
        }

        try {
            this.evaluate(ast);
        } finally {
            if (Abydziałało) {
                process.stdin.setRawMode(false);
                process.stdin.pause();
            }
        }
    }

    evaluateCondition(condStr) {
        const tokens = condStr.trim().match(/(-e|-ne|-l|-g)|(\$\[.+?\])|(-?\d+)/g);
        if (!tokens || tokens.length < 3) return false;

        const op = tokens[0];
        const getVal = (r) => {
            if (r.startsWith('$[')) {
                let inner = r.slice(2, -1);
                let i;
                if (inner.startsWith('$[')) {
                    i = getVal(inner);
                } else {
                    i = parseInt(inner, 10);
                }
                return this.memory[i] || 0;
            }
            return parseInt(r, 10);
        };
        const left = getVal(tokens[1]);
        const right = getVal(tokens[2]);

        switch (op) {
            case '-e':  return left === right;
            case '-ne': return left !== right;
            case '-l':  return left < right;
            case '-g':  return left > right;
            default:    return false;
        }
    }

    evaluate(node) {
        if (!node) return;

        switch (node.type) {
            case 'Program': {
                node.body.forEach(statement => this.evaluate(statement));
                break;
            }

            case 'Literal': 
                return node.value;
            
            case 'Identifier': 
                return this.environment[node.name];

            case 'MemoryAccess':
                return this.memory[this.evaluate(node.index)] || 0;

            case 'AssignmentStatement':{
                const i = this.evaluate(node.target.index);
                const val = this.evaluate(node.value);
                this.memory[i] = val;
                return val;
            }

            case 'BinaryExpression': {
                const left = this.evaluate(node.left);
                const right = this.evaluate(node.right);
                return node.operator === '+' ? left + right : left - right;
            }

            case 'PrintStatement': {
                const asciiCode = this.evaluate(node.expression);
                process.stdout.write(String.fromCharCode(asciiCode));
                break;
            }

            case 'InputStatement': 
                return this._getch();

            case 'RepeatStatement': {
                while (this.evaluateCondition(node.condition) === false) {
                    const buf = Buffer.alloc(1);
                    try {
                        if (fs.readSync(0, buf, 0, 1, null) && buf[0] === 3) {
                            process.exit(0);
                        }
                    } catch (e) {}

                    for (const statement of node.body) {
                        this.evaluate(statement);
                    }
                }
                break;
            }
            default: throw new Error(`Błąd: ${node.type}`);
        }
    }

    _getch() {
        const buffer = Buffer.alloc(1);
        try {
            fs.readSync(0, buffer, 0, 1);
            if (buffer[0] === 3) process.exit(0);
            return buffer[0];
        } catch (e) { return 0; }
    }
}

module.exports = Interpreter;