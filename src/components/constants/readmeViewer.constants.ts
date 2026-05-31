/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const README_VIEWER_CONSTANTS = {
  copiedTimeoutMs: 1800,
  packageName: '@gks101/port-kill',
  description:
    'Lightweight cross-platform port termination for Node.js with programmatic APIs and a CLI, backed by zero runtime dependencies.',
  keyAdvantagesTitle: 'Key Highlights',
  compatibilityTitle: 'Compatibility & Requirements',
  intendedUsageTitle: 'Intended Usage',
  intendedUsageBody:
    'Built for Node.js and frontend development workflows such as local port cleanup, test setup/teardown, and CI port-reset steps. Not intended as production process orchestration.',
  installationTitle: 'Installation',
  directCliTitle: 'CLI Quick Start',
  cliFlagsTitle: 'CLI Flags Reference',
  apiSignatureTitle: 'API Function Signatures',
  errorBehaviorTitle: 'Error & Exit Behavior',
  testingTitle: 'Test Setup (Jest/Mocha)',
  securityNotesTitle: 'Security Notes',
  apiOptionsTitle: 'API Options',
  architectureTitle: 'Architecture',
  contributionTitle: 'Contribution Guide',
  copiedInstallIdGlobal: 'global',
  copiedInstallIdLocal: 'local',
  installGlobalHint: 'Install globally for direct CLI usage:',
  installLocalHint: 'Install locally for project/test workflows:',
  cliHint: 'Run directly or through npx:',
  testHint: 'Call port cleanup in setup hooks to avoid flaky EADDRINUSE failures in watch mode:',
  architectureHint:
    'Strategy implementations isolate platform behavior. Command factories build structured command objects, and runtime selection is based on process.platform.',
  contributionBody:
    'Fork the repository, keep changes scoped, validate build/type checks, and include clear PR notes.',
  featureCheck: '✓',
  tableHeaderOption: 'Option',
  tableHeaderType: 'Type',
  tableHeaderDefault: 'Default',
  tableHeaderDescription: 'Description',
  tableHeaderEnvironment: 'Environment',
  tableHeaderSupport: 'Support',
  tableHeaderNotes: 'Notes',
  tableHeaderFlag: 'Flag',
  tableHeaderAlias: 'Alias',
} as const;

export const README_VIEWER_BADGES = [
  { label: 'npm', value: 'v1.0.2', labelClass: 'bg-gray-800', valueClass: 'bg-blue-500' },
  { label: 'node', value: '>=16', labelClass: 'bg-gray-800', valueClass: 'bg-emerald-500' },
  { label: 'runtime deps', value: '0', labelClass: 'bg-gray-800', valueClass: 'bg-blue-600' },
  { label: 'license', value: 'Apache-2.0', labelClass: 'bg-gray-800', valueClass: 'bg-sky-500' },
] as const;

export const README_VIEWER_FEATURES = [
  {
    title: 'Zero Runtime Dependencies',
    description: 'Light install footprint for local scripts, CI jobs, and npx use.',
  },
  {
    title: 'Cross-Platform Behavior',
    description: 'Supports macOS/Linux and Windows with platform-specific command strategies.',
  },
  {
    title: 'PID Discovery Fallbacks',
    description: 'POSIX uses lsof with fuser fallback; Windows parses netstat output.',
  },
  {
    title: 'Operational Controls',
    description:
      'Supports dry-run, verbose logs, force/no-force behavior, and custom logger hooks.',
  },
  {
    title: 'Security Guardrails',
    description:
      'Validates integer ports (1..65535), restricts POSIX signals to a supported allowlist, and skips self/parent PIDs.',
  },
] as const;

export const README_VIEWER_INSTALL_SNIPPETS = [
  {
    id: 'local-npm',
    hint: 'Install locally with npm:',
    command: 'npm install --save-dev @gks101/port-kill',
  },
  {
    id: 'local-yarn',
    hint: 'Install locally with yarn:',
    command: 'yarn add -D @gks101/port-kill',
  },
  {
    id: 'local-pnpm',
    hint: 'Install locally with pnpm:',
    command: 'pnpm add -D @gks101/port-kill',
  },
  {
    id: 'global',
    hint: 'Install globally for direct CLI usage:',
    command: 'npm install -g @gks101/port-kill',
  },
] as const;

export const README_VIEWER_CLI_EXAMPLES = [
  {
    description: '# Terminate processes on port 3000',
    command: '$ port-kill 3000',
  },
  {
    description: '# Terminate multiple ports in one run',
    command: '$ port-kill 3000 8080',
  },
  {
    description: '# Enable verbose logs',
    command: '$ port-kill 3000 --verbose',
  },
  {
    description: '# Dry run mode (no termination)',
    command: '$ port-kill 5000 --dry-run',
  },
  {
    description: '# POSIX signal override (ignored on Windows)',
    command: '$ port-kill 3000 8080 --signal SIGTERM --no-force',
  },
  {
    description: '# Explicitly enable aggressive mode (default)',
    command: '$ port-kill 3000 8080 --force',
  },
] as const;

