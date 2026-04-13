# Zip Esoteric Language (zipcc)

    [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)


## Overview

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