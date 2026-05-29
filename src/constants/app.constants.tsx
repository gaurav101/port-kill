/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactElement } from 'react';
import { Sliders, Terminal as TermIcon, FileCode, BookOpen } from 'lucide-react';

export type TabId = 'builder' | 'terminal' | 'explorer' | 'readme';

export interface AppTabDefinition {
  id: TabId;
  name: string;
  icon: ReactElement;
  description: string;
}

export const APP_TABS: AppTabDefinition[] = [
  {
    id: 'builder',
    name: 'Interactive Code Builder',
    icon: <Sliders className="w-4 h-4" />,
    description: 'Design custom programmatic snippets or CLI sequences instantly with multiple options.'
  },
  {
    id: 'terminal',
    name: 'Sandbox Terminal Runtime',
    icon: <TermIcon className="w-4 h-4" />,
    description: 'Trace step-by-step diagnostic loops and verify POSIX / Windows process kills.'
  },
  {
    id: 'explorer',
    name: 'Package Code Explorer',
    icon: <FileCode className="w-4 h-4" />,
    description: 'Review the actual NPM package TypeScript source code structured for high maintainability.'
  },
  {
    id: 'readme',
    name: 'Official Package README',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Access the complete API guides, test suite teardoun setups, and live badge metrics.'
  }
];

export const APP_FOOTER = {
  tagline: '@gks101/port-kill - Designed for extreme stability and lightning-fast developer teardowns.',
  licensePrefix: 'Licensed under the ',
  licenseName: 'Apache 2.0 License',
  licenseSuffix: '.'
} as const;
