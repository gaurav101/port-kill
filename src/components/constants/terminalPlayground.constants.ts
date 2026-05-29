/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TerminalLogType = 'info' | 'warn' | 'error' | 'debug' | 'success' | 'cmd';

export type TerminalPlatform = 'unix' | 'windows';

export interface TerminalPreset {
  name: string;
  cmd: string;
  pids: number[];
  verbose: boolean;
  dryRun: boolean;
  force: boolean;
  signal: string;
}

export const TERMINAL_CONSTANTS = {
  defaultPreset: 'standard',
  defaultPlatform: 'unix' as TerminalPlatform,
  fallbackLookupPort: '3000',
  defaultForceSignal: 'SIGKILL',
  copyRuntimeDelayStartMs: 100,
  infoDelayStartMs: 600,
  debugDelayOptionsMs: 1100,
  debugDelayLookupMs: 1500,
  debugDelayLookupResultMs: 1900,
  discoveredPidDelayMs: 2400,
  dryRunCheckedDelayMs: 3000,
  dryRunCompleteDelayMs: 3500,
  killStartDelayMs: 3000,
  killDebugDelayMs: 3300,
  killSuccessDelayMs: 3600,
  killWindowsDelayStepMs: 400,
  finalSuccessDelayMs: 4100
} as const;

export const TERMINAL_KEYS = {
  UNIX: 'unix' as TerminalPlatform,
  WINDOWS: 'windows' as TerminalPlatform,
  LOG_CMD: 'cmd' as TerminalLogType,
  LOG_INFO: 'info' as TerminalLogType,
  LOG_WARN: 'warn' as TerminalLogType,
  LOG_ERROR: 'error' as TerminalLogType,
  LOG_DEBUG: 'debug' as TerminalLogType,
  LOG_SUCCESS: 'success' as TerminalLogType,
  SIG_PREFIX: 'SIG'
} as const;

export const TERMINAL_PRESETS: Record<string, TerminalPreset> = {
  standard: {
    name: 'Standard Single Target (Port 3000)',
    cmd: 'port-kill 3000',
    pids: [18451],
    verbose: false,
    dryRun: false,
    force: true,
    signal: 'SIGKILL'
  },
  verboseMultiple: {
    name: 'Verbose Multi-Target (Ports 8080 or 8081)',
    cmd: 'port-kill 8080 8081 --verbose',
    pids: [29541, 29542],
    verbose: true,
    dryRun: false,
    force: true,
    signal: 'SIGKILL'
  },
  dryAudit: {
    name: 'Safe Dry-Run Audit (Port 5000)',
    cmd: 'port-kill 5000 --dry-run',
    pids: [91244],
    verbose: true,
    dryRun: true,
    force: true,
    signal: 'SIGKILL'
  },
  graceful: {
    name: 'Graceful Termination (Port 8000)',
    cmd: 'port-kill 8000 --no-force --signal SIGTERM',
    pids: [412],
    verbose: false,
    dryRun: false,
    force: false,
    signal: 'SIGTERM'
  }
};

export const TERMINAL_CONTENT = {
  simulateExecution: 'Simulate Runtime Execution',
  simulateDescription:
    'Witness how the port-kill library queries, logs, and processes termination on the system.',
  unixLabel: 'macOS / Linux',
  windowsLabel: 'Windows (Win32)',
  selectPresetLabel: 'Select Preset Workflow',
  runningLabel: 'Executing Mock...',
  runLabel: 'Run Simulation',
  terminalTitle: 'port-kill-sandbox-terminal',
  platformLabel: 'platform:',
  posixShell: 'posix-shell',
  powershell: 'powershell',
  emptyReadyTitle: 'Ready to roll command diagnostics',
  emptyReadyDescription: 'Select a preset above and click "Run Simulation" to trace PIDs',
  commandPrefix: '$ ',
  successPrefix: '✓'
} as const;

export const TERMINAL_LOG_MESSAGES = {
  initiating: '[port-kill] [INFO] Initiating port-kill routine...',
  optionsParsed: (payload: string) => `[port-kill] [DEBUG] Options parsed: ${payload}`,
  windowsLookup: '[port-kill] [DEBUG] Executing Windows system lookup: "netstat -ano"',
  windowsLookupResult:
    '[port-kill] [DEBUG] Netstat parser discovered matching ports with target sockets.',
  unixLookup: (port: string) =>
    `[port-kill] [DEBUG] Executing POSIX platform lookup: "lsof -t -n -i :${port}"`,
  discoveredPids: (pids: number[]) =>
    `[port-kill] [INFO] Discovered active process tree: PIDs [${pids.join(', ')}]`,
  dryRunChecked: (pids: number[]) =>
    `[port-kill] [INFO] [DRY_RUN] Checked active process tree [${pids.join(', ')}] without executing kill signals.`,
  dryRunComplete: (pids: number[]) =>
    `✓ [Port Audit Complete] Probed PIDs [${pids.join(', ')}] successfully (Dry mode).`,
  prepareWindows: (pid: number, force: boolean) =>
    `[port-kill] [INFO] Preparing to terminate Windows process ${pid}. Force: ${force}`,
  runWindowsKill: (pid: number, force: boolean) =>
    `[port-kill] [DEBUG] Executing command: "taskkill ${force ? '/F' : ''} /T /PID ${pid}"`,
  windowsTerminated: (pid: number) =>
    `[port-kill] [INFO] Windows process tree ${pid} terminated with success.`,
  prepareUnix: (signal: string, pids: number[]) =>
    `[port-kill] [INFO] Preparing to send signal ${signal} to PIDs: [${pids.join(', ')}]`,
  runUnixKill: (signal: string, pids: number[]) =>
    `[port-kill] [DEBUG] Executing command: "kill -${signal} ${pids.join(' ')}"`,
  unixTerminated: (pids: number[]) =>
    `[port-kill] [INFO] Processes [${pids.join(', ')}] terminated via native signal successfully.`,
  finalSuccess:
    '✓ [Port Clearance Success] All sockets on targeted port(s) have been successfully released.'
} as const;
