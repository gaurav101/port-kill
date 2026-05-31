/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UseCaseId =
  | 'local-dev'
  | 'test-automation'
  | 'ci-pipelines'
  | 'scripted-ops'
  | 'safe-audits';

export interface UseCaseItem {
  id: UseCaseId;
  tabLabel: string;
  title: string;
  problem: string;
  usefulWhen: string;
  explanation: string;
  cliExample: string;
  codeExample: string;
}

export const USE_CASES_CONTENT = {
  sectionTitle: 'Practical Use Cases',
  sectionSubtitle:
    'Choose a scenario to see where @gks101/port-kill helps, how to apply it, and a working command/code example.',
  cliBlockTitle: 'CLI Example',
  codeBlockTitle: 'Programmatic Example',
  copyCliTitle: 'Copy CLI example',
  copyCodeTitle: 'Copy code example',
  problemLabel: 'Problem',
  usefulWhenLabel: 'Useful when',
} as const;

export const USE_CASES: UseCaseItem[] = [
  {
    id: 'local-dev',
    tabLabel: 'Local Dev',
    title: 'Keep local startup loops fast',
    problem:
      'A previous dev server or watcher keeps holding a port, so next startup fails with EADDRINUSE because the port is already occupied.',
    usefulWhen:
      'You restart React/Vite/Next/Nest servers many times a day and need a quick CLI command to release occupied ports before booting the dev server.',
    explanation:
      'Run port-kill when a port is already occupied, then start your dev server. You can also chain it in scripts to enforce a clean startup path every run.',
    cliExample:
      '# If already installed globally\nport-kill 3000\n\n# Without global install\nnpx @gks101/port-kill 5173 --verbose\nnpm run dev\n\n# one-liner startup guard\nnpx @gks101/port-kill 5173 --verbose && npm run dev',
    codeExample:
      "import { portKill } from '@gks101/port-kill';\n\nasync function startDevServer() {\n  await portKill(5173, { verbose: true });\n  // then start your local server process\n}\n\nstartDevServer();",
  },
  {
    id: 'test-automation',
    tabLabel: 'Tests',
    title: 'Stabilize integration and e2e suites',
    problem:
      'Jest/Playwright/Cypress setup intermittently fails because leftover worker processes own required ports.',
    usefulWhen:
      'You run repeated test watch sessions or parallel test jobs that reuse fixed ports and need graceful cleanup after completion.',
    explanation:
      'Clear target ports in setup hooks to avoid flaky startup, and release ports gracefully again when the test run completes.',
    cliExample:
      '# If already installed globally\nport-kill 4173 9229 --no-force --signal SIGTERM\n\n# Without global install\nnpx @gks101/port-kill 4173 9229 --no-force --signal SIGTERM',
    codeExample:
      "import { portKillSync } from '@gks101/port-kill';\n\nbeforeAll(() => {\n  portKillSync([4173, 9229], { force: false, signal: 'SIGTERM' });\n});\n\nafterAll(() => {\n  // Gracefully release test server ports when suite is complete\n  portKillSync([4173, 9229], { force: false, signal: 'SIGTERM' });\n});",
  },
  {
    id: 'ci-pipelines',
    tabLabel: 'CI Pipelines',
    title: 'Prevent random CI port collisions',
    problem:
      'CI containers or self-hosted runners can leave background processes, causing nondeterministic failures.',
    usefulWhen:
      'You run preview servers, smoke tests, or service boot scripts in GitHub Actions or Jenkins.',
    explanation:
      'Add a deterministic cleanup step before booting services to remove noisy retries and flaky failures.',
    cliExample:
      '# If already installed globally\nport-kill 3000 8080 --dry-run --verbose\n\n# Without global install\nnpx @gks101/port-kill 3000 8080 --dry-run --verbose',
    codeExample:
      "import { portKill } from '@gks101/port-kill';\n\nawait portKill([3000, 8080], { dryRun: true, verbose: true });",
  },
  {
    id: 'scripted-ops',
    tabLabel: 'Scripts',
    title: 'Coordinate multiple services in one command',
    problem:
      'Monorepo or tooling scripts start several services and need clean handoff between runs.',
    usefulWhen:
      'You orchestrate API, web, and worker processes with npm scripts, turborepo, or custom node scripts.',
    explanation:
      'Use one cleanup pass at the script entrypoint to ensure predictable service boot order.',
    cliExample:
      '# If already installed globally\nport-kill 3000 4000 5432 --verbose\n\n# Without global install\nnpx @gks101/port-kill 3000 4000 5432 --verbose',
    codeExample:
      "import { portKill } from '@gks101/port-kill';\n\nawait portKill([3000, 4000, 5432], { verbose: true });",
  },
  {
    id: 'safe-audits',
    tabLabel: 'Safe Audit',
    title: 'Inspect impact before terminating anything',
    problem: 'Teams need visibility of what would be terminated before actually killing processes.',
    usefulWhen:
      'You are debugging shared environments and want process insight without immediate termination.',
    explanation:
      'Use dry-run mode to audit ports, process IDs, and command behavior before switching to real cleanup.',
    cliExample:
      '# If already installed globally\nport-kill 3000 --dry-run --verbose\n\n# Without global install\nnpx @gks101/port-kill 3000 --dry-run --verbose',
    codeExample:
      "import { portKill } from '@gks101/port-kill';\n\nconst report = await portKill(3000, { dryRun: true, verbose: true });\nconsole.log(report);",
  },
];
