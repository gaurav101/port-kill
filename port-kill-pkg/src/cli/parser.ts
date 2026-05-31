/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions } from '../types';
import { CLI_ERRORS } from './messages';
import { CLI_DEFAULT_OPTIONS, CLI_FLAGS, CLI_PARSE_TYPES } from './constants';

const PORT_MIN = 1;
const PORT_MAX = 65535;
const ALLOWED_SIGNALS = new Set([
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
]);

export type CliParseResult =
  | { type: typeof CLI_PARSE_TYPES.HELP }
  | { type: typeof CLI_PARSE_TYPES.VERSION }
  | { type: typeof CLI_PARSE_TYPES.ERROR; message: string }
  | { type: typeof CLI_PARSE_TYPES.RUN; ports: number[]; options: PortKillOptions };

export function parseCliArgs(args: string[]): CliParseResult {
  if (args.includes(CLI_FLAGS.HELP) || args.includes(CLI_FLAGS.HELP_SHORT) || args.length === 0) {
    return { type: CLI_PARSE_TYPES.HELP };
  }

  if (args.includes(CLI_FLAGS.VERSION) || args.includes(CLI_FLAGS.VERSION_SHORT)) {
    return { type: CLI_PARSE_TYPES.VERSION };
  }

  const ports: number[] = [];
  const options: PortKillOptions = {
    port: [],
    force: CLI_DEFAULT_OPTIONS.force,
    verbose: CLI_DEFAULT_OPTIONS.verbose,
    dryRun: CLI_DEFAULT_OPTIONS.dryRun,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === CLI_FLAGS.VERBOSE || arg === CLI_FLAGS.VERBOSE_SHORT) {
      options.verbose = true;
    } else if (arg === CLI_FLAGS.FORCE) {
      options.force = true;
    } else if (arg === CLI_FLAGS.DRY_RUN) {
      options.dryRun = true;
    } else if (arg === CLI_FLAGS.NO_FORCE) {
      options.force = false;
    } else if (arg === CLI_FLAGS.SIGNAL || arg === CLI_FLAGS.SIGNAL_SHORT) {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        const normalizedSignal = nextArg.toUpperCase().startsWith('SIG')
          ? nextArg.toUpperCase()
          : `SIG${nextArg.toUpperCase()}`;
        if (!ALLOWED_SIGNALS.has(normalizedSignal)) {
          return { type: CLI_PARSE_TYPES.ERROR, message: CLI_ERRORS.INVALID_SIGNAL };
        }
        options.signal = normalizedSignal;
        i++;
      } else {
        return { type: CLI_PARSE_TYPES.ERROR, message: CLI_ERRORS.MISSING_SIGNAL };
      }
    } else {
      if (!/^\d+$/.test(arg)) {
        return { type: CLI_PARSE_TYPES.ERROR, message: CLI_ERRORS.invalidPortOrOption(arg) };
      }
      const port = Number(arg);
      if (port < PORT_MIN || port > PORT_MAX) {
        return { type: CLI_PARSE_TYPES.ERROR, message: CLI_ERRORS.invalidPortOrOption(arg) };
      }
      ports.push(port);
    }
  }

  if (ports.length === 0) {
    return { type: CLI_PARSE_TYPES.ERROR, message: CLI_ERRORS.NO_PORTS };
  }

  options.port = ports;
  return { type: CLI_PARSE_TYPES.RUN, ports, options };
}
