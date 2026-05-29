import { spawnSync } from 'child_process';
import { runCommand } from '../src/commands/runner';
import { buildCommandFailureMessage } from '../src/commands/diagnostics';

jest.mock('child_process', () => ({
  spawnSync: jest.fn(),
}));

jest.mock('../src/commands/diagnostics', () => ({
  buildCommandFailureMessage: jest.fn(() => 'mocked-failure'),
}));

describe('runCommand', () => {
  const log = jest.fn();
  const mockedSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;
  const mockedBuildFailure = buildCommandFailureMessage as jest.MockedFunction<
    typeof buildCommandFailureMessage
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns success on zero exit code', () => {
    mockedSpawnSync.mockReturnValue({
      stdout: '123\n',
      stderr: '',
      status: 0,
    } as any);

    const result = runCommand('echo hello', log);

    expect(result).toEqual({
      stdout: '123\n',
      stderr: '',
      status: 0,
      success: true,
    });
    expect(mockedBuildFailure).not.toHaveBeenCalled();
  });

  it('returns failure and diagnostic message for non-zero exit code', () => {
    mockedSpawnSync.mockReturnValue({
      stdout: '',
      stderr: 'permission denied',
      status: 1,
    } as any);

    const result = runCommand('kill -9 1', log);

    expect(result.success).toBe(false);
    expect(result.error).toBe('mocked-failure');
    expect(mockedBuildFailure).toHaveBeenCalledWith({
      command: 'kill -9 1',
      status: 1,
      stderr: 'permission denied',
      error: undefined,
    });
  });

  it('handles runtime spawn errors', () => {
    mockedSpawnSync.mockReturnValue({
      stdout: '',
      stderr: '',
      status: null,
      error: new Error('spawn failed'),
    } as any);

    const result = runCommand('bad-command', log);

    expect(result.success).toBe(false);
    expect(result.error).toBe('mocked-failure');
    expect(mockedBuildFailure).toHaveBeenCalledWith({
      command: 'bad-command',
      status: null,
      stderr: '',
      error: 'spawn failed',
    });
  });
});
