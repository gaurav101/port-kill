/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const LOGGER_CONSTANTS = {
  PREFIX: 'port-kill',
  DEBUG_LEVEL: 'debug',
  INFO_LEVEL: 'info',
  WARN_LEVEL: 'warn',
  ERROR_LEVEL: 'error',
} as const;

export const PORT_RANGE = {
  MIN: 1,
  MAX: 65535,
} as const;

export const POSIX_SIGNALS = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGKILL',
  'SIGUSR1',
  'SIGSEGV',
  'SIGUSR2',
  'SIGPIPE',
  'SIGALRM',
  'SIGTERM',
  'SIGCHLD',
  'SIGCONT',
  'SIGSTOP',
  'SIGTSTP',
  'SIGTTIN',
  'SIGTTOU',
] as const;

export const POSIX_SIGNAL_SET = new Set<string>(POSIX_SIGNALS);
