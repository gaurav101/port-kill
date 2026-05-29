/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const LIBRARY_FILES: SourceFile[] = [
  {
    name: "types.ts",
    path: "port-kill-pkg/src/types.ts",
    language: "typescript",
    description: "Definition of operational options, custom log interfaces, and standardized return structures.",
    content: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortKillOptions {
  /**
   * The port (or array of ports) to terminate processes on.
   */
  port: number | number[];
  
  /**
   * Force termination. Maps to SIGKILL on Unix systems, and \`/F\` on Windows.
   * @default true
   */
  force?: boolean;
  
  /**
   * The termination signal to send (Unix systems only).
   * @default 'SIGKILL' (or 'SIGTERM' depending on \`force\` flag)
   */
  signal?: 'SIGKILL' | 'SIGTERM' | 'SIGINT' | string;
  
  /**
   * Enable verbose console logging.
   * @default false
   */
  verbose?: boolean;

  /**
   * Custom logging function to intercept logs instead of standard console output.
   */
  logger?: (message: string, level?: 'info' | 'warn' | 'error' | 'debug') => void;

  /**
   * If true, will find the processes and logs them without actually killing them.
   * Great for workflows needing audit or confirmation before termination.
   * @default false
   */
  dryRun?: boolean;
}

export interface PortKillResult {
  /**
   * The port targeted for termination.
   */
  port: number;
  
  /**
   * Whether the operation was completed successfully (or no processes were listening).
   */
  success: boolean;
  
  /**
   * List of process IDs (PIDs) identified on this port.
   */
  pids: number[];
  
  /**
   * Descriptive text outcome of the operation.
   */
  message: string;
  
  /**
   * Error message if the operation failed.
   */
  error?: string;
  
  /**
   * Timestamp when the port kill was executed.
   */
  timestamp: string;
}`
  },
  {
    name: "platforms.ts",
    path: "port-kill-pkg/src/platforms.ts",
    language: "typescript",
    description: "Multi-platform logic for querying socket states (lsof, fuser, netstat) and terminating PID trees.",
    content: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { PortKillOptions, PortKillResult } from './types';

function createLogger(options: PortKillOptions) {
  const isVerbose = !!options.verbose;
  const customLogger = options.logger;

  return (message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') => {
    if (!isVerbose && level === 'debug') return;
    
    const formatted = \`[port-kill] [\${level.toUpperCase()}] \${message}\`;
    if (customLogger) {
      customLogger(message, level);
    } else {
      switch (level) {
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'info':
        case 'debug':
        default:
          console.log(formatted);
          break;
      }
    }
  };
}

function runCommand(command: string, log: ReturnType<typeof createLogger>): { stdout: string; success: boolean; error?: string } {
  try {
    log(\`Executing system command: "\${command}"\`, 'debug');
    const stdout = execSync(command, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    return { stdout: stdout || '', success: true };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    log(\`Command failed or returned non-zero code. Error: \${errMsg}\`, 'debug');
    return { stdout: '', success: false, error: errMsg };
  }
}

function findPidsUnix(port: number, log: ReturnType<typeof createLogger>): number[] {
  const lsofCmd = \`lsof -t -n -i :\${port}\`;
  const { stdout, success } = runCommand(lsofCmd, log);
  
  if (success && stdout.trim()) {
    const pids = stdout
      .split('\\n')
      .map(line => parseInt(line.trim(), 10))
      .filter(pid => !isNaN(pid));
    return pids;
  }

  log(\`lsof yielded no active PIDs for port \${port}. Trying alternative "fuser" fallback...\`, 'debug');
  const fuserCmd = \`fuser \${port}/tcp\`;
  const fuserResult = runCommand(fuserCmd, log);
  
  if (fuserResult.stdout.trim()) {
    const pids = fuserResult.stdout
      .split(/\\s+/)
      .map(part => parseInt(part.trim(), 10))
      .filter(pid => !isNaN(pid));
    return pids;
  }
  return [];
}

function findPidsWindows(port: number, log: ReturnType<typeof createLogger>): number[] {
  const netstatCmd = 'netstat -ano';
  const { stdout, success } = runCommand(netstatCmd, log);
  
  if (!success || !stdout) return [];

  const pids: number[] = [];
  const lines = stdout.split('\\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const parts = trimmed.split(/\\s+/);
    if (parts.length < 5) continue;
    
    const localAddress = parts[1];
    const pidStr = parts[parts.length - 1];
    const pid = parseInt(pidStr, 10);
    
    if (isNaN(pid)) continue;
    
    const portMatch = new RegExp(\`[:\\\\\]]\${port}$\`);
    if (portMatch.test(localAddress) && !pids.includes(pid)) {
      pids.push(pid);
    }
  }
  return pids;
}

function killPidsUnix(pids: number[], signalStr: string, log: ReturnType<typeof createLogger>): { success: boolean; error?: string } {
  const pidString = pids.join(' ');
  const killCmd = \`kill -\${signalStr} \${pidString}\`;
  const { success, error } = runCommand(killCmd, log);
  return { success, error };
}

function killPidsWindows(pids: number[], force: boolean, log: ReturnType<typeof createLogger>): { success: boolean; error?: string } {
  let successCount = 0;
  let errors: string[] = [];

  for (const pid of pids) {
    const forceFlag = force ? '/F' : '';
    const taskkillCmd = \`taskkill \${forceFlag} /T /PID \${pid}\`;
    const result = runCommand(taskkillCmd, log);
    if (result.success) successCount++;
    else if (result.error) errors.push(result.error);
  }

  return { success: successCount === pids.length, error: errors.join('; ') };
}

export function killSinglePort(port: number, options: PortKillOptions = {}): PortKillResult {
  const timestamp = new Date().toISOString();
  const log = createLogger(options);
  const isWindows = process.platform === 'win32';
  const pids = isWindows ? findPidsWindows(port, log) : findPidsUnix(port, log);
  
  if (pids.length === 0) {
    return { port, success: true, pids: [], message: \`Port \${port} is free.\`, timestamp };
  }

  if (options.dryRun) {
    return { port, success: true, pids, message: \`[DRY_RUN] Probed PIDs [\${pids.join(', ')}].\`, timestamp };
  }

  const force = options.force !== false;
  
  if (isWindows) {
    const result = killPidsWindows(pids, force, log);
    return { port, success: result.success, pids, message: result.success ? "Killed Windows process" : "Error", error: result.error, timestamp };
  } else {
    const signal = options.signal || (force ? 'SIGKILL' : 'SIGTERM');
    const result = killPidsUnix(pids, signal, log);
    return { port, success: result.success, pids, message: result.success ? "Killed POSIX process" : "Error", error: result.error, timestamp };
  }
}`
  },
  {
    name: "index.ts",
    path: "port-kill-pkg/src/index.ts",
    language: "typescript",
    description: "Primary programmatic package entrypoint exporting synchronous and asynchronous functions.",
    content: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions, PortKillResult } from './types';
import { killSinglePort } from './platforms';

export * from './types';

export function portKillSync(
  ports: number | number[],
  options: PortKillOptions = {}
): PortKillResult[] {
  const portList = Array.isArray(ports) ? ports : [ports];
  const results: PortKillResult[] = [];

  for (const port of portList) {
    try {
      results.push(killSinglePort(port, options));
    } catch (err: any) {
      results.push({
        port,
        success: false,
        pids: [],
        message: \`Unexpected error targeting port \${port}: \${err?.message || String(err)}\`,
        error: err?.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
  }
  return results;
}

export async function portKill(
  ports: number | number[],
  options: PortKillOptions = {}
): Promise<PortKillResult[]> {
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve(portKillSync(ports, options));
    });
  });
}

export default portKill;`
  },
  {
    name: "cli.ts",
    path: "port-kill-pkg/src/cli.ts",
    language: "typescript",
    description: "Zero-dependency binary parser mapping options and multiple ports accurately.",
    content: `#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { portKillSync } from './index';
import { PortKillOptions } from './types';

function runCli() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(\`
  Usage: port-kill <ports...> [options]

  Options:
    -h, --help          Show this helper guide
    -v, --version       Show version information
    -d, --verbose       Enable verbose debugging/monitoring logs
    -s, --signal <sig>  Specify custom termination signal (Unix-only)
    --no-force          Graceful terminate instead of aggressive (SIGKILL)
    --dry-run           Search, detect processes without killing them
    \`);
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log('port-kill v1.0.0');
    process.exit(0);
  }

  const ports: number[] = [];
  const options: PortKillOptions = { port: [], force: true };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-d') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-force') {
      options.force = false;
    } else if (arg === '--signal' || arg === '-s') {
      options.signal = args[++i];
    } else {
      const port = parseInt(arg, 10);
      if (isNaN(port)) {
        console.error(\`Error: Invalid option "\${arg}"\`);
        process.exit(1);
      }
      ports.push(port);
    }
  }

  const results = portKillSync(ports, options);
  let exitCode = 0;
  for (const res of results) {
    if (res.success) {
      console.log(\`✓ [Port \${res.port}] Cleaned. Discovered PIDs: [\${res.pids.join(', ')}]\`);
    } else {
      console.error(\`✗ [Port \${res.port}] Failed. \${res.error || ''}\`);
      exitCode = 1;
    }
  }
  process.exit(exitCode);
}

if (require.main === module || !module.parent) {
  runCli();
}`
  },
  {
    name: "package.json",
    path: "port-kill-pkg/package.json",
    language: "json",
    description: "NPM Package Manifest configurations representing distribution paths, binary bindings, keywords, and versions.",
    content: `{
  "name": "@gks101/port-kill",
  "version": "1.0.0",
  "description": "Highly maintainable, lightweight, cross-platform programmatic API and zero-dependency CLI tool to terminate processes running on specific ports.",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "port-kill": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "echo \\"Error: run tests directly via jest/mocha\\""
  },
  "keywords": [
    "port-kill",
    "kill-port",
    "port-kill-cli",
    "process-kill",
    "cross-platform",
    "test-cleanup"
  ],
  "author": "Gaurav Singh <gaurav.kr.singh1@gmail.com>",
  "license": "Apache-2.0",
  "publishConfig": {
    "access": "public"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`
  }
];
