import portKill, { portKillSync } from '../src/index';
import { killSinglePort } from '../src/platform/service';

jest.mock('../src/platform/service', () => ({
  killSinglePort: jest.fn(),
}));

describe('public API', () => {
  const mockedKillSinglePort = killSinglePort as jest.MockedFunction<typeof killSinglePort>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('portKillSync handles single and multiple ports', () => {
    mockedKillSinglePort
      .mockReturnValueOnce({
        port: 3000,
        success: true,
        pids: [],
        message: 'ok',
        timestamp: 'x',
      } as any)
      .mockReturnValueOnce({
        port: 3001,
        success: true,
        pids: [1],
        message: 'ok',
        timestamp: 'x',
      } as any);

    expect(portKillSync(3000)).toHaveLength(1);
    expect(portKillSync([3000, 3001])).toHaveLength(2);
    expect(mockedKillSinglePort).toHaveBeenCalled();
  });

  it('portKillSync captures unexpected runtime errors', () => {
    mockedKillSinglePort.mockImplementation(() => {
      throw new Error('boom');
    });

    const result = portKillSync(3000);

    expect(result[0].success).toBe(false);
    expect(result[0].error).toBe('boom');
    expect(result[0].message).toContain('unexpected application error');
  });

  it('portKillSync handles thrown non-Error values', () => {
    mockedKillSinglePort.mockImplementation(() => {
      throw 'raw failure';
    });

    const result = portKillSync(3000);
    expect(result[0].error).toBe('raw failure');
  });

  it('portKill resolves asynchronously with sync results', async () => {
    mockedKillSinglePort.mockReturnValue({
      port: 5000,
      success: true,
      pids: [],
      message: 'ok',
      timestamp: 'x',
    } as any);

    const result = await portKill([5000], { dryRun: true });

    expect(result).toEqual([
      { port: 5000, success: true, pids: [], message: 'ok', timestamp: 'x' },
    ]);
  });

  it('default export points to portKill', async () => {
    mockedKillSinglePort.mockReturnValue({
      port: 3000,
      success: true,
      pids: [],
      message: 'ok',
      timestamp: 'x',
    } as any);

    const result = await portKill(3000);
    const defaultResult = await portKill(3000);

    expect(defaultResult).toEqual(result);
  });
});
