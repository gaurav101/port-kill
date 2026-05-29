/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions, PortKillResult } from '../types';
import { CLI_RESULT_MESSAGES } from './constants';

export function printVerboseExecutionDetails(ports: number[], options: PortKillOptions): void {
  if (!options.verbose) return;

  console.log(CLI_RESULT_MESSAGES.TARGETING_PORTS(ports));
  console.log(
    CLI_RESULT_MESSAGES.OPTIONS_CONFIGURED,
    JSON.stringify({ ...options, port: undefined }, null, 2)
  );
}

export function printResults(results: PortKillResult[]): number {
  let exitCode = 0;

  for (const res of results) {
    if (res.success) {
      if (res.pids.length > 0) {
        console.log(CLI_RESULT_MESSAGES.SUCCESS_KILLED(res.port, res.pids));
      } else {
        console.log(CLI_RESULT_MESSAGES.SUCCESS_ALREADY_FREE(res.port));
      }
    } else {
      console.error(CLI_RESULT_MESSAGES.FAILURE_GENERIC(res.port));
      if (res.error) {
        console.error(CLI_RESULT_MESSAGES.FAILURE_DETAIL(res.error));
      }
      exitCode = 1;
    }
  }

  return exitCode;
}
