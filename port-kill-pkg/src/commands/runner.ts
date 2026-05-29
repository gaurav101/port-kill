/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawnSync } from 'child_process';
import { PortKillLog } from '../shared/logger';
import { buildCommandFailureMessage } from './diagnostics';

export interface CommandRunResult {
  stdout: string;
  success: boolean;
  error?: string;
  stderr?: string;
  status?: number | null;
}

/**
 * Executes a shell command synchronously and returns the output as a clean string.
 * Suppresses standard stderr noise unless verbose is enabled.
 */
export function runCommand(command: string, log: PortKillLog): CommandRunResult {
  log(`Executing system command: "${command}"`, 'debug');

  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';

  if (!result.error && result.status === 0) {
    return { stdout, success: true, stderr, status: result.status };
  }

  const error = buildCommandFailureMessage({
    command,
    status: result.status,
    stderr,
    error: result.error?.message
  });

  log(`Command failed or returned non-zero code. ${error}`, 'debug');
  return { stdout, success: false, error, stderr, status: result.status };
}
