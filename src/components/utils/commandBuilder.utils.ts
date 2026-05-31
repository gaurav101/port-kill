/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface SignalDefaults {
  defaultSignal: string;
  gracefulSignal: string;
}

export function resolveEffectiveSignal(
  force: boolean,
  selectedSignal: string,
  defaults: SignalDefaults
): string {
  if (selectedSignal && selectedSignal.trim().length > 0) {
    return selectedSignal;
  }
  return force ? defaults.defaultSignal : defaults.gracefulSignal;
}

export function shouldIncludeSignalFlag(
  force: boolean,
  effectiveSignal: string,
  defaults: SignalDefaults
): boolean {
  const implicitSignal = force ? defaults.defaultSignal : defaults.gracefulSignal;
  return effectiveSignal !== implicitSignal;
}
