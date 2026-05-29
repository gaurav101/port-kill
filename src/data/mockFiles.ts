/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import typesSource from '../../port-kill-pkg/src/types.ts?raw';
import loggerSource from '../../port-kill-pkg/src/shared/logger.ts?raw';
import commandRunnerSource from '../../port-kill-pkg/src/commands/runner.ts?raw';
import commandDiagnosticsSource from '../../port-kill-pkg/src/commands/diagnostics.ts?raw';
import commandConstantsSource from '../../port-kill-pkg/src/commands/constants.ts?raw';
import commandFactoriesSource from '../../port-kill-pkg/src/commands/factories.ts?raw';
import strategiesSource from '../../port-kill-pkg/src/platform/strategies.ts?raw';
import platformFactorySource from '../../port-kill-pkg/src/platform/factory.ts?raw';
import platformResultsSource from '../../port-kill-pkg/src/platform/results.ts?raw';
import platformServiceSource from '../../port-kill-pkg/src/platform/service.ts?raw';
import indexSource from '../../port-kill-pkg/src/index.ts?raw';
import cliMessagesSource from '../../port-kill-pkg/src/cli/messages.ts?raw';
import cliParserSource from '../../port-kill-pkg/src/cli/parser.ts?raw';
import cliReporterSource from '../../port-kill-pkg/src/cli/reporter.ts?raw';
import cliSource from '../../port-kill-pkg/src/cli/index.ts?raw';
import packageJsonSource from '../../port-kill-pkg/package.json?raw';

export interface SourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const LIBRARY_FILES: SourceFile[] = [
  {
    name: 'types.ts',
    path: 'port-kill-pkg/src/types.ts',
    language: 'typescript',
    description: 'Public API contracts for options, results, and logger callbacks.',
    content: typesSource
  },
  {
    name: 'logger.ts',
    path: 'port-kill-pkg/src/shared/logger.ts',
    language: 'typescript',
    description: 'Internal logging adapter that preserves verbose and custom logger behavior.',
    content: loggerSource
  },
  {
    name: 'runner.ts',
    path: 'port-kill-pkg/src/commands/runner.ts',
    language: 'typescript',
    description: 'Small command execution boundary used by every platform strategy.',
    content: commandRunnerSource
  },
  {
    name: 'diagnostics.ts',
    path: 'port-kill-pkg/src/commands/diagnostics.ts',
    language: 'typescript',
    description: 'User-facing diagnostics for failed system commands and possible fixes.',
    content: commandDiagnosticsSource
  },
  {
    name: 'constants.ts',
    path: 'port-kill-pkg/src/commands/constants.ts',
    language: 'typescript',
    description: 'Central command binaries, flags, and reusable command arguments.',
    content: commandConstantsSource
  },
  {
    name: 'factories.ts',
    path: 'port-kill-pkg/src/commands/factories.ts',
    language: 'typescript',
    description: 'Factory Method implementations that create platform-specific shell commands.',
    content: commandFactoriesSource
  },
  {
    name: 'strategies.ts',
    path: 'port-kill-pkg/src/platform/strategies.ts',
    language: 'typescript',
    description: 'Strategy implementations for POSIX and Windows port discovery and termination.',
    content: strategiesSource
  },
  {
    name: 'factory.ts',
    path: 'port-kill-pkg/src/platform/factory.ts',
    language: 'typescript',
    description: 'Runtime factory that selects the platform strategy from process.platform.',
    content: platformFactorySource
  },
  {
    name: 'results.ts',
    path: 'port-kill-pkg/src/platform/results.ts',
    language: 'typescript',
    description: 'Result factory helpers for free, dry-run, and termination outcomes.',
    content: platformResultsSource
  },
  {
    name: 'service.ts',
    path: 'port-kill-pkg/src/platform/service.ts',
    language: 'typescript',
    description: 'Thin orchestration layer that applies the selected strategy and preserves result semantics.',
    content: platformServiceSource
  },
  {
    name: 'index.ts',
    path: 'port-kill-pkg/src/index.ts',
    language: 'typescript',
    description: 'Primary programmatic entrypoint exporting portKill and portKillSync.',
    content: indexSource
  },
  {
    name: 'messages.ts',
    path: 'port-kill-pkg/src/cli/messages.ts',
    language: 'typescript',
    description: 'CLI help, version, and error message constants.',
    content: cliMessagesSource
  },
  {
    name: 'parser.ts',
    path: 'port-kill-pkg/src/cli/parser.ts',
    language: 'typescript',
    description: 'CLI argument parser returning typed execution intents.',
    content: cliParserSource
  },
  {
    name: 'reporter.ts',
    path: 'port-kill-pkg/src/cli/reporter.ts',
    language: 'typescript',
    description: 'CLI output renderer for verbose details and command results.',
    content: cliReporterSource
  },
  {
    name: 'index.ts',
    path: 'port-kill-pkg/src/cli/index.ts',
    language: 'typescript',
    description: 'Thin CLI entrypoint coordinating parse, execute, report, and exit.',
    content: cliSource
  },
  {
    name: 'package.json',
    path: 'port-kill-pkg/package.json',
    language: 'json',
    description: 'NPM package manifest, binary binding, keywords, and distribution metadata.',
    content: packageJsonSource
  }
];
