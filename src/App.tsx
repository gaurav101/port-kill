/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Terminal as TermIcon, FileCode, BookOpen, 
  HelpCircle, ShieldAlert, Cpu, Layers 
} from 'lucide-react';

import Header from './components/Header';
import CommandBuilder from './components/CommandBuilder';
import TerminalPlayground from './components/TerminalPlayground';
import CodeExplorer from './components/CodeExplorer';
import ReadmeViewer from './components/ReadmeViewer';

type TabId = 'builder' | 'terminal' | 'explorer' | 'readme';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('builder');

  const tabs = [
    {
      id: 'builder' as TabId,
      name: 'Interactive Code Builder',
      icon: <Sliders className="w-4 h-4" />,
      description: 'Design custom programmatic snippets or CLI sequences instantly with multiple options.'
    },
    {
      id: 'terminal' as TabId,
      name: 'Sandbox Terminal Runtime',
      icon: <TermIcon className="w-4 h-4" />,
      description: 'Trace step-by-step diagnostic loops and verify POSIX / Windows process kills.'
    },
    {
      id: 'explorer' as TabId,
      name: 'Package Code Explorer',
      icon: <FileCode className="w-4 h-4" />,
      description: 'Review the actual NPM package TypeScript source code structured for high maintainability.'
    },
    {
      id: 'readme' as TabId,
      name: 'Official Package README',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Access the complete API guides, test suite teardoun setups, and live badge metrics.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 flex flex-col font-sans select-none selection:bg-blue-50 selection:text-blue-950">
      
      {/* 🚀 Master Header Navigation */}
      <Header />

      {/* 🖥️ Main View Wrapper */}
      <main className="max-w-7xl mx-auto px-6 mt-8 w-full flex-1 flex flex-col gap-8">
        
        {/* Tab Navigator Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 backdrop-blur-sm self-start w-full md:w-auto">
          {tabs.map((tab) => {
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
              {activeTab === 'builder' && <CommandBuilder />}
              {activeTab === 'terminal' && <TerminalPlayground />}
              {activeTab === 'explorer' && <CodeExplorer />}
              {activeTab === 'readme' && <ReadmeViewer />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* 🛡️ Aesthetic Integrity Footer */}
      <footer className="mt-16 border-t border-gray-100 pt-8 px-6 text-center select-none text-gray-450 text-[11px] text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-mono text-gray-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>@gks101/port-kill - Designed for extreme stability and lightning-fast developer teardowns.</span>
          </div>
          <div>
            Licensed under the <span className="font-semibold text-gray-600">Apache 2.0 License</span>.
          </div>
        </div>
      </footer>

    </div>
  );
}
