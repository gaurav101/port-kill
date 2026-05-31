/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  TerminalSquare,
  Boxes,
  Braces,
  Copy,
  Check,
  ShieldAlert,
  GitBranch,
  AlertCircle,
} from 'lucide-react';
import { copyTextWithFallback } from '../utils/clipboard';

type PackageManager = 'npm' | 'yarn' | 'pnpm';

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: 'npm i -D @gks101/port-kill',
  yarn: 'yarn add -D @gks101/port-kill',
  pnpm: 'pnpm add -D @gks101/port-kill',
};

const CLI_COMMANDS = [
  {
    note: 'If already installed globally',
    command: 'port-kill 3000',
  },
  {
    note: 'Without global install',
    command: 'npx @gks101/port-kill 3000',
  },
  {
    note: 'Multiple ports with verbose logs',
    command: 'npx @gks101/port-kill 3000 8080 --verbose',
  },
] as const;

const API_SNIPPET = `import { portKill } from '@gks101/port-kill';

// Terminate single or multiple ports seamlessly
await portKill([3000, 8080], {
  force: true,
  verbose: true
});`;

export default function QuickStartReference() {
  const [activePm, setActivePm] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    const success = await copyTextWithFallback(text);
    if (success) {
      setCopyFailed(null);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
      return;
    }

    setCopied(null);
    setCopyFailed(key);
    setTimeout(() => setCopyFailed(null), 1800);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
          Quick Start & Reference
        </h2>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
          Start quickly with install + CLI commands, then plug into TypeScript workflows with
          predictable behavior for scripts and CI.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold">Quick Start</h3>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
              Install
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INSTALL_COMMANDS) as PackageManager[]).map((pm) => {
                const isActive = activePm === pm;
                return (
                  <button
                    key={pm}
                    onClick={() => setActivePm(pm)}
                    aria-pressed={isActive}
                    className={`text-xs font-semibold rounded-md px-2 py-1.5 border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-[12px] flex items-center justify-between gap-3">
              <code className="text-slate-800">{INSTALL_COMMANDS[activePm]}</code>
              <button
                onClick={() => copyToClipboard(INSTALL_COMMANDS[activePm], `install-${activePm}`)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title={
                  copyFailed === `install-${activePm}` ? 'Copy failed' : 'Copy install command'
                }
              >
                {copied === `install-${activePm}` ? (
                  <Check className="w-4 h-4 text-blue-600" />
                ) : copyFailed === `install-${activePm}` ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-blue-600" />
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                CLI Usage
              </p>
            </div>
            <div className="space-y-2">
              {CLI_COMMANDS.map((item) => (
                <div
                  key={item.command}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1"
                >
                  <p className="text-[11px] text-slate-500 font-sans">{item.note}</p>
                  <div className="font-mono text-[12px] flex items-center justify-between gap-3">
                    <code className="text-slate-800">{item.command}</code>
                    <button
                      onClick={() => copyToClipboard(item.command, item.command)}
                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title={copyFailed === item.command ? 'Copy failed' : 'Copy CLI command'}
                    >
                      {copied === item.command ? (
                        <Check className="w-4 h-4 text-blue-600" />
                      ) : copyFailed === item.command ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="xl:col-span-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Braces className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold">Programmatic API Snippet</h3>
          </div>
          <pre className="rounded-lg border border-slate-200 bg-slate-900 p-3 overflow-x-auto font-mono text-[12px] leading-relaxed text-slate-100">
            <code>{API_SNIPPET}</code>
          </pre>
        </section>

        <section className="xl:col-span-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Technical Notes & Caveats</h3>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SYSTEM PERMISSIONS</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Protected/low ports (for example port 80) may require elevated privileges
              (`sudo`/Administrator) for PID lookup and termination.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-semibold">
              <GitBranch className="w-3.5 h-3.5" />
              <span>PIPELINE SAFETY</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              If a port is already free, CLI treats it as success and can exit with code `0`.
              Invalid args/permission or kill failures return non-zero. Use `&&` when you want
              hard-stop chaining behavior.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