export const README_VIEWER_COMPATIBILITY_ROWS = [
  {
    environment: 'Node.js',
    support: '>=16.0.0',
    notes: 'Declared in package engines and required for supported runtime behavior.',
  },
  {
    environment: 'Windows',
    support: 'cmd.exe / PowerShell',
    notes: 'Uses netstat for PID discovery and taskkill for termination.',
  },
  {
    environment: 'macOS',
    support: 'zsh / bash',
    notes: 'Uses lsof with fuser fallback, then kill.',
  },
  {
    environment: 'Linux',
    support: 'bash / sh / zsh',
    notes: 'Uses lsof with fuser fallback, then kill.',
  },
] as const;

export const README_VIEWER_PERMISSION_NOTES = [
  'Low/protected ports (for example 80/443) may require elevated privileges.',
  'macOS/Linux may require sudo for lookup/termination on protected ports.',
  'Windows may require an Administrator shell for protected ports.',
] as const;

export const README_VIEWER_CLI_FLAG_ROWS = [
  {
    flag: '--help',
    alias: '-h',
    type: 'none',
    defaultValue: 'n/a',
    description: 'Show usage details and exit with code 0.',
  },
  {
    flag: '--version',
    alias: '-v',
    type: 'none',
    defaultValue: 'n/a',
    description: 'Show CLI version and exit with code 0.',
  },
  {
    flag: '--verbose',
    alias: '-d',
    type: 'none',
    defaultValue: 'false',
    description: 'Enable verbose command and execution logs.',
  },
  {
    flag: '--dry-run',
    alias: 'none',
    type: 'none',
    defaultValue: 'false',
    description: 'Find PIDs but do not terminate processes.',
  },
  {
    flag: '--force',
    alias: 'none',
    type: 'none',
    defaultValue: 'true',
    description: 'Explicitly apply aggressive termination mode.',
  },
  {
    flag: '--no-force',
    alias: 'none',
    type: 'none',
    defaultValue: 'false (toggle)',
    description: 'Disable force mode and favor graceful termination.',
  },
  {
    flag: '--signal <sig>',
    alias: '-s',
    type: 'string',
    defaultValue: 'OS-derived',
    description: 'POSIX signal override (ignored on Windows).',
  },
] as const;

export const README_VIEWER_API_SIGNATURE_SNIPPET = `type PortKillSignal = 'SIGKILL' | 'SIGTERM' | 'SIGINT' | string;

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
): PortKillResult[];`;

export const README_VIEWER_ERROR_BEHAVIOR_NOTES = [
  'Already-free ports are treated as success and do not fail the run.',
  'CLI exits with code 1 on invalid input, invalid signal, permission errors, or kill failures.',
  'When chaining with &&, subsequent commands run only if port-kill exits with code 0.',
] as const;

export const README_VIEWER_CHAINING_WARNING = 'port-kill 3000 8080 && npm run dev';

export const README_VIEWER_API_ROWS = [
  {
    option: 'force',
    type: 'boolean',
    defaultValue: 'true',
    description: 'POSIX uses SIGKILL. Windows adds /F to taskkill when force is true.',
  },
  {
    option: 'signal',
    type: 'string',
    defaultValue: "'SIGKILL' / 'SIGTERM'",
    description:
      'POSIX-only signal override restricted to supported SIG* values. If force is false, fallback signal is SIGTERM.',
  },
  {
    option: 'verbose',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Enables debug-level logs including command execution traces.',
  },
  {
    option: 'dryRun',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Discovers PIDs and returns success without sending kill commands.',
  },
  {
    option: 'logger',
    type: '(message, level) => void',
    defaultValue: 'undefined',
    description: 'Custom callback for log routing. Receives level as info/warn/error/debug.',
  },
] as const;

export const README_VIEWER_SECURITY_NOTES = [
  {
    title: 'TOCTOU / PID Recycling',
    description:
      'PID lookup and process termination happen in separate steps, so a small race window can exist on highly volatile systems.',
  },
  {
    title: 'PATH Trust Assumption',
    description:
      'System tools are resolved from PATH (`lsof`, `fuser`, `netstat`, `kill`, `taskkill`). Prefer trusted environments and avoid elevated execution unless required.',
  },
  {
    title: 'EDR / Enterprise Allowlists',
    description:
      'Frequent socket queries followed by process termination can be flagged by endpoint security tools; configure allowlists for trusted CI runners when needed.',
  },
  {
    title: 'Runtime Behavior Stability',
    description:
      'Runtime behavior remains intentionally unchanged to preserve DX and zero-runtime-dependency simplicity.',
  },
] as const;

export const README_VIEWER_TEST_SNIPPET = `import { portKillSync } from '@gks101/port-kill';
import express from 'express';

describe('API Route Assertion Suites', () => {
  const TEST_PORT = 4900;
  let activeServer: any;

  beforeAll(() => {
    // Force synchronize release before server mount
    portKillSync(TEST_PORT, { verbose: false, force: true });
    
    activeServer = express().listen(TEST_PORT);
  });

  afterAll((done) => {
    activeServer.close(() => {
      // Clear socket on exit
      portKillSync(TEST_PORT);
      done();
    });
  });
});`;

export const README_VIEWER_ARCHITECTURE_SNIPPET = `port-kill-pkg/
├── src/
│   ├── index.ts              # portKill / portKillSync
│   ├── types.ts              # Public TypeScript interfaces
│   ├── cli/                  # CLI entry, parser, messages, reporter
│   ├── commands/             # Command constants, diagnostics, factories, runner
│   ├── platform/             # Strategy implementations and result creators
│   └── shared/               # Shared logger adapter`;
