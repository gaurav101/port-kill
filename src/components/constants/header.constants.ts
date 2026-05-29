/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const HEADER_INSTALL_COMMANDS = {
  npm: 'npm install --save-dev @gks101/port-kill',
  yarn: 'yarn add -D @gks101/port-kill',
  pnpm: 'pnpm add -D @gks101/port-kill',
  npx: 'npx @gks101/port-kill 3000'
} as const;

export const HEADER_COPY_ACTIONS = ['npm', 'npx'] as const;

export const HEADER_DEFAULT_ACTION = {
  primaryInstallCopyKey: 'npm'
} as const;

export const HEADER_CONTENT = {
  releaseTag: 'v1.0.1 Release',
  zeroDepsTag: 'Zero Dependencies CLI',
  packageName: '@gks101/port-kill',
  description:
    'Highly maintainable, lightweight cross-platform port termination library and executable package.',
  installTitle: 'Core Installation',
  copiedLabel: 'Copied',
  usePrefix: 'Use ',
  copyInstallTitle: 'Copy install command',
  starButtonLabel: 'Star on GitHub',
  starUrl: 'https://github.com/gaurav101/port-kill/stargazers'
} as const;

export const HEADER_BADGES = [
  { label: 'npm', value: 'v1.0.1', valueClass: 'bg-blue-500' },
  { label: 'node', value: '>=16', valueClass: 'bg-emerald-500' },
  { label: 'runtime deps', value: '0', valueClass: 'bg-blue-600' },
  { label: 'license', value: 'Apache-2.0', valueClass: 'bg-orange-500' }
] as const;
