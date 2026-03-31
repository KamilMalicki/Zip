class Tokenizer {
    code = ""
    constructor(code = "") {
        this.code = code
    }

    getTokens() {
        var element = [];
        var lines = this.code.split('\n');
        lines.forEach(line => {
            if (line.startsWith('#')) { }
            else {
                for (let i = 0; i < line.length; i++) {
                    element.push(line[i].trim());
                }
            }
        });

        return element // return an array
    }
}

module.exports = Tokenizer;