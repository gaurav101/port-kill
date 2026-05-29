import { printResults, printVerboseExecutionDetails } from '../src/cli/reporter';

describe('cli reporter', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('prints verbose details only when verbose is enabled', () => {
    printVerboseExecutionDetails([3000], { verbose: false });
    expect(console.log).not.toHaveBeenCalled();

    printVerboseExecutionDetails([3000], { verbose: true, dryRun: true, force: false });
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('prints success and free messages with exit code 0', () => {
    const exit = printResults([
      {
        port: 3000,
        success: true,
        pids: [11],
        message: 'ok',
        timestamp: 'x',
      },
      {
        port: 3001,
        success: true,
        pids: [],
        message: 'free',
        timestamp: 'x',
      },
    ]);

    expect(exit).toBe(0);
    expect(console.log).toHaveBeenCalled();
  });

  it('prints failure and returns exit code 1', () => {
    const exit = printResults([
      {
        port: 3000,
        success: false,
        pids: [],
        message: 'failed',
        error: 'denied',
        timestamp: 'x',
      },
    ]);

    expect(exit).toBe(1);
    expect(console.error).toHaveBeenCalled();
  });

  it('prints generic failure without detail when error field is absent', () => {
    const exit = printResults([
      {
        port: 3002,
        success: false,
        pids: [],
        message: 'failed',
        timestamp: 'x',
      },
    ]);

    expect(exit).toBe(1);
    expect((console.error as jest.Mock).mock.calls.length).toBe(1);
  });
});
