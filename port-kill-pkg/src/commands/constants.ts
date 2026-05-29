/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMAND_BINARIES = {
  LSOF: 'lsof',
  FUSER: 'fuser',
  NETSTAT: 'netstat',
  KILL: 'kill',
  TASKKILL: 'taskkill'
} as const;

export const COMMAND_FLAGS = {
  LSOF_TERSE: '-t',
  LSOF_NUMERIC: '-n',
  LSOF_INET: '-i',
  NETSTAT_ALL_NUMERIC_OWNER: '-ano',
  TASKKILL_FORCE: '/F',
  TASKKILL_TREE: '/T',
  TASKKILL_PID: '/PID'
} as const;

export const COMMAND_ARGUMENTS = {
  TCP_PROTOCOL: 'tcp',
  NO_FLAG: '',
  POSIX_SIGNAL_PREFIX: 'SIG'
} as const;
