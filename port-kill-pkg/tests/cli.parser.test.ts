import { parseCliArgs } from '../src/cli/parser';

describe('parseCliArgs', () => {
  it('returns help when no args are provided or help flag exists', () => {
    expect(parseCliArgs([])).toEqual({ type: 'help' });
    expect(parseCliArgs(['-h'])).toEqual({ type: 'help' });
  });

  it('returns version for version flags', () => {
    expect(parseCliArgs(['--version'])).toEqual({ type: 'version' });
    expect(parseCliArgs(['-v'])).toEqual({ type: 'version' });
  });

  it('returns error when signal value is missing', () => {
    const result = parseCliArgs(['3000', '--signal']);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.message).toContain('Please specify a signal name');
    }
  });

  it('returns error for invalid port/arg', () => {
    const result = parseCliArgs(['abc']);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.message).toContain('Invalid port or option');
    }
  });

  it('rejects partial and out-of-range ports', () => {
    const partial = parseCliArgs(['3000abc']);
    const outOfRangeLow = parseCliArgs(['0']);
    const outOfRangeHigh = parseCliArgs(['65536']);

    expect(partial.type).toBe('error');
    expect(outOfRangeLow.type).toBe('error');
    expect(outOfRangeHigh.type).toBe('error');
  });

  it('rejects invalid signal token format', () => {
    const result = parseCliArgs(['3000', '--signal', 'SIGTERM;rm']);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.message).toContain('Invalid signal value');
    }
  });

  it('returns parsed run payload for mixed options', () => {
    const result = parseCliArgs([
      '3000',
      '8080',
      '--verbose',
      '--dry-run',
      '--no-force',
      '-s',
      'SIGINT',
    ]);

    expect(result).toEqual({
      type: 'run',
      ports: [3000, 8080],
      options: {
        port: [3000, 8080],
        force: false,
        verbose: true,
        dryRun: true,
        signal: 'SIGINT',
      },
    });
  });

  it('supports explicit --force and keeps force true', () => {
    const result = parseCliArgs(['3000', '--force', '--verbose']);
    expect(result).toEqual({
      type: 'run',
      ports: [3000],
      options: {
        port: [3000],
        force: true,
        verbose: true,
        dryRun: false,
      },
    });
  });

  it('returns error when only flags are given and no ports exist', () => {
    const result = parseCliArgs(['--verbose']);
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.message).toContain('No target ports specified');
    }
  });
});
