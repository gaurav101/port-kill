# @gks101/port-kill

[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/@gks101/port-kill)
[![Build Status](https://img.shields.io/badge/build-passing-success.svg)](https://github.com/gks101/port-kill/actions)
[![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/gks101/port-kill)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A highly maintainable, lightweight, cross-platform programmatic API and zero-dependency CLI tool to terminate processes running on specific ports. Designed specifically for Node.js developers seeking seamless integration into test suites (like Jest/Mocha), DevOps CI pipelines, and daily workflows.

---

## 🚀 Key Advantages

- **Zero Outside Dependencies**: Instants downloads and light bandwidth impact when executing with `npx`.
- **Deep Cross-Platform Support**: Seamless operation on Linux, macOS, and Windows.
- **Robust Multi-Lookup fallbacks**: Employs optimized `lsof` commands, falling back to `fuser` on Linux, and safe regex-parsed `netstat` sequences on Windows.
- **Support for Both Async & Sync Runs**: Tailored API models to cleanly terminate ports in async workflows or blocking testing hooks (`beforeAll` or `afterAll`).
- **Comprehensive Process Tree Termination**: Kills starting process trees (Windows `/T` flags and signal bubbles) to avoid leaving detached zombie sockets.
- **Dry-run & Auditing Safeguards**: Survey and log target port owners before issuing SIGKILL commands.

---

## 💻 Installation

Install globally for CLI use:
```bash
npm install -g @gks101/port-kill
```

Or install locally for development packages or testing teardown fixtures:
```bash
npm install --save-dev @gks101/port-kill
```

---

## 🛠 Usage Instructions

### 1. Command Line Interface (CLI)

Use `port-kill` directly followed by the target ports. You can target single or multiple ports synchronously:

```bash
# Terminate processes on port 3000
port-kill 3000

# Terminate processes on ports 3000, 8080, and 8081 together
port-kill 3000 8080 8081

# Run with verbose debugging/monitoring logs
port-kill 3000 --verbose

# Perform an audit/dry-run (checks what lives on that port, doesn't kill)
port-kill 3000 --dry-run

# Specify custom Unix signals (Unix environments only)
port-kill 3000 --signal SIGTERM

# Graceful terminate instead of aggressive immediate force kill
port-kill 3000 --no-force
```

#### Running on the fly via NPX:
```bash
npx @gks101/port-kill 3000
```

---

### 2. Programmatic Integration

Perfect for Node.js backends and pipeline orchestrations.

#### Asynchronous Execution (Standard):
```typescript
import { portKill, PortKillResult } from '@gks101/port-kill';

async function setupServer() {
  try {
    // Release port 3000 and 8080 before spinning up your express app
    const results: PortKillResult[] = await portKill([3000, 8080], {
      verbose: true,
      force: true
    });
    
    results.forEach(res => {
      if (res.success) {
        console.log(`Port ${res.port} clean! Discovered PIDs:`, res.pids);
      } else {
        console.error(`Could not clean port ${res.port}:`, res.error);
      }
    });
  } catch (error) {
    console.error('Fatal crash during port clearing:', error);
  }
}
```

#### Synchronous Execution (Best for Test Suites):
Use `portKillSync` in `jest` or `mocha` lifecycles to guarantee clean sockets before running HTTP assertions.

```typescript
import { portKillSync } from '@gks101/port-kill';
import http from 'http';

describe('Express Integration Tests', () => {
  const PORT = 4500;
  let server: http.Server;

  beforeAll(() => {
    // Force clean the port synchronously before binding
    portKillSync(PORT, { verbose: false, force: true });
    
    server = express().listen(PORT);
  });

  afterAll((done) => {
    server.close(() => {
      // Sweep and clear at tear-down to keep the workspace tidy
      portKillSync(PORT);
      done();
    });
  });
});
```

---

## ⚙ API Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `port` | `number \| number[]` | *Required* | Single port or list of ports to terminate processes on. |
| `force` | `boolean` | `true` | When true, maps to hard/forced aborts (`SIGKILL` on POSIX, `/F` on taskkill). |
| `signal` | `string` | `'SIGKILL'` | Unix-specific term command argument (ignored on Windows). |
| `verbose`| `boolean` | `false` | Emits internal platform commands & operational traces. |
| `dryRun` | `boolean` | `false` | Scan and identify active process groups without emitting kills. |
| `logger` | `function` | `console` | Custom logging callback: `(msg: string, level: string) => void`. |

---

## 📂 Structure & Architecture

The package uses a small Strategy + Factory Method architecture for long-term maintenance:

- `PlatformStrategy` isolates platform behavior for process discovery and termination.
- `UnixPortStrategy` handles `lsof`, `fuser`, and POSIX `kill` behavior.
- `WindowsPortStrategy` handles `netstat` parsing and `taskkill` behavior.
- `PlatformStrategyFactory` selects the correct strategy from `process.platform`.
- `UnixCommandFactory` and `WindowsCommandFactory` create the shell commands used by each strategy.

```text
port-kill-pkg/
├── src/
│   ├── index.ts              # Programmatic endpoints (portKill / portKillSync)
│   ├── types.ts              # Public TypeScript interfaces
│   ├── cli/
│   │   ├── index.ts          # Thin CLI entrypoint
│   │   ├── messages.ts       # CLI help, version, and error text
│   │   ├── parser.ts         # Typed CLI argument parser
│   │   └── reporter.ts       # CLI output rendering
│   ├── commands/
│   │   ├── constants.ts      # Command binaries, flags, and shared arguments
│   │   ├── diagnostics.ts    # User-facing command failure diagnostics
│   │   ├── factories.ts      # Factory Method command builders per platform
│   │   └── runner.ts         # Shared shell execution boundary
│   ├── platform/
│   │   ├── service.ts        # Result orchestration over the selected strategy
│   │   ├── results.ts        # Result factory helpers
│   │   ├── factory.ts        # Factory Method for runtime strategy selection
│   │   └── strategies.ts     # POSIX and Windows strategy implementations
│   └── shared/
│       └── logger.ts         # Shared logger adapter
├── package.json        # NPM package descriptor
├── tsconfig.json       # Compiling presets for Node modules (dist outputs)
└── README.md           # This document
```

---

## 🤝 Contribution Guidelines

We highly encourage contributions from the developer community! Here is how to submit improvements:

1. **Fork the Repository** and clone it to your local machine.
2. **Implement enhancements** inside the `/src` folder. Keep changes highly modular and self-documenting.
3. **Verify building and typing**: Ensure there are no TSC or linter report issues.
4. **Draft PRs**: Write clean documentation detailing the reasoning behind signal improvements or platform fallbacks.

All contributors list and status is updated on live shields. Thank you for keeping workflows clean!

---

## 📜 License

Licensed under the Apache License, version 2.0. Copyright (c) 2026 Gaurav Singh.
