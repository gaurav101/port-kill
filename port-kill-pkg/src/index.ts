/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions, PortKillResult } from './types';
import { killSinglePort } from './platform/service';

export * from './types';

/**
 * Programmatic interface to terminate processes listening on a list of ports (Synchronous).
 * Ideal for CLI wrappers or quick scripts where asynchronous flow increases complexity.
 * 
 * @param ports List of ports (one or more) to release
 * @param options Configurations for termination signal, verbosity, or dry-run checks
 */
export function portKillSync(
  ports: number | number[],
  options: PortKillOptions = {}
): PortKillResult[] {
  const portList = Array.isArray(ports) ? ports : [ports];
  const results: PortKillResult[] = [];

  for (const port of portList) {
    try {
      const result = killSinglePort(port, options);
      results.push(result);
    } catch (err: any) {
      results.push({
        port,
        success: false,
        pids: [],
        message: `An unexpected application error occurred while targeting port ${port}: ${err?.message || String(err)}`,
        error: err?.message || String(err),
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

/**
 * Programmatic interface to terminate processes listening on a list of ports (Asynchronous).
 * Fully non-blocking, returns a Promise with lists of outcomes. Perfect for server lifecycles,
 * DevTools integration, or testing orchestrators.
 * 
 * @param ports List of ports (one or more) to release
 * @param options Configurations for termination signal, verbosity, or dry-run checks
 */
export async function portKill(
  ports: number | number[],
  options: PortKillOptions = {}
): Promise<PortKillResult[]> {
  // Wrap in async function. Behind the scenes, subprocess operations in platform.ts are executed
  // synchronously to match kernel speed, but this allows non-blocking Node event loop execution.
  return new Promise((resolve) => {
    process.nextTick(() => {
      resolve(portKillSync(ports, options));
    });
  });
}

// Default export representing standard usage
export default portKill;
