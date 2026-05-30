/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions } from '../types';
import { PortKillLog } from '../shared/logger';
import { runCommand } from '../commands/runner';
import { PlatformCommandFactory } from '../commands/factories';
import { PLATFORM_MESSAGES, PLATFORM_RUNTIME } from './constants';

export interface TerminationResult {
  success: boolean;
  error?: string;
  signal?: string;
}

export interface PlatformStrategy {
  readonly name: 'unix' | 'windows';
  findPids(port: number, log: PortKillLog): number[];
  terminatePids(pids: number[], options: PortKillOptions, log: PortKillLog): TerminationResult;
}

export class UnixPortStrategy implements PlatformStrategy {
  readonly name = 'unix' as const;

  constructor(private readonly commandFactory: PlatformCommandFactory) {}

  findPids(port: number, log: PortKillLog): number[] {
    const [lsofCmd, fuserCmd] = this.commandFactory.createFindCommands(port);
    const { stdout, success } = runCommand(lsofCmd, log);

    if (success && stdout.trim()) {
      const pids = stdout
        .split('\n')
        .map((line) => parseInt(line.trim(), 10))
        .filter((pid) => !isNaN(pid));

      log(PLATFORM_MESSAGES.LSOF_PIDS(port, pids), 'debug');
      return pids;
    }

    log(PLATFORM_MESSAGES.LSOF_FALLBACK(port), 'debug');
    const fuserResult = runCommand(fuserCmd, log);

    if (fuserResult.stdout.trim()) {
      const pids = fuserResult.stdout
        .split(/\s+/)
        .map((part) => parseInt(part.trim(), 10))
        .filter((pid) => !isNaN(pid));

      if (pids.length > 0) {
        log(PLATFORM_MESSAGES.FUSER_PIDS(port, pids), 'debug');
        return pids;
      }
    }

    log(PLATFORM_MESSAGES.NO_PIDS_UNIX(port), 'debug');
    return [];
  }

  terminatePids(pids: number[], options: PortKillOptions, log: PortKillLog): TerminationResult {
    const force = options.force !== false;
    const signal =
      options.signal || (force ? PLATFORM_RUNTIME.FORCE_SIGNAL : PLATFORM_RUNTIME.GRACEFUL_SIGNAL);
    const safePids = filterProtectedPids(pids, log);

    if (safePids.length === 0) {
      return { success: true, signal };
    }

    log(PLATFORM_MESSAGES.PREPARE_UNIX_SIGNAL(signal, safePids), 'info');

    const [killCmd] = this.commandFactory.createKillCommands(safePids, signal);
    const { success, error } = runCommand(killCmd, log);

    if (success) {
      log(PLATFORM_MESSAGES.TERMINATED_UNIX(safePids), 'info');
      return { success: true, signal };
    }

    log(PLATFORM_MESSAGES.FAILED_UNIX, 'error');
    return { success: false, error, signal };
  }
}

export class WindowsPortStrategy implements PlatformStrategy {
  readonly name = 'windows' as const;

  constructor(private readonly commandFactory: PlatformCommandFactory) {}

  findPids(port: number, log: PortKillLog): number[] {
    const [netstatCmd] = this.commandFactory.createFindCommands(port);
    const { stdout, success } = runCommand(netstatCmd, log);

    if (!success || !stdout) {
      log(PLATFORM_MESSAGES.FAILED_WINDOWS_NETSTAT, 'warn');
      return [];
    }

    const pids: number[] = [];
    const lines = stdout.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(/\s+/);
      if (parts.length < 5) continue;

      const localAddress = parts[1];
      const pidStr = parts[parts.length - 1];
      const pid = parseInt(pidStr, 10);

      if (isNaN(pid)) continue;

      const localPort = extractPortFromAddress(localAddress);
      if (localPort === port && !pids.includes(pid)) {
        pids.push(pid);
      }
    }

    log(PLATFORM_MESSAGES.NETSTAT_PIDS(port, pids), 'debug');
    return pids;
  }

  terminatePids(pids: number[], options: PortKillOptions, log: PortKillLog): TerminationResult {
    const force = options.force !== false;
    const safePids = filterProtectedPids(pids, log);

    if (safePids.length === 0) {
      return { success: true, error: undefined };
    }

    log(PLATFORM_MESSAGES.PREPARE_WINDOWS(force, safePids), 'info');

    let successCount = 0;
    const errors: string[] = [];
    const killCommands = this.commandFactory.createKillCommands(safePids, force);

    safePids.forEach((pid, index) => {
      const result = runCommand(killCommands[index], log);

      if (result.success) {
        log(PLATFORM_MESSAGES.TERMINATED_WINDOWS_PID(pid), 'info');
        successCount++;
      } else {
        log(PLATFORM_MESSAGES.FAILED_WINDOWS_PID(pid, String(result.error)), 'error');
        if (result.error) errors.push(result.error);
      }
    });

    const allSucceeded = successCount === safePids.length;
    return {
      success: allSucceeded,
      error: allSucceeded ? undefined : errors.join('; '),
    };
  }
}

function extractPortFromAddress(localAddress: string): number | null {
  const separatorIndex = localAddress.lastIndexOf(':');
  if (separatorIndex === -1) return null;

  const portPart = localAddress.slice(separatorIndex + 1).trim();
  if (!/^\d+$/.test(portPart)) return null;

  const port = Number(portPart);
  return Number.isInteger(port) ? port : null;
}

function filterProtectedPids(pids: number[], log: PortKillLog): number[] {
  const protectedPids = new Set([process.pid, process.ppid].filter((pid) => pid > 0));
  return pids.filter((pid) => {
    if (!protectedPids.has(pid)) return true;
    log(`[port-kill] Skipping protected PID ${pid} to prevent self/parent termination.`, 'warn');
    return false;
  });
}
