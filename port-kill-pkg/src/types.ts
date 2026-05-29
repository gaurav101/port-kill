/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortKillOptions {
  /**
   * The port (or array of ports) to terminate processes on.
   */
  port?: number | number[];

  /**
   * Force termination. Maps to SIGKILL on Unix systems, and `/F` on Windows.
   * @default true
   */
  force?: boolean;

  /**
   * The termination signal to send (Unix systems only).
   * @default 'SIGKILL' (or 'SIGTERM' depending on `force` flag)
   */
  signal?: 'SIGKILL' | 'SIGTERM' | 'SIGINT' | string;

  /**
   * Enable verbose console logging.
   * @default false
   */
  verbose?: boolean;

  /**
   * Custom logging function to intercept logs instead of standard console output.
   */
  logger?: (message: string, level?: 'info' | 'warn' | 'error' | 'debug') => void;

  /**
   * If true, will find the processes and logs them without actually killing them.
   * Great for workflows needing audit or confirmation before termination.
   * @default false
   */
  dryRun?: boolean;
}

export interface PortKillResult {
  /**
   * The port targeted for termination.
   */
  port: number;

  /**
   * Whether the operation was completed successfully (or no processes were listening).
   */
  success: boolean;

  /**
   * List of process IDs (PIDs) identified on this port.
   */
  pids: number[];

  /**
   * Descriptive text outcome of the operation.
   */
  message: string;

  /**
   * Error message if the operation failed.
   */
  error?: string;

  /**
   * Timestamp when the port kill was executed.
   */
  timestamp: string;
}
