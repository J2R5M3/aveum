const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts', 'AudioNFT.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const findImports = (importPath) => {
  const importFullPath = path.resolve(__dirname, '../node_modules', importPath);
  if (fs.existsSync(importFullPath)) {
    return { contents: fs.readFileSync(importFullPath, 'utf8') };
  }
  return { error: 'File not found' };
};

const input = {
  language: 'Solidity',
  sources: {
    'AudioNFT.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  console.error('Compilation errors:');
  console.error(JSON.stringify(output.errors, null, 2));
  process.exit(1);
}

const artifact = {
  abi: output.contracts['AudioNFT.sol'].AudioNFT.abi,
  bytecode: output.contracts['AudioNFT.sol'].AudioNFT.evm.bytecode.object,
};

fs.writeFileSync(
  path.resolve(__dirname, '../artifacts', 'AudioNFT.json'),
  JSON.stringify(artifact, null, 2)
);

console.log('Contract compiled successfully!');
