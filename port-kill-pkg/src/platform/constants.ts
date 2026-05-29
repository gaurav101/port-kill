/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLATFORM_RUNTIME = {
  WINDOWS_PLATFORM_KEY: 'win32',
  WINDOWS_NAME: 'windows',
  UNIX_NAME: 'unix',
  FORCE_SIGNAL: 'SIGKILL',
  GRACEFUL_SIGNAL: 'SIGTERM'
} as const;

export const PLATFORM_MESSAGES = {
  INITIATING: (port: number) => `Initiating port-kill routine for port: ${port}...`,
  DISCOVERED_PIDS: (port: number, pids: number[]) => `Discovered active processes on port ${port}: PIDs [${pids.join(', ')}]`,
  LSOF_PIDS: (port: number, pids: number[]) => `lsof found PIDs on port ${port}: [${pids.join(', ')}]`,
  LSOF_FALLBACK: (port: number) => `lsof yielded no active PIDs for port ${port}. Trying alternative "fuser" fallback...`,
  FUSER_PIDS: (port: number, pids: number[]) => `fuser fallback successfully identified PIDs on port ${port}: [${pids.join(', ')}]`,
  NO_PIDS_UNIX: (port: number) => `No processes identified on port ${port} via lsof or fuser.`,
  PREPARE_UNIX_SIGNAL: (signal: string, pids: number[]) => `Preparing to send signal ${signal} to PIDs: [${pids.join(', ')}]`,
  TERMINATED_UNIX: (pids: number[]) => `Processes [${pids.join(', ')}] terminated successfully.`,
  FAILED_UNIX: 'Failed to terminate processes via Unix kill command.',
  FAILED_WINDOWS_NETSTAT: 'Failed to query active TCP sockets using netstat on Windows.',
  NETSTAT_PIDS: (port: number, pids: number[]) => `netstat identified PIDs on Windows port ${port}: [${pids.join(', ')}]`,
  PREPARE_WINDOWS: (force: boolean, pids: number[]) => `Preparing to terminate Windows processes. Force: ${force}, PIDs: [${pids.join(', ')}]`,
  TERMINATED_WINDOWS_PID: (pid: number) => `Windows process ${pid} (and its child processes) terminated.`,
  FAILED_WINDOWS_PID: (pid: number, error: string) => `Failed to terminate Windows process ${pid}: ${error}`
} as const;

export const PLATFORM_RESULT_MESSAGES = {
  FREE_PORT: (port: number) => `Port ${port} is free. No active processes found.`,
  DRY_RUN: (port: number, pids: number[]) => `[DRY_RUN] Discovered active process tree [${pids.join(', ')}] on port ${port}. No kill signal sent.`,
  WINDOWS_SUCCESS: (port: number) => `Successfully terminated all processes on port ${port}.`,
  WINDOWS_FAILURE: 'Partial failure or error encountered during process termination on Windows.',
  UNIX_SUCCESS: (port: number, signal: string) => `Successfully terminated all processes on port ${port} using ${signal}.`,
  UNIX_FAILURE: (port: number, signal: string) => `Failed to terminate processes on port ${port} using ${signal}.`
} as const;
