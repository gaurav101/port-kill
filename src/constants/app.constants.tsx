/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactElement } from 'react';
import {
  Sliders,
  Terminal as TermIcon,
  FileCode,
  BookOpen,
  Github,
  CircleHelp,
} from 'lucide-react';

export type TabId = 'builder' | 'terminal' | 'explorer' | 'readme';

export const APP_TAB_IDS = {
  BUILDER: 'builder' as TabId,
  TERMINAL: 'terminal' as TabId,
  EXPLORER: 'explorer' as TabId,
  README: 'readme' as TabId,
} as const;

export interface AppTabDefinition {
  id: TabId;
  name: string;
  icon: ReactElement;
  description: string;
}

export interface AppExternalLink {
  name: string;
  href: string;
  icon: ReactElement;
}

export const APP_TABS: AppTabDefinition[] = [
  {
    id: APP_TAB_IDS.BUILDER,
    name: 'Interactive Code Builder',
    icon: <Sliders className="w-4 h-4" />,
    description:
      'Design custom programmatic snippets or CLI sequences instantly with multiple options.',
  },
  {
    id: APP_TAB_IDS.TERMINAL,
    name: 'Sandbox Terminal Runtime',
    icon: <TermIcon className="w-4 h-4" />,
    description: 'Trace step-by-step diagnostic loops and verify POSIX / Windows process kills.',
  },
  {
    id: APP_TAB_IDS.EXPLORER,
    name: 'Package Code Explorer',
    icon: <FileCode className="w-4 h-4" />,
    description:
      'Review the actual NPM package TypeScript source code structured for high maintainability.',
  },
  {
    id: APP_TAB_IDS.README,
    name: 'Official Package README',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Access the complete API guide, test setup examples, and package metadata.',
  },
];

export const APP_EXTERNAL_LINKS: AppExternalLink[] = [
  {
    name: 'Repository',
    href: 'https://github.com/gaurav101/port-kill',
    icon: <Github className="w-4 h-4" />,
  },
  {
    name: 'Ask / Raise Question',
    href: 'https://github.com/gaurav101/port-kill/issues',
    icon: <CircleHelp className="w-4 h-4" />,
  },
] as const;

export const APP_FOOTER = {
  tagline:
    '@gks101/port-kill - Designed for extreme stability and lightning-fast developer teardowns.',
  licensePrefix: 'Licensed under the ',
  licenseName: 'Apache 2.0 License',
  licenseSuffix: '.',
} as const;
