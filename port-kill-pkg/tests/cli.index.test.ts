import { runCli } from '../src/cli';
import { portKillSync } from '../src';
import { parseCliArgs } from '../src/cli/parser';
import { printResults, printVerboseExecutionDetails } from '../src/cli/reporter';

jest.mock('../src/index', () => ({
  portKillSync: jest.fn(),
}));

jest.mock('../src/cli/parser', () => ({
  parseCliArgs: jest.fn(),
}));

jest.mock('../src/cli/reporter', () => ({
  printResults: jest.fn(),
  printVerboseExecutionDetails: jest.fn(),
}));

describe('runCli', () => {
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  const mockedParse = parseCliArgs as jest.MockedFunction<typeof parseCliArgs>;
  const mockedPortKillSync = portKillSync as jest.MockedFunction<typeof portKillSync>;
  const mockedPrintResults = printResults as jest.MockedFunction<typeof printResults>;
  const mockedVerbose = printVerboseExecutionDetails as jest.MockedFunction<
    typeof printVerboseExecutionDetails
  >;

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('handles help parse result', () => {
    mockedParse.mockReturnValue({ type: 'help' });

    runCli(['--help']);

    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('handles version parse result', () => {
    mockedParse.mockReturnValue({ type: 'version' });

    runCli(['--version']);

    expect(console.log).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('handles parse error result', () => {
    mockedParse.mockReturnValue({ type: 'error', message: 'bad input' });

    runCli(['bad']);

    expect(console.error).toHaveBeenCalledWith('bad input');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('runs normal execution flow', () => {
    mockedParse.mockReturnValue({
      type: 'run',
      ports: [3000],
      options: { port: [3000], force: true, verbose: true, dryRun: false },
    });
    mockedPortKillSync.mockReturnValue([
      { port: 3000, success: true, pids: [1], message: 'ok', timestamp: 'x' },
    ]);
    mockedPrintResults.mockReturnValue(0);

    runCli(['3000']);

    expect(mockedVerbose).toHaveBeenCalledWith([3000], {
      port: [3000],
      force: true,
      verbose: true,
      dryRun: false,
    });
    expect(mockedPortKillSync).toHaveBeenCalledWith([3000], {
      port: [3000],
      force: true,
      verbose: true,
      dryRun: false,
    });
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
