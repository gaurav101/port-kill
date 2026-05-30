/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawnSync } from 'child_process';
import { PortKillLog } from '../shared/logger';
import { buildCommandFailureMessage } from './diagnostics';
import { COMMAND_RUNNER_CONSTANTS, COMMAND_RUNNER_MESSAGES } from './constants';

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
  log(COMMAND_RUNNER_MESSAGES.EXECUTING(command), COMMAND_RUNNER_CONSTANTS.DEBUG_LOG_LEVEL);

  const parsedCommand = parseCommand(command);
  if (!parsedCommand) {
    const error = buildCommandFailureMessage({
      command,
      error: 'Unsafe or invalid command format detected. Refusing to execute through shell parser.',
    });
    log(COMMAND_RUNNER_MESSAGES.COMMAND_FAILURE(error), COMMAND_RUNNER_CONSTANTS.DEBUG_LOG_LEVEL);
    return { stdout: '', success: false, error, stderr: '', status: null };
  }

  const result = spawnSync(parsedCommand.binary, parsedCommand.args, {
    shell: false,
    encoding: COMMAND_RUNNER_CONSTANTS.ENCODING,
    stdio: [
      COMMAND_RUNNER_CONSTANTS.STDIO_PIPE,
      COMMAND_RUNNER_CONSTANTS.STDIO_PIPE,
      COMMAND_RUNNER_CONSTANTS.STDIO_PIPE,
    ],
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
    error: result.error?.message,
  });

  log(COMMAND_RUNNER_MESSAGES.COMMAND_FAILURE(error), COMMAND_RUNNER_CONSTANTS.DEBUG_LOG_LEVEL);
  return { stdout, success: false, error, stderr, status: result.status };
}

interface ParsedCommand {
  binary: string;
  args: string[];
}

function parseCommand(command: string): ParsedCommand | null {
  const trimmed = command.trim();
  if (!trimmed) return null;
  if (/[;&|`$><]/.test(trimmed)) return null;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  return {
    binary: parts[0],
    args: parts.slice(1),
  };
}
