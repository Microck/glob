const { spawnSync } = require('child_process');
const path = require('path');

const binaryPath = 'C:\\Users\\Microck\\AppData\\Roaming\\npm\\node_modules\\opencode-ai\\node_modules\\opencode-windows-x64-baseline\\bin\\opencode.exe';

console.log('Testing spawnSync with opencode.exe...');
console.log('Binary path:', binaryPath);
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Arch:', process.arch);
console.log('');

try {
  const result = spawnSync(binaryPath, ['--version'], {
    stdio: 'inherit',
  });

  console.log('Result status:', result.status);
  console.log('Result signal:', result.signal);
  console.log('Result error:', result.error);

  if (result.error) {
    console.log('Error code:', result.error.code);
    console.log('Error syscall:', result.error.syscall);
    console.log('Error errno:', result.error.errno);
  }
} catch (err) {
  console.log('Exception caught:', err.message);
}
