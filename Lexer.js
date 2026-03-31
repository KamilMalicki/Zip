const TokenType = Object.freeze({
    LEFT_PAREN:         'LEFT_PAREN',
    RIGHT_PAREN:        'RIGHT_PAREN',
    IDENTIFIER_DOLAR:   'IDENTIFIER_$',
    IDENTIFIER_PROCENT: 'IDENTIFIER_%',
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
    tokens = []
    constructor(tokens) {
        this.tokens = tokens
    }

    isDigit(c) { return c >= '0' && c <= '9'; }
    getLexeredCode() {
        var lexer = [];

        for (let i = 0; i < this.tokens.length; i++) {
            let element = this.tokens[i];

            //console.log(element);
            if (element == ' ' || element == '\t') continue;
            else if (element == '(')  lexer.push({ type: TokenType.LEFT_PAREN});
            else if (element == ')')  lexer.push({ type: TokenType.RIGHT_PAREN});
            else if (element == '$')  lexer.push({ type: TokenType.IDENTIFIER_DOLAR});
            else if (element == '%')  lexer.push({ type: TokenType.IDENTIFIER_PROCENT});
            else if (element == '+')  lexer.push({ type: TokenType.ADD, val: '+' });
            else if (element == '-')  lexer.push({ type: TokenType.MINUS, val: '-' });
            else if (element == '=')  lexer.push({ type: TokenType.EQUAL, val: '=' });
            else if (element == 'o')  {
                let cmd = (this.tokens[i] + this.tokens[i + 1] + this.tokens[i + 2]);
                if (cmd == 'out') lexer.push({type: TokenType.OUT});
                i += 2;
                continue;
            }
            else if (element == 'i')  {
                let cmd = (this.tokens[i] + this.tokens[i + 1]);
                if (cmd == 'in') lexer.push({type:TokenType.IN});
                i += 1;
                continue;
            }
            else if (element == 'r')  {
                let cmd = (this.tokens[i] + 
                            this.tokens[i + 1] + 
                            this.tokens[i + 2] + 
                            this.tokens[i + 3] + 
                            this.tokens[i + 4] + 
                            this.tokens[i + 5]);
                i += 5;
                var cond = ""
                while (this.tokens[i] != '{') i++;
                i++;
                while (this.tokens[i] != '}') { 
                       cond += this.tokens[i] 
                       i++
                    }

                if (cmd == 'repeat') lexer.push({ type: TokenType.REPEAT, condition: cond});
                continue;
            }

            else if (this.isDigit(element)) {
                let numStr = element;
                while (i + 1 < this.tokens.length && this.isDigit(this.tokens[i + 1])) {
                    numStr += this.tokens[++i];
                }
                lexer.push({
                    type: TokenType.NUMBER,
                    val: parseInt(numStr) 
                });
            }
        }

        lexer.push({type: TokenType.EOF});
        return lexer // return an array
    }
}

module.exports = Lexer;