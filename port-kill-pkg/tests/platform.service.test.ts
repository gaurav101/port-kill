import { PlatformStrategyFactory } from '../src/platform/factory';
import { killSinglePort } from '../src/platform/service';

describe('killSinglePort', () => {
  const createSpy = jest.spyOn(PlatformStrategyFactory, 'create');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns free-port result when no pid is found', () => {
    createSpy.mockReturnValue({
      name: 'unix',
      findPids: jest.fn(() => []),
      terminatePids: jest.fn(),
    } as any);

    const result = killSinglePort(3000);

    expect(result).toEqual({
      port: 3000,
      success: true,
      pids: [],
      message: 'Port 3000 is free. No active processes found.',
      timestamp: '2026-01-01T00:00:00.000Z',
    });
  });

  it('returns dry-run result without terminating', () => {
    const terminatePids = jest.fn();
    createSpy.mockReturnValue({
      name: 'unix',
      findPids: jest.fn(() => [111]),
      terminatePids,
    } as any);

    const result = killSinglePort(3000, { dryRun: true });

    expect(terminatePids).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toContain('[DRY_RUN]');
  });

  it('returns termination result for unix strategy', () => {
    createSpy.mockReturnValue({
      name: 'unix',
      findPids: jest.fn(() => [111]),
      terminatePids: jest.fn(() => ({ success: true, signal: 'SIGKILL' })),
    } as any);

    const result = killSinglePort(3000, { force: true });

    expect(result.success).toBe(true);
    expect(result.message).toContain('using SIGKILL');
  });

  it('uses graceful fallback signal when force=false and strategy omits signal', () => {
    createSpy.mockReturnValue({
      name: 'unix',
      findPids: jest.fn(() => [111]),
      terminatePids: jest.fn(() => ({ success: true })),
    } as any);

    const result = killSinglePort(3000, { force: false });

    expect(result.success).toBe(true);
    expect(result.message).toContain('using SIGTERM');
  });

  it('returns termination result for windows strategy', () => {
    createSpy.mockReturnValue({
      name: 'windows',
      findPids: jest.fn(() => [111]),
      terminatePids: jest.fn(() => ({ success: false, error: 'partial' })),
    } as any);

    const result = killSinglePort(3000, { force: true });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Partial failure');
    expect(result.error).toBe('partial');
  });
});
