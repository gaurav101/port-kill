/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMMAND_DIAGNOSTIC_KEYWORDS, COMMAND_DIAGNOSTIC_MESSAGES } from './messages';

export interface CommandFailureContext {
  command: string;
  status?: number | null;
  stderr?: string;
  error?: string;
}

export function buildCommandFailureMessage(context: CommandFailureContext): string {
  const stderr = normalizeMessage(context.stderr);
  const runtimeError = normalizeMessage(context.error);
  const rawReason = stderr || runtimeError || COMMAND_DIAGNOSTIC_MESSAGES.DEFAULT_REASON;
  const diagnosis = diagnoseFailure(rawReason);
  const statusText = typeof context.status === 'number' ? ` Exit code: ${context.status}.` : '';

  return [
    `Command failed: ${context.command}.${statusText}`,
    `Reason: ${rawReason}`,
    `Likely issue: ${diagnosis.issue}`,
    `Possible fix: ${diagnosis.fix}`,
  ].join(' ');
}

function normalizeMessage(message?: string): string {
  return (message || '').trim().replace(/\s+/g, ' ');
}

function diagnoseFailure(reason: string): { issue: string; fix: string } {
  const lowerReason = reason.toLowerCase();

  if (hasAnyKeyword(lowerReason, COMMAND_DIAGNOSTIC_KEYWORDS.PERMISSION)) {
    return {
      issue: COMMAND_DIAGNOSTIC_MESSAGES.ISSUE_PERMISSION,
      fix: COMMAND_DIAGNOSTIC_MESSAGES.FIX_PERMISSION,
    };
  }

  if (hasAnyKeyword(lowerReason, COMMAND_DIAGNOSTIC_KEYWORDS.NO_PROCESS)) {
    return {
      issue: COMMAND_DIAGNOSTIC_MESSAGES.ISSUE_NO_PROCESS,
      fix: COMMAND_DIAGNOSTIC_MESSAGES.FIX_NO_PROCESS,
    };
  }

  if (hasAnyKeyword(lowerReason, COMMAND_DIAGNOSTIC_KEYWORDS.INVALID_SIGNAL)) {
    return {
      issue: COMMAND_DIAGNOSTIC_MESSAGES.ISSUE_INVALID_SIGNAL,
      fix: COMMAND_DIAGNOSTIC_MESSAGES.FIX_INVALID_SIGNAL,
    };
  }

  if (hasAnyKeyword(lowerReason, COMMAND_DIAGNOSTIC_KEYWORDS.MISSING_COMMAND)) {
    return {
      issue: COMMAND_DIAGNOSTIC_MESSAGES.ISSUE_MISSING_COMMAND,
      fix: COMMAND_DIAGNOSTIC_MESSAGES.FIX_MISSING_COMMAND,
    };
  }

  return {
    issue: COMMAND_DIAGNOSTIC_MESSAGES.ISSUE_FALLBACK,
    fix: COMMAND_DIAGNOSTIC_MESSAGES.FIX_FALLBACK,
  };
}

function hasAnyKeyword(input: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => input.includes(keyword));
}
