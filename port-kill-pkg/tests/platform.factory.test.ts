import { PlatformStrategyFactory } from '../src/platform/factory';
import { UnixPortStrategy, WindowsPortStrategy } from '../src/platform/strategies';

describe('PlatformStrategyFactory', () => {
  it('returns windows strategy for win32', () => {
    const strategy = PlatformStrategyFactory.create('win32');
    expect(strategy).toBeInstanceOf(WindowsPortStrategy);
  });

  it('returns unix strategy for non-windows platforms', () => {
    const darwin = PlatformStrategyFactory.create('darwin');
    const linux = PlatformStrategyFactory.create('linux');

    expect(darwin).toBeInstanceOf(UnixPortStrategy);
    expect(linux).toBeInstanceOf(UnixPortStrategy);
  });

  it('uses default runtime platform when no argument is passed', () => {
    const strategy = PlatformStrategyFactory.create(undefined as any);
    expect(strategy.name === 'windows' || strategy.name === 'unix').toBe(true);
  });
});
