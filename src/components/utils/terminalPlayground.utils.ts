/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TERMINAL_KEYS, TerminalLogType } from '../constants/terminalPlayground.constants';

export const getTerminalLogColorClass = (logType: TerminalLogType): string => {
  if (logType === TERMINAL_KEYS.LOG_CMD) {
    return 'text-gray-300 font-bold border-b border-gray-900 pb-1 mb-2 block';
  }
  if (logType === TERMINAL_KEYS.LOG_DEBUG) {
    return 'text-gray-500';
  }
  if (logType === TERMINAL_KEYS.LOG_INFO) {
    return 'text-sky-400';
  }
  if (logType === TERMINAL_KEYS.LOG_WARN) {
    return 'text-amber-400';
  }
  if (logType === TERMINAL_KEYS.LOG_ERROR) {
    return 'text-rose-400';
  }
  if (logType === TERMINAL_KEYS.LOG_SUCCESS) {
    return 'text-blue-400 font-semibold';
  }
  return 'text-gray-200';
};
