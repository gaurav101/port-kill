/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortKillOptions } from '../types';
import { LOGGER_CONSTANTS } from './constants';

export type PortKillLogLevel = 'info' | 'warn' | 'error' | 'debug';
export type PortKillLog = (message: string, level?: PortKillLogLevel) => void;

/**
 * Creates a standard logger formatting helper.
 */
export function createLogger(options: PortKillOptions): PortKillLog {
  const isVerbose = !!options.verbose;
  const customLogger = options.logger;

  return (message: string, level: PortKillLogLevel = 'info') => {
    if (!isVerbose && level === LOGGER_CONSTANTS.DEBUG_LEVEL) return;

    const formatted = `[${LOGGER_CONSTANTS.PREFIX}] [${level.toUpperCase()}] ${message}`;
    if (customLogger) {
      customLogger(message, level);
      return;
    }

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'info':
      case 'debug':
      default:
        console.log(formatted);
        break;
    }
  };
}
