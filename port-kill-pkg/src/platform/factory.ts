/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnixCommandFactory, WindowsCommandFactory } from '../commands/factories';
import { PlatformStrategy, UnixPortStrategy, WindowsPortStrategy } from './strategies';
import { PLATFORM_RUNTIME } from './constants';

/**
 * Factory Method for selecting platform-specific behavior from the runtime environment.
 */
export class PlatformStrategyFactory {
  static create(platform: NodeJS.Platform = process.platform): PlatformStrategy {
    if (platform === PLATFORM_RUNTIME.WINDOWS_PLATFORM_KEY) {
      return new WindowsPortStrategy(new WindowsCommandFactory());
    }

    return new UnixPortStrategy(new UnixCommandFactory());
  }
}
