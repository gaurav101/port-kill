# @gks101/port-kill

[![npm version](https://img.shields.io/badge/npm-v1.0.2-blue.svg)](https://www.npmjs.com/package/@gks101/port-kill)
[![node](https://img.shields.io/badge/node-%3E%3D16-339933.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Lightweight cross-platform port termination for Node.js with programmatic APIs (`portKill`, `portKillSync`) and CLI (`port-kill`), with zero runtime dependencies.

## Highlights

- Cross-platform support: Windows, macOS, Linux.
- Multi-port targeting in one command.
- Supports verbose logs, dry-run audits, force/graceful termination, and signal override.
- Safe defaults for dev/test/CI port cleanup workflows.

## Compatibility

| Area                  | Support / Requirement                                            | Notes                                                            |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| Node.js               | `>=16.0.0`                                                       | Declared in package `engines.node`.                              |
| Windows               | `cmd.exe`, PowerShell                                            | Uses `netstat` for PID discovery and `taskkill` for termination. |
| macOS                 | Terminal shells (zsh/bash)                                       | Uses `lsof` with `fuser` fallback, and `kill`.                   |
| Linux                 | Terminal shells (bash/sh/zsh)                                    | Uses `lsof` with `fuser` fallback, and `kill`.                   |
| Required system tools | `lsof`, `fuser`, `kill` (POSIX); `netstat`, `taskkill` (Windows) | Must be available in `PATH`.                                     |

### Permission behavior

- Killing processes on protected/privileged ports (for example `80`, `443`) may require elevated privileges.
- On macOS/Linux this can require `sudo`.
- On Windows this can require an elevated Administrator shell.
- Without required privileges, commands can fail for those ports and return a non-zero CLI exit code.

## Installation

Local (project/test workflows):

```bash
npm install --save-dev @gks101/port-kill
yarn add -D @gks101/port-kill
pnpm add -D @gks101/port-kill
```

Global CLI install (optional):

```bash
npm install -g @gks101/port-kill
```

Run without install:

```bash
npx @gks101/port-kill 3000
```

## CLI

```bash
port-kill <ports...> [options]
```

### CLI examples

```bash
# Single port
port-kill 3000

# Multiple ports in one run
port-kill 3000 8080

# Multiple ports with logs
port-kill 3000 8080 --verbose

# Graceful signal on POSIX
port-kill 3000 8080 --no-force --signal SIGTERM
```

### CLI flags

| Flag             | Alias | Type   | Default                             | Description                                               |
| ---------------- | ----- | ------ | ----------------------------------- | --------------------------------------------------------- |
| `--help`         | `-h`  | none   | n/a                                 | Show help and exit with code `0`.                         |
| `--version`      | `-v`  | none   | n/a                                 | Show version and exit with code `0`.                      |
| `--verbose`      | `-d`  | none   | `false`                             | Print verbose execution details.                          |
| `--dry-run`      | none  | none   | `false`                             | Discover PIDs without killing them.                       |
| `--force`        | none  | none   | `true`                              | Explicitly enforce aggressive termination mode.           |
| `--no-force`     | none  | none   | `false` (toggle)                    | Disable force mode and use graceful termination behavior. |
| `--signal <sig>` | `-s`  | string | OS-derived (`SIGKILL` or `SIGTERM`) | POSIX-only signal override (ignored on Windows).          |

## Programmatic API

```ts
import { portKill, portKillSync } from '@gks101/port-kill';
```

### Function signatures

```ts
type PortKillSignal = 'SIGKILL' | 'SIGTERM' | 'SIGINT' | string;

interface PortKillOptions {
  force?: boolean;
  signal?: PortKillSignal;
  verbose?: boolean;
  dryRun?: boolean;
  logger?: (message: string, level?: 'info' | 'warn' | 'error' | 'debug') => void;
}

interface PortKillResult {
  port: number;
  success: boolean;
  pids: number[];
  message: string;
  error?: string;
  timestamp: string;
}

declare function portKill(
  ports: number | number[],
  options?: PortKillOptions
): Promise<PortKillResult[]>;

declare function portKillSync(
  ports: number | number[],
  options?: PortKillOptions
): PortKillResult[];
```

### Programmatic examples (multi-port)

```ts
import { portKill, portKillSync } from '@gks101/port-kill';

const asyncResults = await portKill([3000, 8080], {
  verbose: true,
  force: true,
});

const syncResults = portKillSync([3000, 8080], {
  force: false,
  signal: 'SIGTERM',
});
```

## Error and exit behavior

- If a port is already free (no active process found), operation is treated as success.
  - Programmatic: returns `success: true` for that port.
  - CLI: prints `Already free` and keeps exit code `0` (unless another targeted port fails).
- CLI returns exit code `1` for parse errors, invalid signals, invalid ports, permission failures, or kill failures.

### Chaining note (`&&`)

If you chain with `&&`, later commands run only when `port-kill` exits with `0`.

```bash
port-kill 3000 8080 && npm run dev
```

Use this when you want hard-stop behavior. If you want dev server boot to continue even if cleanup fails, use an alternative chain strategy in your shell.

## Security notes

- PID lookup and kill are separate OS calls, so a TOCTOU race window can exist on high-churn hosts.
- System binaries are resolved from `PATH` (`lsof`, `fuser`, `netstat`, `kill`, `taskkill`).
- Prefer trusted runtime environments; use elevated privileges only when needed.

## License

Apache-2.0
