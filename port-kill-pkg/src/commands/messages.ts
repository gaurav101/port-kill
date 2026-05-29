/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMAND_DIAGNOSTIC_MESSAGES = {
  DEFAULT_REASON: 'The command exited unsuccessfully without stderr output.',
  ISSUE_PERMISSION: 'the current user does not have permission to terminate the target process.',
  FIX_PERMISSION:
    'run the command from the same user that owns the process, stop the owning application manually, or retry with elevated privileges such as sudo/Admin when appropriate.',
  ISSUE_NO_PROCESS: 'the process exited after discovery but before termination was attempted.',
  FIX_NO_PROCESS:
    'rerun port-kill, verify the port is still in use, or restart the owning service before retrying.',
  ISSUE_INVALID_SIGNAL: 'the selected signal is not supported by this shell or operating system.',
  FIX_INVALID_SIGNAL: 'use a standard POSIX signal such as SIGTERM, SIGINT, or SIGKILL.',
  ISSUE_MISSING_COMMAND: 'a required system command is unavailable in the current environment.',
  FIX_MISSING_COMMAND:
    'install the missing system utility or run from a shell where it is available on PATH.',
  ISSUE_FALLBACK: 'the operating system rejected the termination command.',
  FIX_FALLBACK:
    'rerun with --verbose, verify the process owner and PID, then try a graceful signal such as --signal SIGTERM or elevated privileges if the process is protected.',
} as const;

export const COMMAND_DIAGNOSTIC_KEYWORDS = {
  PERMISSION: ['operation not permitted', 'permission denied', 'not permitted', 'access is denied'],
  NO_PROCESS: ['no such process', 'not found', 'not running', 'no instance'],
  INVALID_SIGNAL: ['invalid signal', 'unknown signal'],
  MISSING_COMMAND: ['command not found', 'not recognized', 'not installed'],
} as const;
