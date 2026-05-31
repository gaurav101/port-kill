import { describe, expect, it } from 'vitest';
import { resolveEffectiveSignal, shouldIncludeSignalFlag } from './commandBuilder.utils';

const SIGNAL_DEFAULTS = {
  defaultSignal: 'SIGKILL',
  gracefulSignal: 'SIGTERM',
};

describe('commandBuilder signal helpers', () => {
  it('uses selected signal when provided', () => {
    expect(resolveEffectiveSignal(true, 'SIGTERM', SIGNAL_DEFAULTS)).toBe('SIGTERM');
    expect(resolveEffectiveSignal(false, 'SIGINT', SIGNAL_DEFAULTS)).toBe('SIGINT');
  });

  it('falls back to default signal for force mode', () => {
    expect(resolveEffectiveSignal(true, '', SIGNAL_DEFAULTS)).toBe('SIGKILL');
  });

  it('falls back to graceful signal for non-force mode', () => {
    expect(resolveEffectiveSignal(false, '', SIGNAL_DEFAULTS)).toBe('SIGTERM');
  });

  it('includes signal flag only when explicit signal differs from implicit mode signal', () => {
    expect(shouldIncludeSignalFlag(true, 'SIGKILL', SIGNAL_DEFAULTS)).toBe(false);
    expect(shouldIncludeSignalFlag(true, 'SIGTERM', SIGNAL_DEFAULTS)).toBe(true);
    expect(shouldIncludeSignalFlag(false, 'SIGTERM', SIGNAL_DEFAULTS)).toBe(false);
    expect(shouldIncludeSignalFlag(false, 'SIGINT', SIGNAL_DEFAULTS)).toBe(true);
  });
});
