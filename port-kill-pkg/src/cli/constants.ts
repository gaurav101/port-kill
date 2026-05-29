/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CLI_FLAGS = {
  HELP: '--help',
  HELP_SHORT: '-h',
  VERSION: '--version',
  VERSION_SHORT: '-v',
  VERBOSE: '--verbose',
  VERBOSE_SHORT: '-d',
  DRY_RUN: '--dry-run',
  NO_FORCE: '--no-force',
  SIGNAL: '--signal',
  SIGNAL_SHORT: '-s'
} as const;

export const CLI_PARSE_TYPES = {
  HELP: 'help',
  VERSION: 'version',
  ERROR: 'error',
  RUN: 'run'
} as const;

export const CLI_RESULT_MESSAGES = {
  TARGETING_PORTS: (ports: number[]) => `[port-kill] Targeting ports: [${ports.join(', ')}]`,
  OPTIONS_CONFIGURED: '[port-kill] Options configured:',
  SUCCESS_KILLED: (port: number, pids: number[]) => `✓ [Port ${port}] Process tree killed: [${pids.join(', ')}].`,
  SUCCESS_ALREADY_FREE: (port: number) => `✓ [Port ${port}] Already free (no active processes found).`,
  FAILURE_GENERIC: (port: number) => `✗ [Port ${port}] Terminate action failed.`,
  FAILURE_DETAIL: (error: string) => `  ↳ Error detail: ${error}`
} as const;
