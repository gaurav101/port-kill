/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillResult } from '../types';
import { PlatformStrategy, TerminationResult } from './strategies';
import { PLATFORM_RESULT_MESSAGES } from './constants';

export interface PortResultContext {
  port: number;
  pids: number[];
  timestamp: string;
}

export function createFreePortResult(port: number, timestamp: string): PortKillResult {
  return {
    port,
    success: true,
    pids: [],
    message: PLATFORM_RESULT_MESSAGES.FREE_PORT(port),
    timestamp,
  };
}

export function createDryRunResult(context: PortResultContext): PortKillResult {
  const { port, pids, timestamp } = context;

  return {
    port,
    success: true,
    pids,
    message: PLATFORM_RESULT_MESSAGES.DRY_RUN(port, pids),
    timestamp,
  };
}

export function createTerminationResult(
  context: PortResultContext,
  strategy: PlatformStrategy,
  result: TerminationResult,
  fallbackSignal: string
): PortKillResult {
  if (strategy.name === 'windows') {
    return createWindowsTerminationResult(context, result);
  }

  return createUnixTerminationResult(context, result, result.signal || fallbackSignal);
}

function createWindowsTerminationResult(
  context: PortResultContext,
  result: TerminationResult
): PortKillResult {
  const { port, pids, timestamp } = context;

  return {
    port,
    success: result.success,
    pids,
    message: result.success
      ? PLATFORM_RESULT_MESSAGES.WINDOWS_SUCCESS(port)
      : PLATFORM_RESULT_MESSAGES.WINDOWS_FAILURE,
    error: result.error,
    timestamp,
  };
}

function createUnixTerminationResult(
  context: PortResultContext,
  result: TerminationResult,
  signal: string
): PortKillResult {
  const { port, pids, timestamp } = context;

  return {
    port,
    success: result.success,
    pids,
    message: result.success
      ? PLATFORM_RESULT_MESSAGES.UNIX_SUCCESS(port, signal)
      : PLATFORM_RESULT_MESSAGES.UNIX_FAILURE(port, signal),
    error: result.error,
    timestamp,
  };
}
