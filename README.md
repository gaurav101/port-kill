# @gks101/port-kill

[![npm version](https://img.shields.io/badge/npm-v1.0.1-blue.svg)](https://www.npmjs.com/package/@gks101/port-kill)
[![node](https://img.shields.io/badge/node-%3E%3D16-339933.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Lightweight cross-platform port termination for Node.js: programmatic API (`portKill`, `portKillSync`) plus CLI (`port-kill`) with zero runtime dependencies.

## Highlights

- Supports macOS/Linux and Windows.
- POSIX lookup uses `lsof` first, then `fuser` fallback.
- Windows lookup uses `netstat -ano` and kills with `taskkill /T` (`/F` when force is enabled).
- Supports single or multiple ports.
- Supports dry run mode, verbose logs, force/no-force, and custom logger callback.

## Install

```bash
npm install --save-dev @gks101/port-kill
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

Examples:

```bash
port-kill 3000
port-kill 3000 8080 8081
port-kill 3000 --verbose
port-kill 3000 --dry-run
port-kill 3000 --no-force
port-kill 3000 --signal SIGTERM
```

Options:

- `-h, --help`: show help.
- `-v, --version`: show CLI version.
- `-d, --verbose`: enable verbose logs.
- `--dry-run`: discover PIDs without killing.
- `--no-force`: disable force mode.
- `-s, --signal <sig>`: POSIX signal override (ignored on Windows).

## Programmatic API

```ts
import { portKill, portKillSync } from '@gks101/port-kill';
```

### Async

```ts
const results = await portKill([3000, 8080], {
  verbose: true,
  force: true
});
```

### Sync

```ts
const results = portKillSync(3000, {
  dryRun: false,
  force: true
});
```

### `PortKillOptions`

| Option | Type | Default | Notes |
|---|---|---|---|
| `force` | `boolean` | `true` | POSIX: `SIGKILL`; Windows: adds `taskkill /F`. |
| `signal` | `string` | `SIGKILL` or `SIGTERM` | Only used on POSIX. If `force: false`, fallback is `SIGTERM`. |
| `verbose` | `boolean` | `false` | Enables debug-level logs. |
| `dryRun` | `boolean` | `false` | Finds matching PIDs and returns success result without termination. |
| `logger` | `(message, level) => void` | `undefined` | Receives raw message and level (`info`, `warn`, `error`, `debug`). |

### `PortKillResult`

Each port returns:

- `port: number`
- `success: boolean`
- `pids: number[]`
- `message: string`
- `error?: string`
- `timestamp: string`

## Notes

- Requires system tools available in PATH:
  - POSIX: `lsof`, `fuser`, `kill`
  - Windows: `netstat`, `taskkill`
- Signals are ignored on Windows.

## License

Apache-2.0
