import { buildCommandFailureMessage } from '../src/commands/diagnostics';

describe('buildCommandFailureMessage', () => {
  it('maps permission failures to permission guidance', () => {
    const message = buildCommandFailureMessage({
      command: 'kill -9 123',
      status: 1,
      stderr: 'Permission denied',
    });

    expect(message).toContain('Command failed: kill -9 123. Exit code: 1.');
    expect(message).toContain('Likely issue: the current user does not have permission');
    expect(message).toContain('Possible fix: run the command from the same user');
  });

  it('maps no-process failures to retry guidance', () => {
    const message = buildCommandFailureMessage({
      command: 'kill -9 123',
      error: 'No such process',
    });

    expect(message).toContain('Likely issue: the process exited after discovery');
    expect(message).toContain('Possible fix: rerun port-kill');
  });

  it('maps invalid signal failures', () => {
    const message = buildCommandFailureMessage({
      command: 'kill -INVALID 123',
      stderr: 'invalid signal',
    });

    expect(message).toContain('Likely issue: the selected signal is not supported');
    expect(message).toContain('Possible fix: use a standard POSIX signal');
  });

  it('maps missing command failures', () => {
    const message = buildCommandFailureMessage({
      command: 'lsof -t -n -i :3000',
      stderr: 'required tool is not installed',
    });

    expect(message).toContain('Likely issue: a required system command is unavailable');
    expect(message).toContain('Possible fix: install the missing system utility');
  });

  it('falls back to default reason and fallback guidance', () => {
    const message = buildCommandFailureMessage({
      command: 'taskkill /PID 123',
    });

    expect(message).toContain('Reason: The command exited unsuccessfully without stderr output.');
    expect(message).toContain(
      'Likely issue: the operating system rejected the termination command.'
    );
  });
});
