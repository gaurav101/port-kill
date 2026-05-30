/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TerminalLogType = 'info' | 'warn' | 'error' | 'debug' | 'success' | 'cmd';

export type TerminalPlatform = 'unix' | 'windows';

export interface TerminalPreset {
  name: string;
  cmd: string;
  ports: number[];
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
  finalSuccessDelayMs: 4100,
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
  SIG_PREFIX: 'SIG',
} as const;

export const TERMINAL_PRESETS: Record<string, TerminalPreset> = {
  standard: {
    name: 'Standard Single Target (Port 3000)',
    cmd: 'port-kill 3000',
    ports: [3000],
    pids: [18451],
    verbose: false,
    dryRun: false,
    force: true,
    signal: 'SIGKILL',
  },
  verboseMultiple: {
    name: 'Verbose Multi-Target (Ports 8080 or 8081)',
    cmd: 'port-kill 8080 8081 --verbose',
    ports: [8080, 8081],
    pids: [29541, 29542],
    verbose: true,
    dryRun: false,
    force: true,
    signal: 'SIGKILL',
  },
  dryAudit: {
    name: 'Safe Dry-Run Audit (Port 5000)',
    cmd: 'port-kill 5000 --dry-run',
    ports: [5000],
    pids: [91244],
    verbose: true,
    dryRun: true,
    force: true,
    signal: 'SIGKILL',
  },
  graceful: {
    name: 'Graceful Termination (Port 8000)',
    cmd: 'port-kill 8000 --no-force --signal SIGTERM',
    ports: [8000],
    pids: [412],
    verbose: false,
    dryRun: false,
    force: false,
    signal: 'SIGTERM',
  },
};

export const TERMINAL_CONTENT = {
  simulateExecution: 'Simulate Runtime Execution',
  simulateDescription:
    'Witness how the port-kill library queries, logs, and processes termination on the system.',
  targetPlatformLabel: 'Target Platform',
  unixLabel: 'macOS / Linux',
  windowsLabel: 'Windows (Win32)',
  selectPresetLabel: 'Select Preset Workflow',
  runningLabel: 'Executing Mock...',
  runLabel: 'Run Simulation',
  configSummaryTitle: 'Simulation Configuration',
  configSummaryCommand: 'Command',
  configSummaryPids: 'Mock PIDs',
  configSummaryMode: 'Mode',
  modeDryRun: 'Dry Run',
  modeTerminate: 'Terminate',
  terminalTitle: 'port-kill-sandbox-terminal',
  platformLabel: 'platform:',
  posixShell: 'posix-shell',
  powershell: 'powershell',
  emptyReadyTitle: 'Ready to roll command diagnostics',
  emptyReadyDescription: 'Select a preset above and click "Run Simulation" to trace PIDs',
  commandPrefix: '$ ',
  successPrefix: '✓',
} as const;

export const TERMINAL_LOG_MESSAGES = {
  targetingPorts: (ports: number[]) => `[port-kill] Targeting ports: [${ports.join(', ')}]`,
  optionsConfigured: (payload: string) => `[port-kill] Options configured: ${payload}`,
  initiating: (port: number) =>
    `[port-kill] [INFO] Initiating port-kill routine for port: ${port}...`,
  commandRun: (command: string) => `[port-kill] [DEBUG] Executing command: ${command}`,
  lsofFound: (port: number, pids: number[]) =>
    `[port-kill] [DEBUG] lsof found PIDs on port ${port}: [${pids.join(', ')}]`,
  netstatFound: (port: number, pids: number[]) =>
    `[port-kill] [DEBUG] netstat identified PIDs on Windows port ${port}: [${pids.join(', ')}]`,
  discoveredPids: (port: number, pids: number[]) =>
    `[port-kill] [INFO] Discovered active processes on port ${port}: PIDs [${pids.join(', ')}]`,
  dryRun: (port: number, pids: number[]) =>
    `[port-kill] [INFO] [DRY_RUN] Discovered active process tree [${pids.join(', ')}] on port ${port}. No kill signal sent.`,
  prepareWindows: (force: boolean, pids: number[]) =>
    `[port-kill] [INFO] Preparing to terminate Windows processes. Force: ${force}, PIDs: [${pids.join(', ')}]`,
  prepareUnix: (signal: string, pids: number[]) =>
    `[port-kill] [INFO] Preparing to send signal ${signal} to PIDs: [${pids.join(', ')}]`,
  windowsTerminated: (pid: number) =>
    `[port-kill] [INFO] Windows process ${pid} (and its child processes) terminated.`,
  unixTerminated: (pids: number[]) =>
    `[port-kill] [INFO] Processes [${pids.join(', ')}] terminated successfully.`,
  finalKilled: (port: number, pids: number[]) =>
    `✓ [Port ${port}] Process tree killed: [${pids.join(', ')}].`,
} as const;
