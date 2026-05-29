/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CODE_EXPLORER_CONSTANTS = {
  defaultActiveFileIndex: 0,
  copyTimeoutMs: 1800,
  jsonExtension: '.json',
  emptyCodeLine: ' ',
  filePurposePrefix: 'File purpose:',
  copyButtonTitle: 'Copy source content',
  copiedLabel: 'Copied Code!',
  copyLabel: 'Copy Code',
  workspaceTitle: 'Package Workspace Files',
  workspaceDescription:
    'Click on any file to inspect the actual codebase of the port-kill library. The package now uses Strategy and Factory Method patterns for platform behavior.',
  metricsTitle: 'Maintainability Metrics',
  metricZeroDeps: '• Zero Dependencies',
  metricCoreLines: '• Typed API + CLI Surface',
  metricPosix: '• Full POSIX Support',
  metricWindows: '• Full Windows Support',
} as const;
