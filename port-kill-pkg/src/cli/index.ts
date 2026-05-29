#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { portKillSync } from '../index';
import { CLI_HELP, CLI_VERSION } from './messages';
import { parseCliArgs } from './parser';
import { printResults, printVerboseExecutionDetails } from './reporter';
import { CLI_EXIT_CODES, CLI_PARSE_TYPES } from './constants';

export function runCli(args: string[] = process.argv.slice(2)): void {
  const parsed = parseCliArgs(args);

  if (parsed.type === CLI_PARSE_TYPES.HELP) {
    console.log(CLI_HELP);
    process.exit(CLI_EXIT_CODES.SUCCESS);
  }

  if (parsed.type === CLI_PARSE_TYPES.VERSION) {
    console.log(CLI_VERSION);
    process.exit(CLI_EXIT_CODES.SUCCESS);
  }

  if (parsed.type === CLI_PARSE_TYPES.ERROR) {
    console.error(parsed.message);
    process.exit(CLI_EXIT_CODES.FAILURE);
  }

  printVerboseExecutionDetails(parsed.ports, parsed.options);

  const results = portKillSync(parsed.ports, parsed.options);
  process.exit(printResults(results));
}

// Start CLI run
if (require.main === module || !module.parent) {
  runCli();
}
