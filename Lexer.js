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

            console.log(element);
            if (element == ' ' || element == '\t') continue;
            else if (element == '(')  lexer.push(TokenType.LEFT_PAREN);
            else if (element == ')')  lexer.push(TokenType.RIGHT_PAREN);
            else if (element == '$')  lexer.push(TokenType.IDENTIFIER_DOLAR);
            else if (element == '%')  lexer.push(TokenType.IDENTIFIER_PROCENT);
            else if (element == '+')  lexer.push(TokenType.ADD);
            else if (element == '-')  lexer.push(TokenType.MINUS);
            else if (element == '=')  lexer.push(TokenType.EQUAL);
            else if (element == 'o')  {
                let cmd = (this.tokens[i] + this.tokens[i + 1] + this.tokens[i + 2]);
                if (cmd == 'out') lexer.push(TokenType.OUT);
                i += 3;
                continue;
            }
            else if (element == 'i')  {
                let cmd = (this.tokens[i] + this.tokens[i + 1]);
                if (cmd == 'in') lexer.push(TokenType.IN);
                i += 2;
                continue;
            }
            else if (element == 'r')  {
                let cmd = (this.tokens[i] + 
                            this.tokens[i + 1] + 
                            this.tokens[i + 2] + 
                            this.tokens[i + 3] + 
                            this.tokens[i + 4] + 
                            this.tokens[i + 5]);
                if (cmd == 'repeat') lexer.push(TokenType.REPEAT);
                i += 6;
                continue;
            }

            else if (this.isDigit(element))  {
                while (this.tokens[i] != ' ' && this.tokens[i] != ')') {
                    i++;
                    if (this.isDigit(this.tokens[i])) element += element += this.tokens[i];
                }
                lexer.push(TokenType.NUMBER);
                i--;
            }
        }

        lexer.push(TokenType.EOF);
        return lexer // return an array
    }
}

module.exports = Lexer;