/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions, PortKillResult } from '../types';
import { createLogger } from '../shared/logger';
import { PlatformStrategyFactory } from './factory';
import { createDryRunResult, createFreePortResult, createTerminationResult } from './results';
import { PLATFORM_MESSAGES, PLATFORM_RUNTIME } from './constants';

const PORT_MIN = 1;
const PORT_MAX = 65535;

function getFallbackSignal(options: PortKillOptions): string {
  return options.force !== false ? PLATFORM_RUNTIME.FORCE_SIGNAL : PLATFORM_RUNTIME.GRACEFUL_SIGNAL;
}

/**
 * Core function to terminate processes running on a specific port.
 */
export function killSinglePort(port: number, options: PortKillOptions = {}): PortKillResult {
  const timestamp = new Date().toISOString();

  if (!Number.isInteger(port) || port < PORT_MIN || port > PORT_MAX) {
    throw new Error(
      `Invalid port number: ${String(port)}. Port must be an integer between ${PORT_MIN} and ${PORT_MAX}.`
    );
  }

  const log = createLogger(options);
  const strategy = PlatformStrategyFactory.create();

  log(PLATFORM_MESSAGES.INITIATING(port), 'info');

  const pids = strategy.findPids(port, log);

  if (pids.length === 0) {
    const result = createFreePortResult(port, timestamp);
    log(result.message, 'info');
    return result;
  }

  log(PLATFORM_MESSAGES.DISCOVERED_PIDS(port, pids), 'info');

  if (options.dryRun) {
    const result = createDryRunResult({ port, pids, timestamp });
    log(result.message, 'info');
    return result;
  }

  const result = strategy.terminatePids(pids, options, log);
  return createTerminationResult(
    { port, pids, timestamp },
    strategy,
    result,
    getFallbackSignal(options)
  );
}
