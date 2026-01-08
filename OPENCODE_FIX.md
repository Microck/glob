# opencode EFTYPE Error Fix

## Issue
When running `opencode` command on Windows with Node.js v24.12.0, got error:
```
spawnSync C:\Users\Microck\AppData\Roaming\npm\node_modules\opencode-ai\node_modules\opencode-windows-x64-baseline\bin\opencode.exe EFTYPE
```

## Root Cause
Node.js v24 introduced a breaking change for security (CVE-2024-27980) that:
- Prevents spawning `.exe` files directly with `spawnSync` on Windows without `shell: true`
- The `opencode-windows-x64-baseline` binary doesn't work with this new Node.js behavior
- Error code `EFTYPE` (-4028) indicates "wrong executable type" for spawnSync on Windows

## Investigation
1. Verified opencode.exe exists and is valid PE32+ x86-64 executable
2. Confirmed Node.js v24.12.0 x64 on Windows 10.0.19045
3. Tested spawnSync with `shell: true` option - still times out
4. Tested running binary directly via cmd.exe - works perfectly
5. Found that `opencode-windows-x64-baseline` package is incompatible with Node.js v24

## Solution
Installed `opencode-windows-x64` (non-baseline) version:
```bash
cd "C:/Users/Microck/AppData/Roaming/npm/node_modules/opencode-ai"
npm install --no-save opencode-windows-x64@1.1.7
```

Updated npm shim scripts:
- `opencode.cmd`: Changed path from `opencode-windows-x64-baseline` to `opencode-windows-x64`
- `opencode.ps1`: Same path change for PowerShell

## Result
opencode now works correctly:
```
$ opencode --version
1.1.7

$ opencode --help
[works normally]
```

## Notes
- The `-baseline` variant seems to be an older build incompatible with Node.js v24
- Regular `opencode-windows-x64` works correctly
- This is likely an upstream bug in opencode-ai's optional dependencies
