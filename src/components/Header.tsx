/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Check, Terminal, Sparkles } from 'lucide-react';
import { HEADER_BADGES, HEADER_CONTENT, HEADER_COPY_ACTIONS, HEADER_INSTALL_COMMANDS } from './header.constants';

export default function Header() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (cmdText: string, label: string) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Left Side: Logo and Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded text-xs font-mono font-semibold tracking-wider border border-slate-200 uppercase">
              {HEADER_CONTENT.releaseTag}
            </span>
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{HEADER_CONTENT.zeroDepsTag}</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-sans flex items-center gap-2">
            {HEADER_CONTENT.packageName}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            {HEADER_CONTENT.description}
          </p>
          
          {/* Status Badges Row */}
          <div className="flex flex-wrap gap-2 pt-2">
            {HEADER_BADGES.map((badge) => (
              <span key={badge.label} className="inline-flex overflow-hidden rounded text-[11px] font-medium border border-slate-200 shadow-xs">
                <span className="bg-slate-800 text-slate-100 px-2 py-0.5">{badge.label}</span>
                <span className={`${badge.valueClass} text-white px-2 py-0.5 font-bold`}>{badge.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Install Quick box */}
        <div className="w-full md:w-auto md:min-w-[420px] bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>{HEADER_CONTENT.installTitle}</span>
            </div>
            <div className="flex gap-2">
              {HEADER_COPY_ACTIONS.map((type) => (
                <button
                  key={type}
                  onClick={() => copyToClipboard(HEADER_INSTALL_COMMANDS[type], type)}
                  className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-250 transition-colors cursor-pointer"
                >
                  {copiedCmd === type ? HEADER_CONTENT.copiedLabel : `${HEADER_CONTENT.usePrefix}${type}`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4 bg-slate-900/5 rounded p-2.5 font-mono text-[12px] text-slate-800">
            <span className="truncate">{HEADER_INSTALL_COMMANDS.npm}</span>
            <button
              onClick={() => copyToClipboard(HEADER_INSTALL_COMMANDS.npm, 'npm')}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition-colors"
              title={HEADER_CONTENT.copyInstallTitle}
            >
              {copiedCmd === 'npm' ? (
                <Check className="w-4 h-4 text-blue-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
      </div>
    </header>
  );
}
