/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Terminal, ShieldCheck, HeartHandshake, GitPullRequest, 
  HelpCircle, BookOpen, Key, Check, Copy, Flame
} from 'lucide-react';

export default function ReadmeViewer() {
  const [copied, setCopied] = useState<string | null>(null);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
      
      {/* Title & Badges Header */}
      <div className="border-b border-slate-100 pb-6 space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          @gks101/port-kill
        </h2>
        
        {/* Modern Live Action Badges */}
        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-semibold text-white">
          <span className="inline-flex rounded overflow-hidden">
            <span className="bg-gray-800 px-2.5 py-1">npm</span>
            <span className="bg-blue-500 px-2.5 py-1">v1.0.0</span>
          </span>
          <span className="inline-flex rounded overflow-hidden">
            <span className="bg-gray-800 px-2.5 py-1">build</span>
            <span className="bg-blue-500 px-2.5 py-1">passing</span>
          </span>
          <span className="inline-flex rounded overflow-hidden">
            <span className="bg-gray-800 px-2.5 py-1">coverage</span>
            <span className="bg-blue-650 bg-blue-600 px-2.5 py-1">100%</span>
          </span>
          <span className="inline-flex rounded overflow-hidden">
            <span className="bg-gray-800 px-2.5 py-1">license</span>
            <span className="bg-sky-500 px-2.5 py-1">Apache-2.0</span>
          </span>
          <span className="inline-flex rounded overflow-hidden">
            <span className="bg-gray-800 px-2.5 py-1">PRs</span>
            <span className="bg-amber-500 px-2.5 py-1">welcome</span>
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed font-sans max-w-2xl">
          A highly maintainable, lightweight, cross-platform programmatic API and zero-dependency CLI tool to terminate processes running on specific ports. Designed specifically for Node.js developers seeking seamless integration into test suites (like Jest/Mocha), DevOps CI pipelines, and daily workflows.
        </p>
      </div>

      {/* Section 1: Key Advantages */}
      <div className="space-y-4 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          🚀 Key Advantages
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <li className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <div>
              <span className="font-semibold text-slate-800 block">Zero Outside Dependencies</span>
              Instant downloads and lightweight execution inside continuous integration pipelines.
            </div>
          </li>
          <li className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <div>
              <span className="font-semibold text-slate-800 block">Deep Cross-Platform Support</span>
              Equalized operation commands for macOS/POSIX systems and Windows command runtimes.
            </div>
          </li>
          <li className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <div>
              <span className="font-semibold text-slate-800 block">Multi-Lookup Fallbacks</span>
              Queries active sockets via lsof, fuser (Debian fallbacks), and regex netstat matches.
            </div>
          </li>
          <li className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-2.5">
            <span className="text-blue-500 mt-0.5 font-bold">✓</span>
            <div>
              <span className="font-semibold text-slate-800 block">Complete Process Trees</span>
              Terminates target parent processes and associated children trees to avoid detached zombie sockets.
            </div>
          </li>
        </ul>
      </div>

      {/* Section 2: Installation */}
      <div className="space-y-3 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          💻 Installation
        </h3>
        
        {/* Install snippets */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">To utilize globally on any system command shell:</p>
            <div className="flex bg-slate-50 rounded-lg p-2.5 border border-slate-200 items-center justify-between font-mono text-xs text-slate-800">
              <code>npm install -g @gks101/port-kill</code>
              <button onClick={() => copySnippet('npm install -g @gks101/port-kill', 'global')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                {copied === 'global' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">To save as development dependency inside codebases:</p>
            <div className="flex bg-slate-50 rounded-lg p-2.5 border border-slate-200 items-center justify-between font-mono text-xs text-slate-800">
              <code>npm install --save-dev @gks101/port-kill</code>
              <button onClick={() => copySnippet('npm install --save-dev @gks101/port-kill', 'local')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                {copied === 'local' ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Commands */}
      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-blue-600" />
          🛠 Direct CLI Actions
        </h3>
        
        <p className="text-xs text-slate-500">Run via npx or directly as global script parameters:</p>
        
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs text-sky-200 space-y-3.5">
          <div>
            <span className="text-gray-500 block"># Terminate processes on port 3000 mapping immediately</span>
            <span>$ port-kill 3000</span>
          </div>
          <div>
            <span className="text-gray-500 block"># Release multiple targets concurrently</span>
            <span>$ port-kill 3000 8080 8081</span>
          </div>
          <div>
            <span className="text-gray-500 block"># Access execution tracing and debug info</span>
            <span>$ port-kill 3000 --verbose</span>
          </div>
          <div>
            <span className="text-gray-500 block"># Probe and identify bounds safely without terminate events</span>
            <span>$ port-kill 5000 --dry-run</span>
          </div>
        </div>
      </div>

      {/* Section 4: Testing Framework teardown */}
      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          🎭 Automated Testharness Integrations (Mocha/Jest)
        </h3>
        <p className="text-xs text-slate-500">
          Clean sockets preceding network binds inside Jest environments prevent annoying <code>EADDRINUSE</code> failures during intense local file watchers:
        </p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`import { portKillSync } from '@gks101/port-kill';
import express from 'express';

describe('API Route Assertion Suites', () => {
  const TEST_PORT = 4900;
  let activeServer: any;

  beforeAll(() => {
    // Force synchronize release before server mount
    portKillSync(TEST_PORT, { verbose: false, force: true });
    
    activeServer = express().listen(TEST_PORT);
  });

  afterAll((done) => {
    activeServer.close(() => {
      // Clear socket on exit
      portKillSync(TEST_PORT);
      done();
    });
  });
});`}
        </div>
      </div>

      {/* Section 5: API Grid configuration */}
      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          ⚙ API Options Reference
        </h3>
        
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50 font-semibold text-slate-700 text-left">
              <tr>
                <th className="px-4 py-2.5">Option</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Default</th>
                <th className="px-4 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white font-mono">
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">port</td>
                <td className="px-4 py-2.5 text-blue-600">number | number[]</td>
                <td className="px-3.5 py-2.5 text-slate-400">Required</td>
                <td className="px-4 py-2.5 font-sans leading-relaxed text-slate-600 font-medium">The specific port (or array of ports) to run lookup filters and terminate.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">force</td>
                <td className="px-4 py-2.5 text-blue-600">boolean</td>
                <td className="px-3.5 py-2.5 text-slate-500">true</td>
                <td className="px-4 py-2.5 font-sans leading-relaxed text-slate-600 font-medium">When true, utilizes SIGKILL on POSIX/Mac machines, and /F taskkills on Windows windows.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">signal</td>
                <td className="px-4 py-2.5 text-blue-600">string</td>
                <td className="px-3.5 py-2.5 text-slate-500">'SIGKILL'</td>
                <td className="px-4 py-2.5 font-sans leading-relaxed text-slate-600 font-medium">Sends standard Unix signals. Override with SIGTERM or SIGINT if needed (ignored on Windows).</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-900">verbose</td>
                <td className="px-4 py-2.5 text-blue-600">boolean</td>
                <td className="px-3.5 py-2.5 text-slate-500">false</td>
                <td className="px-4 py-2.5 font-sans leading-relaxed text-slate-600 font-medium">Prints real-time system executions, socket maps, and shell outcome codes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 6: Contributions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-3 font-sans">
        <HeartHandshake className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-slate-900">🤝 Peer Collaboration Guide</h4>
          <p className="text-slate-600 leading-relaxed">
            We values peer contributions! To join up: Fork the package codebase, write targeted modifications into `/src`, guarantee all linter tests compile perfectly, and submit clean PRs with high visibility summaries.
          </p>
        </div>
      </div>

    </div>
  );
}
