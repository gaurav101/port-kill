/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMMAND_ARGUMENTS, COMMAND_BINARIES, COMMAND_FLAGS } from './constants';

export interface PlatformCommandFactory {
  createFindCommands(port: number): string[];
  createKillCommand(pids: number[], signalOrForce: string | boolean): string | string[];
}

export class UnixCommandFactory implements PlatformCommandFactory {
  createFindCommands(port: number): string[] {
    return [
      `${COMMAND_BINARIES.LSOF} ${COMMAND_FLAGS.LSOF_TERSE} ${COMMAND_FLAGS.LSOF_NUMERIC} ${COMMAND_FLAGS.LSOF_INET} :${port}`,
      `${COMMAND_BINARIES.FUSER} ${port}/${COMMAND_ARGUMENTS.TCP_PROTOCOL}`,
    ];
  }

  createKillCommand(pids: number[], signalOrForce: string | boolean): string {
    const signal = normalizeUnixSignal(String(signalOrForce));
    return `${COMMAND_BINARIES.KILL} -${signal} ${pids.join(' ')}`;
  }
}

function normalizeUnixSignal(signal: string): string {
  const normalizedSignal = signal.trim().toUpperCase();
  const sanitizedSignal = normalizedSignal.startsWith(COMMAND_ARGUMENTS.POSIX_SIGNAL_PREFIX)
    ? normalizedSignal.slice(COMMAND_ARGUMENTS.POSIX_SIGNAL_PREFIX.length)
    : normalizedSignal;

  if (!/^[A-Z]+$/.test(sanitizedSignal)) {
    throw new Error(`Invalid signal value "${signal}".`);
  }

  return sanitizedSignal;
}

export class WindowsCommandFactory implements PlatformCommandFactory {
  createFindCommands(): string[] {
    return [`${COMMAND_BINARIES.NETSTAT} ${COMMAND_FLAGS.NETSTAT_ALL_NUMERIC_OWNER}`];
  }

  createKillCommand(pids: number[], signalOrForce: string | boolean): string[] {
    const forceFlag = signalOrForce ? COMMAND_FLAGS.TASKKILL_FORCE : COMMAND_ARGUMENTS.NO_FLAG;
    return pids.map((pid) =>
      [
        COMMAND_BINARIES.TASKKILL,
        forceFlag,
        COMMAND_FLAGS.TASKKILL_TREE,
        COMMAND_FLAGS.TASKKILL_PID,
        String(pid),
      ]
        .filter(Boolean)
        .join(' ')
    );
  }
}
