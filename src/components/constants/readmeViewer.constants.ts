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
  installationTitle: 'Installation',
  directCliTitle: 'CLI Quick Start',
  testingTitle: 'Test Setup (Jest/Mocha)',
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
} as const;

export const README_VIEWER_BADGES = [
  { label: 'npm', value: 'v1.0.1', labelClass: 'bg-gray-800', valueClass: 'bg-blue-500' },
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
    id: 'global',
    hint: 'Install globally for direct CLI usage:',
    command: 'npm install -g @gks101/port-kill',
  },
  {
    id: 'local',
    hint: 'Install locally for project/test workflows:',
    command: 'npm install --save-dev @gks101/port-kill',
  },
] as const;

export const README_VIEWER_CLI_EXAMPLES = [
  {
    description: '# Terminate processes on port 3000',
    command: '$ port-kill 3000',
  },
  {
    description: '# Terminate multiple ports in one run',
    command: '$ port-kill 3000 8080 8081',
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
    command: '$ port-kill 5000 --signal SIGTERM --no-force',
  },
] as const;

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
