/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnixCommandFactory, WindowsCommandFactory } from '../commands/factories';
import { PlatformStrategy, UnixPortStrategy, WindowsPortStrategy } from './strategies';

/**
 * Factory Method for selecting platform-specific behavior from the runtime environment.
 */
export class PlatformStrategyFactory {
  static create(platform: NodeJS.Platform = process.platform): PlatformStrategy {
    if (platform === 'win32') {
      return new WindowsPortStrategy(new WindowsCommandFactory());
    }

    return new UnixPortStrategy(new UnixCommandFactory());
  }
}
