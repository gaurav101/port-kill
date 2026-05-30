/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMMAND_ARGUMENTS, COMMAND_BINARIES, COMMAND_FLAGS } from './constants';
import { PlatformCommand } from './runner';

const ALLOWED_POSIX_SIGNALS = new Set([
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
] as const);

export interface PlatformCommandFactory {
  createFindCommands(port: number): PlatformCommand[];
  createKillCommands(pids: number[], signalOrForce: string | boolean): PlatformCommand[];
}

export class UnixCommandFactory implements PlatformCommandFactory {
  createFindCommands(port: number): PlatformCommand[] {
    return [
      {
        binary: COMMAND_BINARIES.LSOF,
        args: [
          COMMAND_FLAGS.LSOF_TERSE,
          COMMAND_FLAGS.LSOF_NUMERIC,
          COMMAND_FLAGS.LSOF_INET,
          `:${port}`,
        ],
      },
      {
        binary: COMMAND_BINARIES.FUSER,
        args: [`${port}/${COMMAND_ARGUMENTS.TCP_PROTOCOL}`],
      },
    ];
  }

  createKillCommands(pids: number[], signalOrForce: string | boolean): PlatformCommand[] {
    const signal = normalizeUnixSignal(String(signalOrForce));
    return [
      {
        binary: COMMAND_BINARIES.KILL,
        args: [`-${signal}`, ...pids.map(String)],
      },
    ];
  }
}

function normalizeUnixSignal(signal: string): string {
  let normalizedSignal = signal.trim().toUpperCase();
  if (!normalizedSignal.startsWith(COMMAND_ARGUMENTS.POSIX_SIGNAL_PREFIX)) {
    normalizedSignal = `${COMMAND_ARGUMENTS.POSIX_SIGNAL_PREFIX}${normalizedSignal}`;
  }

  if (!ALLOWED_POSIX_SIGNALS.has(normalizedSignal as any)) {
    throw new Error(`Unsupported or invalid POSIX signal: "${signal}".`);
  }

  return normalizedSignal;
}

export class WindowsCommandFactory implements PlatformCommandFactory {
  createFindCommands(): PlatformCommand[] {
    return [
      {
        binary: COMMAND_BINARIES.NETSTAT,
        args: [COMMAND_FLAGS.NETSTAT_ALL_NUMERIC_OWNER],
      },
    ];
  }

  createKillCommands(pids: number[], signalOrForce: string | boolean): PlatformCommand[] {
    const forceFlag = signalOrForce ? COMMAND_FLAGS.TASKKILL_FORCE : COMMAND_ARGUMENTS.NO_FLAG;
    return pids.map((pid) => ({
      binary: COMMAND_BINARIES.TASKKILL,
      args: [
        ...(forceFlag ? [forceFlag] : []),
        COMMAND_FLAGS.TASKKILL_TREE,
        COMMAND_FLAGS.TASKKILL_PID,
        String(pid),
      ],
    }));
  }
}
