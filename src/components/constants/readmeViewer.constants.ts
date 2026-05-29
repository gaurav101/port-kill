/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const README_VIEWER_CONSTANTS = {
  copiedTimeoutMs: 1800,
  packageName: '@gks101/port-kill',
  description:
    'A highly maintainable, lightweight, cross-platform programmatic API and zero-dependency CLI tool to terminate processes running on specific ports. Designed specifically for Node.js developers seeking seamless integration into test suites (like Jest/Mocha), DevOps CI pipelines, and daily workflows.',
  keyAdvantagesTitle: '🚀 Key Advantages',
  installationTitle: '💻 Installation',
  directCliTitle: '🛠 Direct CLI Actions',
  testingTitle: '🎭 Automated Testharness Integrations (Mocha/Jest)',
  apiOptionsTitle: '⚙ API Options Reference',
  architectureTitle: '📂 Structure & Architecture',
  contributionTitle: '🤝 Peer Collaboration Guide',
  copiedInstallIdGlobal: 'global',
  copiedInstallIdLocal: 'local',
  installGlobalHint: 'To utilize globally on any system command shell:',
  installLocalHint: 'To save as development dependency inside codebases:',
  cliHint: 'Run via npx or directly as global script parameters:',
  testHint:
    'Clean sockets preceding network binds inside Jest environments prevent annoying EADDRINUSE failures during intense local file watchers:',
  architectureHint:
    'Platform behavior is isolated behind strategies. Command creation lives in command factories, and a runtime factory selects the correct strategy from process.platform.',
  contributionBody:
    'We values peer contributions! To join up: Fork the package codebase, write targeted modifications into /src, guarantee all linter tests compile perfectly, and submit clean PRs with high visibility summaries.',
  featureCheck: '✓',
  tableHeaderOption: 'Option',
  tableHeaderType: 'Type',
  tableHeaderDefault: 'Default',
  tableHeaderDescription: 'Description'
} as const;

export const README_VIEWER_BADGES = [
  { label: 'npm', value: 'v1.0.0', labelClass: 'bg-gray-800', valueClass: 'bg-blue-500' },
  { label: 'build', value: 'passing', labelClass: 'bg-gray-800', valueClass: 'bg-blue-500' },
  { label: 'coverage', value: '100%', labelClass: 'bg-gray-800', valueClass: 'bg-blue-600' },
  { label: 'license', value: 'Apache-2.0', labelClass: 'bg-gray-800', valueClass: 'bg-sky-500' },
  { label: 'PRs', value: 'welcome', labelClass: 'bg-gray-800', valueClass: 'bg-amber-500' }
] as const;

export const README_VIEWER_FEATURES = [
  {
    title: 'Zero Outside Dependencies',
    description: 'Instant downloads and lightweight execution inside continuous integration pipelines.'
  },
  {
    title: 'Deep Cross-Platform Support',
    description: 'Equalized operation commands for macOS/POSIX systems and Windows command runtimes.'
  },
  {
    title: 'Multi-Lookup Fallbacks',
    description: 'Queries active sockets via lsof, fuser (Debian fallbacks), and regex netstat matches.'
  },
  {
    title: 'Complete Process Trees',
    description:
      'Terminates target parent processes and associated children trees to avoid detached zombie sockets.'
  }
] as const;

export const README_VIEWER_INSTALL_SNIPPETS = [
  {
    id: 'global',
    hint: 'To utilize globally on any system command shell:',
    command: 'npm install -g @gks101/port-kill'
  },
  {
    id: 'local',
    hint: 'To save as development dependency inside codebases:',
    command: 'npm install --save-dev @gks101/port-kill'
  }
] as const;

export const README_VIEWER_CLI_EXAMPLES = [
  {
    description: '# Terminate processes on port 3000 mapping immediately',
    command: '$ port-kill 3000'
  },
  {
    description: '# Release multiple targets concurrently',
    command: '$ port-kill 3000 8080 8081'
  },
  {
    description: '# Access execution tracing and debug info',
    command: '$ port-kill 3000 --verbose'
  },
  {
    description: '# Probe and identify bounds safely without terminate events',
    command: '$ port-kill 5000 --dry-run'
  }
] as const;

export const README_VIEWER_API_ROWS = [
  {
    option: 'port',
    type: 'number | number[]',
    defaultValue: 'Required',
    description: 'The specific port (or array of ports) to run lookup filters and terminate.'
  },
  {
    option: 'force',
    type: 'boolean',
    defaultValue: 'true',
    description:
      'When true, utilizes SIGKILL on POSIX/Mac machines, and /F taskkills on Windows windows.'
  },
  {
    option: 'signal',
    type: 'string',
    defaultValue: "'SIGKILL'",
    description: 'Sends standard Unix signals. Override with SIGTERM or SIGINT if needed (ignored on Windows).'
  },
  {
    option: 'verbose',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Prints real-time system executions, socket maps, and shell outcome codes.'
  }
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
│   ├── platform/             # Strategy factory, strategies, result service
│   └── shared/               # Shared logger adapter`;
