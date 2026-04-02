const TokenType = Object.freeze({
    LEFT_PAREN:         'LEFT_PAREN',
    RIGHT_PAREN:        'RIGHT_PAREN',
    IDENTIFIER_DOLAR:   'IDENTIFIER_$',
    LEFT_BRACKET:       'LEFT_BRACKET',
    RIGHT_BRACKET:      'RIGHT_BRACKET',
    OUT:                'OUT_FUNCTION',
    IN:                 'IN_FUNCTION',
    ADD:                'PLUS',
    MINUS:              'MINUS',
    EQUAL:              'EQUAL',
    REPEAT:             'REPEAT_FUNCTION',
    NUMBER:             'NUMBER',
    EOF:                'EOF'
});

class Lexer {
    constructor(tokens) {
        this.tokens = tokens;
    }

    isDigit(c) { return c >= '0' && c <= '9'; }
    isAlpha(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'); }

    getLexeredCode() {
        let lexer = [];
        for (let i = 0; i < this.tokens.length; i++) {
            let element = this.tokens[i];

            if (/\s/.test(element)) continue;
            if (element === '(') lexer.push({ type: TokenType.LEFT_PAREN });
            else if (element === ')') lexer.push({ type: TokenType.RIGHT_PAREN });
            else if (element === '$') lexer.push({ type: TokenType.IDENTIFIER_DOLAR });
            else if (element === '[') lexer.push({ type: TokenType.LEFT_BRACKET });
            else if (element === ']') lexer.push({ type: TokenType.RIGHT_BRACKET });
            else if (element === '+') lexer.push({ type: TokenType.ADD });
            else if (element === '-') lexer.push({ type: TokenType.MINUS });
            else if (element === '=') lexer.push({ type: TokenType.EQUAL });
            else if (element === 'o' && this.tokens[i+1] === 'u' && this.tokens[i+2] === 't') {
                lexer.push({ type: TokenType.OUT });
                i += 2;
            } 
            
            else if (element === 'i' && this.tokens[i+1] === 'n') {
                lexer.push({ type: TokenType.IN });
                i += 1;
            } 
            
            else if (element === 'r') {
                let word = this.tokens.slice(i, i+6).join('');
                if (word === 'repeat') {
                    i += 6;
                    while (i < this.tokens.length && this.tokens[i] !== '{') i++;
                    i++;
                    let cond = "";
                    while (i < this.tokens.length && this.tokens[i] !== '}') {
                        cond += this.tokens[i];
                        i++;
                    }
                    lexer.push({ type: TokenType.REPEAT, condition: cond.trim() });
                }
            } 
            
            else if (this.isDigit(element)) {
                let numStr = "";
                while (i < this.tokens.length && this.isDigit(this.tokens[i])) 
                    numStr += this.tokens[i++];
                
                i--;
                lexer.push({ type: TokenType.NUMBER, val: parseInt(numStr, 10) });
            }
            else if (element == "\"") {
                i++;
                element = this.tokens[i].charCodeAt(0);
                lexer.push({ type: TokenType.NUMBER, val: parseInt(element, 10) });
                i++
            }
        }
        lexer.push({ type: TokenType.EOF });
        return lexer;
    }
}

module.exports = Lexer;