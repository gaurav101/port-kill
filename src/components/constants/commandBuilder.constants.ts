/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMAND_BUILDER_DEFAULTS = {
  portInput: '3000',
  fallbackPort: 3000,
  defaultSignal: 'SIGKILL',
  gracefulSignal: 'SIGTERM',
  copyTimeoutMs: 1800,
  portMin: 1,
  portMaxExclusive: 65536,
} as const;

export const COMMAND_BUILDER_FLAGS = {
  verbose: '--verbose',
  noForce: '--no-force',
  dryRun: '--dry-run',
  signal: '--signal',
} as const;

export const COMMAND_BUILDER_VALUES = {
  cliCommand: 'port-kill',
  packageName: '@gks101/port-kill',
  syncFn: 'portKillSync',
  asyncFn: 'portKill',
  optionForceFalse: '  force: false',
  optionVerboseTrue: '  verbose: true',
  optionDryRunTrue: '  dryRun: true',
  loggerPrefix: '[PORT_KILL]',
  sectionCli: 'cli',
  sectionCode: 'code',
  posixSignalPrefix: 'SIG',
  windowsPlatformName: 'windows',
  tcpProtocol: 'tcp',
} as const;

export const COMMAND_BUILDER_SIGNALS = [
  { value: 'SIGKILL', label: 'SIGKILL (Immediate Process Termination)' },
  { value: 'SIGTERM', label: 'SIGTERM (Graceful Handshake Request)' },
  { value: 'SIGINT', label: 'SIGINT (Keyboard/Manual Interrupt, Ctrl+C)' },
  { value: 'SIGHUP', label: 'SIGHUP (Hangup terminal control)' },
] as const;

export const COMMAND_BUILDER_CONTENT = {
  interactiveBuilder: 'Interactive Builder',
  targetPorts: 'Target Ports',
  separatorHint: 'Space/comma separated',
  portPlaceholder: 'e.g. 3000, 8080',
  invalidPorts: 'Please input one or more integer values (defaulting to 3000)',
  apiExecutionHook: 'API Execution Hook',
  asyncLabel: 'Asynchronous (Promise)',
  syncLabel: 'Synchronous (Blocking)',
  killStrategyOptions: 'Kill Strategy Options',
  aggressiveForceKill: 'Aggressive Force Kill',
  aggressiveForceDesc: 'Emits SIGKILL immediately',
  safeDryRun: 'Safe Dry-Run Mode',
  safeDryRunDesc: 'Audits and logs without killing',
  verboseLogs: 'Verbose Console Logs',
  verboseLogsDesc: 'Provides raw command execution details',
  customLogCallback: 'Custom Log Callback',
  customLogDesc: 'Intercept & pipe telemetry elsewhere',
  signalOverride: 'POSIX Signal Override (Mac/Linux Only)',
  signalIgnoredWindows: 'Ignored on Windows',
  testingTipTitle: 'Pro-Tip for testing',
  testingTipBody:
    'Running portKillSync in the testing helper hooks (like Jest\'s beforeAll) prevents frequent "EADDRINUSE" port acquisition failure locks during test watch-runs.',
  generatedCli: 'Generated CLI Command',
  copyShellTitle: 'Copy shell command',
  copied: 'Copied!',
  copy: 'Copy',
  integrationTitle: 'Programmatic Code Integration',
  copyCodeTitle: 'Copy programmatic code',
  underTheHoodTitle: 'Under-the-Hood: Native Shell Actions Mapping',
  underTheHoodBody:
    'Your Node process dynamically routes commands using process.platform checks. These native commands run on the host shell:',
  findLabel: 'FIND:',
  killLabel: 'KILL:',
  macosLabel: 'macOS (Darwin)',
  linuxLabel: 'Linux Kernel',
  windowsLabel: 'Windows (Win32)',
  posixBadge: 'POSIX',
  windowsBadge: 'Cmd/PS',
  copiedCode: 'Copied Code!',
} as const;

export const COMMAND_BUILDER_OS_SUMMARIES = {
  macos:
    'Queries listening sockets directly via kernel PID lists. High performance, bypasses active hostname reverse lookups.',
  linux:
    'Uses lsof lookup index. Carries a fuser socket parse fallback sequence to ensure failsafe execution across standard Alpine/Debian platforms.',
  windows:
    'Queries Windows netstat columns, parses exact bound ports numerically, and propagates a child process tree tear-down (/T /F).',
} as const;

export const COMMAND_BUILDER_SNIPPETS = {
  syncTemplate: (portsParam: string, optionsStr: string): string =>
    `import { portKillSync } from '@gks101/port-kill';\n\nfunction releasePorts() {\n  // Synchronous clearance (excellent for test run setups)\n  const results = portKillSync(${portsParam}${optionsStr});\n  \n  results.forEach(res => {\n    if (res.success) {\n      console.log(\`Port \${res.port} is clean. Discovered PIDs: \${res.pids.join(', ')}\`);\n    } else {\n      console.error(\`Failed to clean port \${res.port}: \${res.error}\`);\n    }\n  });\n}`,
  asyncTemplate: (portsParam: string, optionsStr: string): string =>
    `import { portKill } from '@gks101/port-kill';\n\nasync function initializeServer() {\n  try {\n    // Non-blocking asynchronous query & termination\n    const results = await portKill(${portsParam}${optionsStr});\n    console.log('Release details:', results);\n  } catch (err) {\n    console.error('Core port termination crashed', err);\n  }\n}`,
  customLoggerOption:
    '  logger: (msg, level) => {\n    myCustomMetrics.log(`[PORT_KILL] [${level}] ${msg}`);\n  }',
} as const;
