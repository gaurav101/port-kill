/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, PlayCircle, RefreshCw, Terminal as TermIcon } from 'lucide-react';
import {
  TERMINAL_CONSTANTS,
  TERMINAL_CONTENT,
  TERMINAL_KEYS,
  TERMINAL_LOG_MESSAGES,
  TERMINAL_PRESETS,
  TerminalLogType,
  TerminalPlatform,
} from './constants/terminalPlayground.constants';
import { getTerminalLogColorClass } from './utils/terminalPlayground.utils';

interface LogLine {
  text: string;
  type: TerminalLogType;
}

export default function TerminalPlayground() {
  const [selectedPreset, setSelectedPreset] = useState<string>(TERMINAL_CONSTANTS.defaultPreset);
  const [selectedPlatform, setSelectedPlatform] = useState<TerminalPlatform>(
    TERMINAL_CONSTANTS.defaultPlatform
  );
  const [running, setRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalPanelRef = useRef<HTMLDivElement>(null);
  const terminalViewportRef = useRef<HTMLDivElement>(null);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSimulationTimers = () => {
    timerIdsRef.current.forEach((timerId) => clearTimeout(timerId));
    timerIdsRef.current = [];
  };

  useEffect(() => {
    if (terminalViewportRef.current) {
      terminalViewportRef.current.scrollTo({
        top: terminalViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);

  useEffect(
    () => () => {
      clearSimulationTimers();
    },
    []
  );

  const runSimulation = () => {
    if (running) return;

    terminalPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    clearSimulationTimers();

    setRunning(true);
    setLogs([]);

    const preset = TERMINAL_PRESETS[selectedPreset];
    const isWindows = selectedPlatform === TERMINAL_KEYS.WINDOWS;
    const activePids = preset.pids;
    const targetPort = preset.ports[0] ?? Number(TERMINAL_CONSTANTS.fallbackLookupPort);

    const sequence: Array<{ text: string; type: TerminalLogType; delay: number }> = [
      {
        text: `${TERMINAL_CONTENT.commandPrefix}${preset.cmd}`,
        type: TERMINAL_KEYS.LOG_CMD,
        delay: TERMINAL_CONSTANTS.copyRuntimeDelayStartMs,
      },
      {
        text: TERMINAL_LOG_MESSAGES.initiating(targetPort),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.infoDelayStartMs,
      },
    ];

    if (preset.verbose) {
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.targetingPorts(preset.ports),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.debugDelayOptionsMs,
      });
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.optionsConfigured(
          JSON.stringify(
            {
              force: preset.force,
              verbose: true,
              dryRun: preset.dryRun,
              signal: isWindows ? undefined : preset.signal,
            },
            null,
            2
          )
        ),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.debugDelayOptionsMs + 220,
      });
    }

    if (preset.verbose && isWindows) {
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.commandRun('netstat -ano'),
        type: TERMINAL_KEYS.LOG_DEBUG,
        delay: TERMINAL_CONSTANTS.debugDelayLookupMs,
      });
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.netstatFound(targetPort, activePids),
        type: TERMINAL_KEYS.LOG_DEBUG,
        delay: TERMINAL_CONSTANTS.debugDelayLookupResultMs,
      });
    } else if (preset.verbose) {
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.commandRun(`lsof -t -n -i :${targetPort}`),
        type: TERMINAL_KEYS.LOG_DEBUG,
        delay: TERMINAL_CONSTANTS.debugDelayLookupMs,
      });
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.lsofFound(targetPort, activePids),
        type: TERMINAL_KEYS.LOG_DEBUG,
        delay: TERMINAL_CONSTANTS.debugDelayLookupResultMs,
      });
    }

    sequence.push({
      text: TERMINAL_LOG_MESSAGES.discoveredPids(targetPort, activePids),
      type: TERMINAL_KEYS.LOG_INFO,
      delay: TERMINAL_CONSTANTS.discoveredPidDelayMs,
    });

    if (preset.dryRun) {
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.dryRun(targetPort, activePids),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.dryRunCheckedDelayMs,
      });
    } else if (isWindows) {
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.prepareWindows(preset.force, activePids),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.killStartDelayMs,
      });
      activePids.forEach((pid, index) => {
        const stepOffset = index * TERMINAL_CONSTANTS.killWindowsDelayStepMs;
        if (preset.verbose) {
          sequence.push({
            text: TERMINAL_LOG_MESSAGES.commandRun(
              `taskkill ${preset.force ? '/F ' : ''}/T /PID ${pid}`.trim()
            ),
            type: TERMINAL_KEYS.LOG_DEBUG,
            delay: TERMINAL_CONSTANTS.killDebugDelayMs + stepOffset,
          });
        }
        sequence.push({
          text: TERMINAL_LOG_MESSAGES.windowsTerminated(pid),
          type: TERMINAL_KEYS.LOG_INFO,
          delay: TERMINAL_CONSTANTS.killSuccessDelayMs + stepOffset,
        });
      });
    } else {
      const selectedSignal = preset.force ? TERMINAL_CONSTANTS.defaultForceSignal : preset.signal;
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.prepareUnix(selectedSignal, activePids),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.killStartDelayMs,
      });
      if (preset.verbose) {
        sequence.push({
          text: TERMINAL_LOG_MESSAGES.commandRun(`kill -${selectedSignal} ${activePids.join(' ')}`),
          type: TERMINAL_KEYS.LOG_DEBUG,
          delay: TERMINAL_CONSTANTS.killDebugDelayMs,
        });
      }
      sequence.push({
        text: TERMINAL_LOG_MESSAGES.unixTerminated(activePids),
        type: TERMINAL_KEYS.LOG_INFO,
        delay: TERMINAL_CONSTANTS.killSuccessDelayMs,
      });
    }

    sequence.push({
      text: TERMINAL_LOG_MESSAGES.finalKilled(targetPort, activePids),
      type: TERMINAL_KEYS.LOG_SUCCESS,
      delay: preset.dryRun
        ? TERMINAL_CONSTANTS.dryRunCompleteDelayMs
        : TERMINAL_CONSTANTS.finalSuccessDelayMs,
    });

    sequence.forEach((line) => {
      const timerId = setTimeout(() => {
        setLogs((prev) => [...prev, { text: line.text, type: line.type }]);
        if (line.text.startsWith(TERMINAL_CONTENT.successPrefix)) {
          setRunning(false);
        }
      }, line.delay);
      timerIdsRef.current.push(timerId);
    });
  };

  const activePreset = TERMINAL_PRESETS[selectedPreset];
  const activeMode = activePreset.dryRun
    ? TERMINAL_CONTENT.modeDryRun
    : TERMINAL_CONTENT.modeTerminate;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 md:col-span-5">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2 font-sans">
            <PlayCircle className="w-4 h-4 text-blue-600" />
            {TERMINAL_CONTENT.simulateExecution}
          </h3>
          <p className="text-xs text-slate-500 leading-none font-sans">
            {TERMINAL_CONTENT.simulateDescription}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">
              {TERMINAL_CONTENT.selectPresetLabel}
            </label>
            <select
              value={selectedPreset}
              disabled={running}
              onChange={(event) => setSelectedPreset(event.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {Object.entries(TERMINAL_PRESETS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">
              {TERMINAL_CONTENT.targetPlatformLabel}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedPlatform(TERMINAL_KEYS.UNIX)}
                className={`text-xs px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                  selectedPlatform === TERMINAL_KEYS.UNIX
                    ? 'bg-white font-semibold text-slate-800 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {TERMINAL_CONTENT.unixLabel}
              </button>
              <button
                onClick={() => setSelectedPlatform(TERMINAL_KEYS.WINDOWS)}
                className={`text-xs px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                  selectedPlatform === TERMINAL_KEYS.WINDOWS
                    ? 'bg-white font-semibold text-slate-800 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {TERMINAL_CONTENT.windowsLabel}
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={runSimulation}
              disabled={running}
              className="w-full bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{TERMINAL_CONTENT.runningLabel}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{TERMINAL_CONTENT.runLabel}</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <p className="text-[11px] font-semibold text-slate-700 font-sans">
              {TERMINAL_CONTENT.configSummaryTitle}
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
              <p>
                <span className="text-slate-500">{TERMINAL_CONTENT.configSummaryCommand}: </span>
                <span className="text-slate-800">{activePreset.cmd}</span>
              </p>
              <p>
                <span className="text-slate-500">{TERMINAL_CONTENT.configSummaryPids}: </span>
                <span className="text-slate-800">[{activePreset.pids.join(', ')}]</span>
              </p>
              <p>
                <span className="text-slate-500">{TERMINAL_CONTENT.configSummaryMode}: </span>
                <span className="text-slate-800">{activeMode}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={terminalPanelRef}
        className="bg-gray-950 rounded-2xl overflow-hidden border border-gray-900 shadow-2xl flex flex-col h-[400px] md:col-span-7"
      >
        <div className="flex items-center justify-between bg-gray-950 px-4 py-3 border-b border-gray-900 select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono font-medium text-gray-400 ml-2">
              {TERMINAL_CONTENT.terminalTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <span>{TERMINAL_CONTENT.platformLabel}</span>
            <span className="text-blue-500 font-semibold">
              {selectedPlatform === TERMINAL_KEYS.UNIX
                ? TERMINAL_CONTENT.posixShell
                : TERMINAL_CONTENT.powershell}
            </span>
          </div>
        </div>

        <div
          ref={terminalViewportRef}
          className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed space-y-2 select-text text-gray-100"
        >
          {logs.length === 0 && (
            <div className="text-gray-500 h-full flex flex-col items-center justify-center gap-2 select-none">
              <TermIcon className="w-8 h-8 text-gray-700 animate-pulse" />
              <p className="font-semibold text-xs">{TERMINAL_CONTENT.emptyReadyTitle}</p>
              <p className="text-[10px] text-gray-600">{TERMINAL_CONTENT.emptyReadyDescription}</p>
            </div>
          )}

          <AnimatePresence>
            {logs.map((log, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`whitespace-pre-wrap ${getTerminalLogColorClass(log.type)}`}
                >
                  {log.text}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
