import {
  createDryRunResult,
  createFreePortResult,
  createTerminationResult,
} from '../src/platform/results';

describe('platform results', () => {
  const context = {
    port: 3000,
    pids: [11, 22],
    timestamp: '2026-01-01T00:00:00.000Z',
  };

  it('creates free-port result', () => {
    expect(createFreePortResult(3000, context.timestamp)).toEqual({
      port: 3000,
      success: true,
      pids: [],
      message: 'Port 3000 is free. No active processes found.',
      timestamp: context.timestamp,
    });
  });

  it('creates dry-run result', () => {
    expect(createDryRunResult(context)).toEqual({
      port: 3000,
      success: true,
      pids: [11, 22],
      message:
        '[DRY_RUN] Discovered active process tree [11, 22] on port 3000. No kill signal sent.',
      timestamp: context.timestamp,
    });
  });

  it('creates windows termination result', () => {
    expect(
      createTerminationResult(
        context,
        { name: 'windows' } as any,
        { success: false, error: 'partial fail' },
        'SIGKILL'
      )
    ).toEqual({
      port: 3000,
      success: false,
      pids: [11, 22],
      message: 'Partial failure or error encountered during process termination on Windows.',
      error: 'partial fail',
      timestamp: context.timestamp,
    });
  });

  it('creates windows success termination result', () => {
    expect(
      createTerminationResult(context, { name: 'windows' } as any, { success: true }, 'SIGKILL')
    ).toEqual({
      port: 3000,
      success: true,
      pids: [11, 22],
      message: 'Successfully terminated all processes on port 3000.',
      error: undefined,
      timestamp: context.timestamp,
    });
  });

  it('creates unix termination result and uses fallback signal when absent', () => {
    expect(
      createTerminationResult(context, { name: 'unix' } as any, { success: true }, 'SIGTERM')
    ).toEqual({
      port: 3000,
      success: true,
      pids: [11, 22],
      message: 'Successfully terminated all processes on port 3000 using SIGTERM.',
      error: undefined,
      timestamp: context.timestamp,
    });
  });

  it('creates unix failure termination result', () => {
    expect(
      createTerminationResult(
        context,
        { name: 'unix' } as any,
        { success: false, error: 'denied', signal: 'SIGINT' },
        'SIGTERM'
      )
    ).toEqual({
      port: 3000,
      success: false,
      pids: [11, 22],
      message: 'Failed to terminate processes on port 3000 using SIGINT.',
      error: 'denied',
      timestamp: context.timestamp,
    });
  });
});
