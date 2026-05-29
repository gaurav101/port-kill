/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, PlayCircle, RefreshCw, Terminal as TermIcon } from 'lucide-react';

interface LogLine {
  text: string;
  type: 'info' | 'warn' | 'error' | 'debug' | 'success' | 'cmd';
}

export default function TerminalPlayground() {
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [selectedPlatform, setSelectedPlatform] = useState<'unix' | 'windows'>('unix');
  const [running, setRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Presets configuration
  const presets = {
    standard: {
      name: 'Standard Single Target (Port 3000)',
      cmd: 'port-kill 3000',
      pids: [18451],
      verbose: false,
      dryRun: false,
      force: true,
      signal: 'SIGKILL'
    },
    verboseMultiple: {
      name: 'Verbose Multi-Target (Ports 8080 or 8081)',
      cmd: 'port-kill 8080 8081 --verbose',
      pids: [29541, 29542],
      verbose: true,
      dryRun: false,
      force: true,
      signal: 'SIGKILL'
    },
    dryAudit: {
      name: 'Safe Dry-Run Audit (Port 5000)',
      cmd: 'port-kill 5000 --dry-run',
      pids: [91244],
      verbose: true,
      dryRun: true,
      force: true,
      signal: 'SIGKILL'
    },
    graceful: {
      name: 'Graceful Termination (Port 8000)',
      cmd: 'port-kill 8000 --no-force --signal SIGTERM',
      pids: [412],
      verbose: false,
      dryRun: false,
      force: false,
      signal: 'SIGTERM'
    }
  };

  // Scroll to bottom when logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle running simulation
  const runSimulation = () => {
    if (running) return;
    setRunning(true);
    setLogs([]);

    const preset = presets[selectedPreset as keyof typeof presets];
    const isWin = selectedPlatform === 'windows';
    const activePids = preset.pids;

    const sequence: { text: string; type: LogLine['type']; delay: number }[] = [
      { text: `$ ${preset.cmd}`, type: 'cmd', delay: 100 },
      { text: `[port-kill] [INFO] Initiating port-kill routine...`, type: 'info', delay: 600 }
    ];

    if (preset.verbose) {
      sequence.push({ 
        text: `[port-kill] [DEBUG] Options parsed: ${JSON.stringify({ force: preset.force, verbose: true, dryRun: preset.dryRun, signal: isWin ? undefined : preset.signal }, null, 2)}`, 
        type: 'debug', 
        delay: 1100 
      });
    }

    // Step 2: Query PIDs
    if (isWin) {
      sequence.push({ text: `[port-kill] [DEBUG] Executing Windows system lookup: "netstat -ano"`, type: 'debug', delay: 1500 });
      sequence.push({ text: `[port-kill] [DEBUG] Netstat parser discovered matching ports with target sockets.`, type: 'debug', delay: 1900 });
    } else {
      sequence.push({ text: `[port-kill] [DEBUG] Executing POSIX platform lookup: "lsof -t -n -i :${preset.cmd.match(/\d+/)?.[0] || '3000'}"`, type: 'debug', delay: 1500 });
    }

    // List found PIDs
    sequence.push({ text: `[port-kill] [INFO] Discovered active process tree: PIDs [${activePids.join(', ')}]`, type: 'info', delay: 2400 });

    if (preset.dryRun) {
      sequence.push({ text: `[port-kill] [INFO] [DRY_RUN] Checked active process tree [${activePids.join(', ')}] without executing kill signals.`, type: 'success', delay: 3000 });
      sequence.push({ text: `✓ [Port Audit Complete] Probed PIDs [${activePids.join(', ')}] successfully (Dry mode).`, type: 'success', delay: 3500 });
    } else {
      // Perform Kill Action
      if (isWin) {
        activePids.forEach((pid, index) => {
          sequence.push({ text: `[port-kill] [INFO] Preparing to terminate Windows process ${pid}. Force: ${preset.force}`, type: 'info', delay: 3000 + (index * 400) });
          sequence.push({ text: `[port-kill] [DEBUG] Executing command: "taskkill ${preset.force ? '/F' : ''} /T /PID ${pid}"`, type: 'debug', delay: 3200 + (index * 400) });
          sequence.push({ text: `[port-kill] [INFO] Windows process tree ${pid} terminated with success.`, type: 'info', delay: 3500 + (index * 400) });
        });
      } else {
        const selectedSig = preset.force ? 'SIGKILL' : preset.signal;
        const shellSig = selectedSig.startsWith('SIG') ? selectedSig.slice(3) : selectedSig;
        sequence.push({ text: `[port-kill] [INFO] Preparing to send signal ${selectedSig} to PIDs: [${activePids.join(', ')}]`, type: 'info', delay: 3000 });
        sequence.push({ text: `[port-kill] [DEBUG] Executing command: "kill -${shellSig} ${activePids.join(' ')}"`, type: 'debug', delay: 3300 });
        sequence.push({ text: `[port-kill] [INFO] Processes [${activePids.join(', ')}] terminated via native signal successfully.`, type: 'info', delay: 3600 });
      }

      sequence.push({ text: `✓ [Port Clearance Success] All sockets on targeted port(s) have been successfully released.`, type: 'success', delay: 4100 });
    }

    // Execute the delayed intervals
    sequence.forEach((line) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { text: line.text, type: line.type }]);
        if (line.text.startsWith('✓')) {
          setRunning(false);
        }
      }, line.delay);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Selector Toggles Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2 font-sans">
              <PlayCircle className="w-4 h-4 text-blue-600" />
              Simulate Runtime Execution
            </h3>
            <p className="text-xs text-slate-500 leading-none font-sans">
              Witness how the port-kill library queries, logs, and processes termination on the system.
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            {/* Platform Selection */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedPlatform('unix')}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${selectedPlatform === 'unix' ? 'bg-white font-semibold text-slate-800 shadow-xs border border-slate-200/50' : 'text-slate-500'}`}
              >
                macOS / Linux
              </button>
              <button
                onClick={() => setSelectedPlatform('windows')}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${selectedPlatform === 'windows' ? 'bg-white font-semibold text-slate-800 shadow-xs border border-slate-200/50' : 'text-slate-500'}`}
              >
                Windows (Win32)
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Select Preset Workflow</label>
            <select
              value={selectedPreset}
              disabled={running}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {Object.entries(presets).map(([key, item]) => (
                <option key={key} value={key}>{item.name}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-4 self-end">
            <button
              onClick={runSimulation}
              disabled={running}
              className="w-full bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Mock...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Visual Body */}
      <div className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-900 shadow-2xl flex flex-col h-[400px]">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between bg-gray-950 px-4 py-3 border-b border-gray-900 select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono font-medium text-gray-400 ml-2">port-kill-sandbox-terminal</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <span>platform:</span>
            <span className="text-blue-500 font-semibold">{selectedPlatform === 'unix' ? 'posix-shell' : 'powershell'}</span>
          </div>
        </div>

        {/* Terminal Content Screen */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed space-y-2 select-text text-gray-100">
          {logs.length === 0 && (
            <div className="text-gray-500 h-full flex flex-col items-center justify-center gap-2 select-none">
              <TermIcon className="w-8 h-8 text-gray-700 animate-pulse" />
              <p className="font-semibold text-xs">Ready to roll command diagnostics</p>
              <p className="text-[10px] text-gray-600">Select a preset above and click "Run Simulation" to trace PIDs</p>
            </div>
          )}

          <AnimatePresence>
            {logs.map((log, index) => {
              let colorClass = 'text-gray-200';
              if (log.type === 'cmd') colorClass = 'text-gray-300 font-bold border-b border-gray-900 pb-1 mb-2 block';
              else if (log.type === 'debug') colorClass = 'text-gray-500';
              else if (log.type === 'info') colorClass = 'text-sky-400';
              else if (log.type === 'warn') colorClass = 'text-amber-400';
              else if (log.type === 'error') colorClass = 'text-rose-400';
              else if (log.type === 'success') colorClass = 'text-blue-400 font-semibold';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`whitespace-pre-wrap ${colorClass}`}
                >
                  {log.text}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={terminalEndRef} />
        </div>
      </div>
      
    </div>
  );
}
