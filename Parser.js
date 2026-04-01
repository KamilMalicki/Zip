class Parser {
    lexercode = []
    i = 0

    constructor(lex) {
        this.lexercode = lex
    }

    parse() {
        const body = [];
        
        while (this.peek().type !== 'EOF') {
            body.push(this.parseExpression());
        }
        
        return {
            type: 'Program',
            body: body
        };
    }

    peek() { return this.lexercode[this.i]; }
    
    advance() {
        let a = this.lexercode[this.i];
        this.i++;
        return a;
    }

    parseExpression() {
        const token = this.peek();

        if (token.type === 'NUMBER') {
            return this.Number();
        }

        if (token.type === 'IDENTIFIER_$') {
            this.advance(); 
            this.consume('LEFT_BRACKET', "Oczekiwano '[' po znaku $");
            const indexExpr = this.parseExpression();
            this.consume('RIGHT_BRACKET', "Oczekiwano ']' po indeksie pamięci");
            
            return {
                type: 'MemoryAccess',
                index: indexExpr
            };
        }

        if (token.type === 'LEFT_PAREN') {
            this.advance(); 

            const operator = this.advance(); 
            
            if (operator.type === 'OUT_FUNCTION') return this.outExpression();
            if (operator.type === 'IN_FUNCTION')  return this.inExpression();
            if (operator.type === 'PLUS')         return this.plusExpression();
            if (operator.type === 'MINUS')        return this.minusExpression();
            if (operator.type === 'EQUAL')        return this.eqExpression();
            
            if (operator.type === 'REPEAT_FUNCTION') return this.repeatExpression(operator);

            const args = [];
            while (this.peek().type !== 'RIGHT_PAREN') {
                args.push(this.parseExpression());
            }
            this.advance(); 

            return {
                type: 'CallExpression',
                operator: operator,
                arguments: args
            };
        }

        throw new Error(`Nieoczekiwany token: ${token.type}`);
    }

    Number() {
        const token = this.advance();
        return {
            type: 'Literal',
            value: token.val
        };
    }

    outExpression() {
        const expression = this.parseExpression(); 
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po out");
        return { type: 'PrintStatement', expression };
    }

    inExpression() {
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po in");
        return { type: 'InputStatement' };
    }

    minusExpression() {
        const left = this.parseExpression();
        const right = this.parseExpression(); 
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po -");
        return { type: 'BinaryExpression', operator: '-', left, right };
    }

    plusExpression() {
        const left = this.parseExpression(); 
        const right = this.parseExpression();
        
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po operacji +");
        return { type: 'BinaryExpression', operator: '+', left, right };
    }

    eqExpression() {
        const target = this.parseExpression(); 
        const value = this.parseExpression(); 
        
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po operacji =");
        return { type: 'AssignmentStatement', target, value };
    }

    repeatExpression(operatorToken) {
        const body = [];
        while (this.peek().type !== 'RIGHT_PAREN') {
            body.push(this.parseExpression());
        }
        this.consume('RIGHT_PAREN', "Oczekiwano ')' po bloku repeat");
        return { 
            type: 'RepeatStatement', 
            condition: operatorToken.condition, 
            body 
        };
    }

    consume(type, message) {
        if (this.peek().type === type) {
            return this.advance();
        }
        throw new Error(message + ". Znaleziono: " + this.peek().type);
    }
}

module.exports = Parser;