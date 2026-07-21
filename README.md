# Zip Esoteric Language (zipcc)
![GitHub repo size](https://img.shields.io/github/repo-size/KamilMalicki/Zip?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/KamilMalicki/Zip?style=flat-square&color=orange)
![GitHub stars](https://img.shields.io/github/stars/KamilMalicki/Zip?style=flat-square&social)
![Architecture](https://img.shields.io/badge/Architecture-x86__64-red?style=flat-square)
![Format](https://img.shields.io/badge/Output-ELF_%7C_PE-CC0000?style=flat-square)
![Type](https://img.shields.io/badge/Type-AOT_Compiler-informational?style=flat-square)
![Paradigm](https://img.shields.io/badge/Paradigm-Stack--Based-blueviolet?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-v14%2B-339933?style=flat-square&logo=node.js)
![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=flat-square&logo=javascript)
![Target](https://img.shields.io/badge/Target-x86__64_ASM-00599C?style=flat-square&logo=assemblyscript)
![OS](https://img.shields.io/badge/OS-Linux_%7C_Windows-0078D4?style=flat-square&logo=linux)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)

```text
  _____  _         
 |__  / (_) _ __   
   / /  | || '_ \  
  / /_  | || |_) | 
 /____| |_|| .__/  
           |_|     
   Minimalist AOT Compiler
```

**Zip** is a minimalist, stack-and-memory-oriented esoteric language designed for high-performance native execution. This repository provides a complete toolchain, including a Lexer, Parser, AST Interpreter, and a native Ahead-of-Time (AOT) Compiler that generates x86_64 machine code for both Linux (ELF) and Windows (PE) platforms.

## Technical Specifications

### Memory Model
Zip utilizes a cell-based memory architecture. 
* **Addressing:** Memory is accessed via the `$[index]` syntax.
* **Storage:** The compiler maps memory to a heap-allocated region using the `r12` register as a base pointer.
* **Word Size:** Each memory slot is treated as a 64-bit (8-byte) integer.

### Instruction Set
The language uses S-expressions for operation nesting:
* `(= $[target] value)`: Assignment to a memory cell.
* `(+ a b)` / `(- a b)`: Basic 64-bit arithmetic operations.
* `(out value)`: Writes a single byte (ASCII) to `stdout`.
* `(in)`: Reads a single byte from `stdin`.
* `(repeat {condition} body)`: A conditional loop that executes while the condition evaluates to false.

## Turing Completeness

Zip is **Turing Complete** as it meets the requirements for a Universal Turing Machine:
1. **Infinite Tape emulation:** Provided by the arbitrary indexed memory `$[index]`.
2. **Pointer Indirection:** Achieved through nested memory access (e.g., `$[ $[0] ]`).
3. **Conditional Branching:** Implemented via the `repeat` statement with comparison operators (`-e`, `-ne`, `-l`, `-g`).

## Compiler Architecture

The compiler translates the AST into raw x86_64 machine code without an external assembler or linker.

### Linux (ELF)
* **Memory Allocation:** Uses the `mmap` syscall (`0x09`) to reserve a 64KB memory region for the program's workspace.
* **Execution:** Generates a standard ELF64 header with a single `LOAD` segment.
* **Exit:** Appends a `sys_exit` (`0x3C`) syscall at the end of the instruction stream.

### Windows (PE)
* **Header:** Generates a valid DOS MZ header and a PE COFF header.
* **Section:** Emits a `.text` section containing the executable code.
* **Entry:** Uses a `ret` (`0xC3`) based exit strategy for the execution flow.

---
## Usage

### Extension
The standard file extension for Zip source code is `.zp`.

### Prerequisites
* Node.js (v14+)

### Execution
To interpret a program:
```bash
node zipcc.js <file.zp> -i
```

To compile to a native binary:
```bash
node zipcc.js <file.zp> -c -o <output_name>
```


## Example: Echo Program (`echo.zp`)
```lisp
# Read a character and print it back
(= $[0] (in))
(out $[0])
(out 10) # Newline
```




### Example: Hello World (`hello.zp`)
```lisp
(out 72) (out 101) (out 108) (out 108) (out 111) (out 32)
(out 87) (out 111) (out 114) (out 108) (out 100) (out 33)
(out 10)
```

---

**Author:** Kamil Malicki
**License:** Apache 2.0
**Repository:** [GitHub](https://Github.com/KamilMalicki/Zip)
