/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Copy, Check, Terminal, Cpu, Lightbulb, 
  HelpCircle, Sliders, Code2, AlertCircle, RefreshCw
} from 'lucide-react';

export default function CommandBuilder() {
  const [portInputs, setPortInputs] = useState<string>('3000');
  const [isSync, setIsSync] = useState<boolean>(false);
  const [force, setForce] = useState<boolean>(true);
  const [verbose, setVerbose] = useState<boolean>(false);
  const [dryRun, setDryRun] = useState<boolean>(false);
  const [signal, setSignal] = useState<string>('SIGKILL');
  const [hasCustomLogger, setHasCustomLogger] = useState<boolean>(false);
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Parse port string into valid numbers
  const parsedPorts = portInputs
    .split(/[\s,]+/)
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p > 0 && p < 65536);

  const displayPorts = parsedPorts.length > 0 ? parsedPorts : [3000];

  const triggerCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  // Generate the exact CLI Command
  const generateCliCommand = () => {
    const portsStr = displayPorts.join(' ');
    let flags = '';
    if (verbose) flags += ' --verbose';
    if (!force) flags += ' --no-force';
    if (dryRun) flags += ' --dry-run';
    if (signal !== 'SIGKILL' && signal !== 'SIGTERM' && force) {
      // Unix specific
      flags += ` --signal ${signal}`;
    } else if (!force && signal !== 'SIGTERM') {
      flags += ` --signal ${signal}`;
    }
    return `port-kill ${portsStr}${flags}`;
  };

  // Generate Programmatic Node.js Code
  const generateProgrammaticCode = () => {
    const fnName = isSync ? 'portKillSync' : 'portKill';
    const portsParam = displayPorts.length === 1 ? displayPorts[0] : `[${displayPorts.join(', ')}]`;
    
    // Build options string
    const optionsObj: string[] = [];
    if (!force) optionsObj.push('  force: false');
    if (signal !== 'SIGKILL') optionsObj.push(`  signal: '${signal}'`);
    if (verbose) optionsObj.push('  verbose: true');
    if (dryRun) optionsObj.push('  dryRun: true');
    
    if (hasCustomLogger) {
      optionsObj.push(`  logger: (msg, level) => {\n    myCustomMetrics.log(\`[PORT_KILL] [\${level}] \${msg}\`);\n  }`);
    }

    const optionsStr = optionsObj.length > 0 
      ? `,\n  {\n${optionsObj.join(',\n')}\n  }` 
      : '';

    if (isSync) {
      return `import { portKillSync } from '@gks101/port-kill';\n\nfunction releasePorts() {\n  // Synchronous clearance (excellent for test run setups)\n  const results = portKillSync(${portsParam}${optionsStr});\n  \n  results.forEach(res => {\n    if (res.success) {\n      console.log(\`Port \${res.port} is clean. Discovered PIDs: \${res.pids.join(', ')}\`);\n    } else {\n      console.error(\`Failed to clean port \${res.port}: \${res.error}\`);\n    }\n  });\n}`;
    }

    return `import { portKill } from '@gks101/port-kill';\n\nasync function initializeServer() {\n  try {\n    // Non-blocking asynchronous query & termination\n    const results = await portKill(${portsParam}${optionsStr});\n    console.log('Release details:', results);\n  } catch (err) {\n    console.error('Core port termination crashed', err);\n  }\n}`;
  };

  // Generate OS Commands which are executed under the hood
  const getOsCommandInfo = () => {
    const targetPort = displayPorts[0];
    const killSigFlag = force ? 'SIGKILL' : signal;
    
    return {
      macos: {
        find: `lsof -t -n -i :${targetPort}`,
        kill: `kill -${killSigFlag} <PIDs>`,
        summary: `Queries listening sockets directly via kernel PID lists. High performance, bypasses active hostname reverse lookups.`
      },
      linux: {
        find: `lsof -t -n -i :${targetPort} || fuser ${targetPort}/tcp`,
        kill: `kill -${killSigFlag} <PIDs>`,
        summary: `Uses lsof lookup index. Carries a fuser socket parse fallback sequence to ensure failsafe execution across standard Alpine/Debian platforms.`
      },
      windows: {
        find: `netstat -ano (filter for :${targetPort})`,
        kill: `taskkill ${force ? '/F' : ''} /T /PID <PID>`,
        summary: `Queries Windows netstat columns, matches exact bound ports via Regex, and propagates a child process tree tear-down (/T /F).`
      }
    };
  };

  const osDetails = getOsCommandInfo();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: Configure Options Component */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900 tracking-tight text-base font-sans">
              Interactive Builder
            </h2>
          </div>

          {/* Port Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                Target Ports
              </label>
              <span className="text-xs text-mono text-gray-400 font-medium">
                Space/comma separated
              </span>
            </div>
            <input
              type="text"
              value={portInputs}
              onChange={(e) => setPortInputs(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm font-mono px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
              placeholder="e.g. 3000, 8080"
            />
            {parsedPorts.length === 0 && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Please input one or more integer values (defaulting to 3000)
              </p>
            )}
          </div>

          {/* Programmatic Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              API Execution Hook
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => setIsSync(false)}
                className={`text-xs font-medium py-1.5 rounded transition-all cursor-pointer ${!isSync ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Asynchronous (Promise)
              </button>
              <button
                onClick={() => setIsSync(true)}
                className={`text-xs font-medium py-1.5 rounded transition-all cursor-pointer ${isSync ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Synchronous (Blocking)
              </button>
            </div>
          </div>

          {/* Kill Flags Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Kill Strategy Options</span>
            </div>
            
            <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              {/* Force Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Aggressive Force Kill</p>
                  <p className="text-[11px] text-slate-400">Emits SIGKILL immediately</p>
                </div>
                <button
                  onClick={() => setForce(!force)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${force ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${force ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Dry-run Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Safe Dry-Run Mode</p>
                  <p className="text-[11px] text-slate-400">Audits and logs without killing</p>
                </div>
                <button
                  onClick={() => setDryRun(!dryRun)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dryRun ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${dryRun ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Verbose Logs Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Verbose Console Logs</p>
                  <p className="text-[11px] text-slate-400">Provides raw command execution details</p>
                </div>
                <button
                  onClick={() => setVerbose(!verbose)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${verbose ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${verbose ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Custom Logger Callback Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Custom Log Callback</p>
                  <p className="text-[11px] text-slate-400">Intercept & pipe telemetry elsewhere</p>
                </div>
                <button
                  onClick={() => setHasCustomLogger(!hasCustomLogger)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hasCustomLogger ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${hasCustomLogger ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Signal Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center justify-between">
              <span>POSIX Signal Override (Mac/Linux Only)</span>
              <span className="text-[10px] text-amber-600 font-mono">Ignored on Windows</span>
            </label>
            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-sans"
            >
              <option value="SIGKILL">SIGKILL (Immediate Process Termination)</option>
              <option value="SIGTERM">SIGTERM (Graceful Handshake Request)</option>
              <option value="SIGINT">SIGINT (Keyboard/Manual Interrupt, Ctrl+C)</option>
              <option value="SIGHUP">SIGHUP (Hangup terminal control)</option>
            </select>
          </div>
          
        </div>
        
        {/* Help Banner Tip */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-900">Pro-Tip for testing</p>
            <p className="text-[11px] text-amber-700 leading-normal">
              Running <code>portKillSync</code> in the testing helper hooks (like Jest's <code>beforeAll</code>) prevents frequent "EADDRINUSE" port acquisition failure locks during test watch-runs.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Display CLI Command & Programmatic Outputs */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Terminal Command View */}
        <div className="bg-slate-900 shadow-lg rounded-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-medium text-slate-300">Generated CLI Command</span>
            </div>
            <button
              onClick={() => triggerCopy(generateCliCommand(), 'cli')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy shell command"
            >
              <AnimatePresence mode="wait">
                {copiedSection === 'cli' ? (
                  <motion.span
                    key="checked"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </motion.span>
                ) : (
                  <motion.span key="copy" className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-slate-200">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className="p-5 font-mono text-xs text-blue-300 bg-slate-900 overflow-x-auto whitespace-pre select-all">
            {generateCliCommand()}
          </div>
        </div>

        {/* Programmatic NPM usage Codeblock */}
        <div className="bg-slate-950 shadow-lg rounded-2xl overflow-hidden border border-slate-900">
          <div className="flex items-center justify-between bg-slate-950/80 px-4 py-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                Programmatic Code Integration
              </span>
            </div>
            
            <button
              onClick={() => triggerCopy(generateProgrammaticCode(), 'code')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy programmatic code"
            >
              <AnimatePresence mode="wait">
                {copiedSection === 'code' ? (
                  <motion.span
                    key="checked"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </motion.span>
                ) : (
                  <motion.span key="copy" className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-slate-200">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-sky-100 bg-slate-950/95 overflow-x-auto leading-relaxed overflow-y-auto max-h-[280px]">
            <code>{generateProgrammaticCode()}</code>
          </pre>
        </div>

        {/* Under the Hood (Platform Specific Details) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-900 text-sm tracking-tight font-sans">
              Under-the-Hood: Native Shell Actions Mapping
            </span>
          </div>
          
          <p className="text-xs text-gray-400 leading-normal">
            Your Node process dynamically routes commands using <code>process.platform</code> checks. These native commands run on the host shell:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* macOS */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">macOS (Darwin)</span>
                  <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100 font-mono font-medium">POSIX</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.macos.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="text-gray-400 font-semibold">FIND:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.macos.find}>{osDetails.macos.find}</div>
                <div className="text-gray-400 font-semibold mt-1">KILL:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.macos.kill}>{osDetails.macos.kill}</div>
              </div>
            </div>

            {/* Linux */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Linux Kernel</span>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-mono font-medium">POSIX</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.linux.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="text-gray-400 font-semibold">FIND:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.linux.find}>{osDetails.linux.find}</div>
                <div className="text-gray-400 font-semibold mt-1">KILL:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.linux.kill}>{osDetails.linux.kill}</div>
              </div>
            </div>

            {/* Windows */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Windows (Win32)</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-mono font-medium">Cmd/PS</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.windows.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="text-gray-400 font-semibold">FIND:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.windows.find}>{osDetails.windows.find}</div>
                <div className="text-gray-400 font-semibold mt-1">KILL:</div>
                <div className="text-gray-800 bg-gray-200/40 p-1.5 rounded truncate" title={osDetails.windows.kill}>{osDetails.windows.kill}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
