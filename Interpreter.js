const fs = require('fs');

class Interpreter {
    constructor() {
        this.environment = {
            '$': 0,
            '%': 0,
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
        const tokens = condStr.match(/(-e|-ne)|(\$|%)|(\d+)/g);
        
        if (!tokens || tokens.length < 3) return false;

        const op = tokens[0];
        const getVal = (raw) => {
            if (raw === '$' || raw === '%') return this.environment[raw];
            return parseInt(raw, 10);
        };

        const left = getVal(tokens[1]);
        const right = getVal(tokens[2]);

        switch (op) {
            case '-e':  return left === right;
            case '-ne': return left !== right;
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

            case 'AssignmentStatement': {
                const value = this.evaluate(node.value);
                this.environment[node.target.name] = value;
                return value;
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