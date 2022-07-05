#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

const linkerPath = `~/.everdev/solidity/tvm_linker`;
const stdlibPath = `~/.everdev/solidity/stdlib_sol.tvm`;

const args = process.argv.slice(2);
try {
    const cmd = `${linkerPath} ${args.join(" ")} --lib ${stdlibPath}`;
    const buf = execSync(cmd);
    process.stdout.write(buf.toString());
} catch (err) {
    process.stderr.write(err.toString());
}