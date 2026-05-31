/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu } from 'lucide-react';
import { useLocalStorageState } from '@gks101/localyx';

import Header from './components/Header';
import CommandBuilder from './components/CommandBuilder';
import TerminalPlayground from './components/TerminalPlayground';
import CodeExplorer from './components/CodeExplorer';
import ReadmeViewer from './components/ReadmeViewer';
import UseCases from './components/UseCases';
import {
  APP_EXTERNAL_LINKS,
  APP_FOOTER,
  APP_TABS,
  APP_TAB_IDS,
  TabId,
} from './constants/app.constants';

export default function App() {
  type ThemeMode = 'light' | 'dark';
  const resolveInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [activeTab, setActiveTab] = useState<TabId>(APP_TAB_IDS.QUICK_REFERENCE);
  const [theme, setTheme] = useLocalStorageState<ThemeMode>('theme', resolveInitialTheme(), {
    namespace: '@gks101/port-kill',
    encrypt: null,
    decrypt: null,
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className={`min-h-screen pb-20 flex flex-col font-sans select-none ${
        theme === 'dark'
          ? 'theme-dark bg-slate-950 selection:bg-slate-700 selection:text-slate-100'
          : 'bg-slate-50 selection:bg-blue-50 selection:text-blue-950'
      }`}
    >
      {/* Master Header Navigation */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/*  Main View Wrapper */}
      <main className="max-w-7xl mx-auto px-6 mt-8 w-full flex-1 flex flex-col gap-8">
        <div className="md:hidden w-full space-y-2">
          <label htmlFor="app-tab-select" className="text-[11px] font-semibold text-slate-500">
            Section
          </label>
          <select
            id="app-tab-select"
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as TabId)}
            className="w-full bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {APP_TABS.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2 pt-1">
            {APP_EXTERNAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Tab Navigator Pills */}
        <div className="hidden md:flex flex-wrap gap-2 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 backdrop-blur-sm self-start w-full">
          {APP_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${isSelected ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'}`}
              >
                {tab.icon}
                <span>{tab.name}</span>

                {isSelected && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute inset-y-0.5 inset-x-0.5 bg-blue-600/5 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          {APP_EXTERNAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="relative px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-white/40"
            >
              {link.icon}
              <span>{link.name}</span>
            </a>
          ))}
        </div>

        {/* Dynamic Inner Dashboard Page Render */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="outline-none"
            >
              {activeTab === APP_TAB_IDS.BUILDER && <CommandBuilder />}
              {activeTab === APP_TAB_IDS.TERMINAL && <TerminalPlayground />}
              {activeTab === APP_TAB_IDS.EXPLORER && <CodeExplorer />}
              {activeTab === APP_TAB_IDS.QUICK_REFERENCE && <UseCases />}
              {activeTab === APP_TAB_IDS.README && <ReadmeViewer />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/*  Aesthetic Integrity Footer */}
      <footer className="mt-16 border-t border-gray-100 pt-8 px-6 text-center select-none text-gray-450 text-[11px] text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-mono text-gray-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>{APP_FOOTER.tagline}</span>
          </div>
          <div>
            {APP_FOOTER.licensePrefix}
            <span className="font-semibold text-gray-600">{APP_FOOTER.licenseName}</span>
            {APP_FOOTER.licenseSuffix}
          </div>
        </div>
      </footer>
    </div>
  );
}
