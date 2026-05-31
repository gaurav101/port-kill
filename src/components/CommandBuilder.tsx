/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Terminal, Cpu, Lightbulb, Sliders, Code2, AlertCircle } from 'lucide-react';
import {
  COMMAND_BUILDER_CONTENT,
  COMMAND_BUILDER_DEFAULTS,
  COMMAND_BUILDER_FLAGS,
  COMMAND_BUILDER_OS_SUMMARIES,
  COMMAND_BUILDER_SIGNALS,
  COMMAND_BUILDER_SNIPPETS,
  COMMAND_BUILDER_VALUES,
} from './constants/commandBuilder.constants';
import terminalDemoVideo from '../../assets/terminal-demo.mp4';
import { copyTextWithFallback } from '../utils/clipboard';
import { resolveEffectiveSignal, shouldIncludeSignalFlag } from './utils/commandBuilder.utils';

export default function CommandBuilder() {
  const [portInputs, setPortInputs] = useState<string>(COMMAND_BUILDER_DEFAULTS.portInput);
  const [isSync, setIsSync] = useState<boolean>(false);
  const [force, setForce] = useState<boolean>(true);
  const [verbose, setVerbose] = useState<boolean>(false);
  const [dryRun, setDryRun] = useState<boolean>(false);
  const [signal, setSignal] = useState<string>(COMMAND_BUILDER_DEFAULTS.defaultSignal);
  const [hasCustomLogger, setHasCustomLogger] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copyFailedSection, setCopyFailedSection] = useState<string | null>(null);

  const parsedPorts = portInputs
    .split(/[\s,]+/)
    .map((part) => parseInt(part.trim(), 10))
    .filter(
      (port) =>
        !isNaN(port) &&
        port >= COMMAND_BUILDER_DEFAULTS.portMin &&
        port < COMMAND_BUILDER_DEFAULTS.portMaxExclusive
    );

  const displayPorts =
    parsedPorts.length > 0 ? parsedPorts : [COMMAND_BUILDER_DEFAULTS.fallbackPort];

  const triggerCopy = async (text: string, sectionId: string) => {
    const success = await copyTextWithFallback(text);
    if (success) {
      setCopyFailedSection(null);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), COMMAND_BUILDER_DEFAULTS.copyTimeoutMs);
      return;
    }

    setCopiedSection(null);
    setCopyFailedSection(sectionId);
    setTimeout(() => setCopyFailedSection(null), COMMAND_BUILDER_DEFAULTS.copyTimeoutMs);
  };

  const generateCliCommand = () => {
    const portsStr = displayPorts.join(' ');
    const effectiveSignal = resolveEffectiveSignal(force, signal, {
      defaultSignal: COMMAND_BUILDER_DEFAULTS.defaultSignal,
      gracefulSignal: COMMAND_BUILDER_DEFAULTS.gracefulSignal,
    });
    let flags = '';
    if (verbose) flags += ` ${COMMAND_BUILDER_FLAGS.verbose}`;
    if (!force) flags += ` ${COMMAND_BUILDER_FLAGS.noForce}`;
    if (dryRun) flags += ` ${COMMAND_BUILDER_FLAGS.dryRun}`;

    if (
      shouldIncludeSignalFlag(force, effectiveSignal, {
        defaultSignal: COMMAND_BUILDER_DEFAULTS.defaultSignal,
        gracefulSignal: COMMAND_BUILDER_DEFAULTS.gracefulSignal,
      })
    ) {
      flags += ` ${COMMAND_BUILDER_FLAGS.signal} ${effectiveSignal}`;
    }

    return `${COMMAND_BUILDER_VALUES.cliCommand} ${portsStr}${flags}`;
  };

  const generateProgrammaticCode = () => {
    const portsParam =
      displayPorts.length === 1 ? String(displayPorts[0]) : `[${displayPorts.join(', ')}]`;

    const optionsObj: string[] = [];
    const effectiveSignal = resolveEffectiveSignal(force, signal, {
      defaultSignal: COMMAND_BUILDER_DEFAULTS.defaultSignal,
      gracefulSignal: COMMAND_BUILDER_DEFAULTS.gracefulSignal,
    });

    if (!force) optionsObj.push(COMMAND_BUILDER_VALUES.optionForceFalse);
    if (
      shouldIncludeSignalFlag(force, effectiveSignal, {
        defaultSignal: COMMAND_BUILDER_DEFAULTS.defaultSignal,
        gracefulSignal: COMMAND_BUILDER_DEFAULTS.gracefulSignal,
      })
    ) {
      optionsObj.push(`  signal: '${effectiveSignal}'`);
    }
    if (verbose) optionsObj.push(COMMAND_BUILDER_VALUES.optionVerboseTrue);
    if (dryRun) optionsObj.push(COMMAND_BUILDER_VALUES.optionDryRunTrue);
    if (hasCustomLogger) optionsObj.push(COMMAND_BUILDER_SNIPPETS.customLoggerOption);

    const optionsStr = optionsObj.length > 0 ? `,\n  {\n${optionsObj.join(',\n')}\n  }` : '';

    if (isSync) {
      return COMMAND_BUILDER_SNIPPETS.syncTemplate(portsParam, optionsStr);
    }

    return COMMAND_BUILDER_SNIPPETS.asyncTemplate(portsParam, optionsStr);
  };

  const getOsCommandInfo = () => {
    const targetPort = displayPorts[0];
    const killSigFlag = resolveEffectiveSignal(force, signal, {
      defaultSignal: COMMAND_BUILDER_DEFAULTS.defaultSignal,
      gracefulSignal: COMMAND_BUILDER_DEFAULTS.gracefulSignal,
    });
    const shellSignal = killSigFlag.startsWith(COMMAND_BUILDER_VALUES.posixSignalPrefix)
      ? killSigFlag.slice(COMMAND_BUILDER_VALUES.posixSignalPrefix.length)
      : killSigFlag;

    return {
      macos: {
        find: `lsof -t -n -i :${targetPort}`,
        kill: `kill -${shellSignal} <PIDs>`,
        summary: COMMAND_BUILDER_OS_SUMMARIES.macos,
      },
      linux: {
        find: `lsof -t -n -i :${targetPort} || fuser ${targetPort}/${COMMAND_BUILDER_VALUES.tcpProtocol}`,
        kill: `kill -${shellSignal} <PIDs>`,
        summary: COMMAND_BUILDER_OS_SUMMARIES.linux,
      },
      windows: {
        find: `netstat -ano (filter for :${targetPort})`,
        kill: `taskkill ${force ? '/F' : ''} /T /PID <PID>`,
        summary: COMMAND_BUILDER_OS_SUMMARIES.windows,
      },
    };
  };

  const osDetails = getOsCommandInfo();
  const cliCommand = generateCliCommand();
  const programmaticCode = generateProgrammaticCode();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900 tracking-tight text-base font-sans">
              {COMMAND_BUILDER_CONTENT.interactiveBuilder}
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                {COMMAND_BUILDER_CONTENT.targetPorts}
              </label>
              <span className="text-xs text-mono text-gray-400 font-medium">
                {COMMAND_BUILDER_CONTENT.separatorHint}
              </span>
            </div>
            <input
              type="text"
              value={portInputs}
              onChange={(event) => setPortInputs(event.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm font-mono px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
              placeholder={COMMAND_BUILDER_CONTENT.portPlaceholder}
            />
            {parsedPorts.length === 0 && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {COMMAND_BUILDER_CONTENT.invalidPorts}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {COMMAND_BUILDER_CONTENT.apiExecutionHook}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-lg">
              <button
                onClick={() => setIsSync(false)}
                className={`text-xs font-medium py-1.5 rounded transition-all cursor-pointer ${
                  !isSync
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {COMMAND_BUILDER_CONTENT.asyncLabel}
              </button>
              <button
                onClick={() => setIsSync(true)}
                className={`text-xs font-medium py-1.5 rounded transition-all cursor-pointer ${
                  isSync
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {COMMAND_BUILDER_CONTENT.syncLabel}
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {COMMAND_BUILDER_CONTENT.killStrategyOptions}
              </span>
            </div>

            <div className="cb-kill-strategy space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="cb-kill-title text-xs font-semibold text-slate-800">
                    {COMMAND_BUILDER_CONTENT.aggressiveForceKill}
                  </p>
                  <p className="cb-kill-desc text-[11px] text-slate-400">
                    {COMMAND_BUILDER_CONTENT.aggressiveForceDesc}
                  </p>
                </div>
                <button
                  onClick={() => setForce(!force)}
                  role="switch"
                  aria-checked={force}
                  aria-label={COMMAND_BUILDER_CONTENT.aggressiveForceKill}
                  className={`cb-kill-toggle relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    force ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      force ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="cb-kill-title text-xs font-semibold text-slate-800">
                    {COMMAND_BUILDER_CONTENT.safeDryRun}
                  </p>
                  <p className="cb-kill-desc text-[11px] text-slate-400">
                    {COMMAND_BUILDER_CONTENT.safeDryRunDesc}
                  </p>
                </div>
                <button
                  onClick={() => setDryRun(!dryRun)}
                  role="switch"
                  aria-checked={dryRun}
                  aria-label={COMMAND_BUILDER_CONTENT.safeDryRun}
                  className={`cb-kill-toggle relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dryRun ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      dryRun ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="cb-kill-title text-xs font-semibold text-slate-800">
                    {COMMAND_BUILDER_CONTENT.verboseLogs}
                  </p>
                  <p className="cb-kill-desc text-[11px] text-slate-400">
                    {COMMAND_BUILDER_CONTENT.verboseLogsDesc}
                  </p>
                </div>
                <button
                  onClick={() => setVerbose(!verbose)}
                  role="switch"
                  aria-checked={verbose}
                  aria-label={COMMAND_BUILDER_CONTENT.verboseLogs}
                  className={`cb-kill-toggle relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    verbose ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      verbose ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="cb-kill-title text-xs font-semibold text-slate-800">
                    {COMMAND_BUILDER_CONTENT.customLogCallback}
                  </p>
                  <p className="cb-kill-desc text-[11px] text-slate-400">
                    {COMMAND_BUILDER_CONTENT.customLogDesc}
                  </p>
                </div>
                <button
                  onClick={() => setHasCustomLogger(!hasCustomLogger)}
                  role="switch"
                  aria-checked={hasCustomLogger}
                  aria-label={COMMAND_BUILDER_CONTENT.customLogCallback}
                  className={`cb-kill-toggle relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hasCustomLogger ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      hasCustomLogger ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 flex items-center justify-between">
              <span>{COMMAND_BUILDER_CONTENT.signalOverride}</span>
              <span className="text-[10px] text-amber-600 font-mono">
                {COMMAND_BUILDER_CONTENT.signalIgnoredWindows}
              </span>
            </label>
            <select
              value={signal}
              onChange={(event) => setSignal(event.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-sans"
            >
              {COMMAND_BUILDER_SIGNALS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-900">
              {COMMAND_BUILDER_CONTENT.testingTipTitle}
            </p>
            <p className="text-[11px] text-amber-700 leading-normal">
              {COMMAND_BUILDER_CONTENT.testingTipBody}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              {COMMAND_BUILDER_CONTENT.demoTitle}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {COMMAND_BUILDER_CONTENT.demoNote}
            </p>
          </div>
          <video
            className="w-full rounded-lg border border-slate-200 bg-black"
            src={terminalDemoVideo}
            controls
            muted
            playsInline
            preload="metadata"
          />
        </section>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900 shadow-lg rounded-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between bg-slate-950 px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                {COMMAND_BUILDER_CONTENT.generatedCli}
              </span>
            </div>
            <button
              onClick={() => triggerCopy(cliCommand, COMMAND_BUILDER_VALUES.sectionCli)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={COMMAND_BUILDER_CONTENT.copyShellTitle}
            >
              <AnimatePresence mode="wait">
                {copiedSection === COMMAND_BUILDER_VALUES.sectionCli ? (
                  <motion.span
                    key="checked"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" /> {COMMAND_BUILDER_CONTENT.copied}
                  </motion.span>
                ) : copyFailedSection === COMMAND_BUILDER_VALUES.sectionCli ? (
                  <motion.span
                    key="copy-failed"
                    className="flex items-center gap-1 text-[11px] text-rose-400 font-mono"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Copy failed
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" /> {COMMAND_BUILDER_CONTENT.copy}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className="bg-slate-900 h-[74px]">
            <Editor
              value={cliCommand}
              language="shell"
              theme="vs-dark"
              loading={null}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                automaticLayout: true,
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                contextmenu: false,
                glyphMargin: false,
                folding: false,
                fontFamily:
                  'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 12,
                lineHeight: 20,
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>
        </div>

        <div className="bg-slate-950 shadow-lg rounded-2xl overflow-hidden border border-slate-900">
          <div className="flex items-center justify-between bg-slate-950/80 px-4 py-3 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                {COMMAND_BUILDER_CONTENT.integrationTitle}
              </span>
            </div>
            <button
              onClick={() => triggerCopy(programmaticCode, COMMAND_BUILDER_VALUES.sectionCode)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={COMMAND_BUILDER_CONTENT.copyCodeTitle}
            >
              <AnimatePresence mode="wait">
                {copiedSection === COMMAND_BUILDER_VALUES.sectionCode ? (
                  <motion.span
                    key="checked"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5" /> {COMMAND_BUILDER_CONTENT.copied}
                  </motion.span>
                ) : copyFailedSection === COMMAND_BUILDER_VALUES.sectionCode ? (
                  <motion.span
                    key="copy-failed"
                    className="flex items-center gap-1 text-[11px] text-rose-400 font-mono"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Copy failed
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" /> {COMMAND_BUILDER_CONTENT.copy}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className="bg-slate-950/95 h-[280px]">
            <Editor
              value={programmaticCode}
              language="typescript"
              theme="vs-dark"
              loading={null}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                automaticLayout: true,
                renderLineHighlight: 'line',
                lineNumbersMinChars: 3,
                overviewRulerBorder: false,
                contextmenu: false,
                glyphMargin: false,
                folding: true,
                guides: {
                  indentation: true,
                },
                fontFamily:
                  'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 11,
                lineHeight: 18,
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-900 text-sm tracking-tight font-sans">
              {COMMAND_BUILDER_CONTENT.underTheHoodTitle}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-normal">
            {COMMAND_BUILDER_CONTENT.underTheHoodBody}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {COMMAND_BUILDER_CONTENT.macosLabel}
                  </span>
                  <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100 font-mono font-medium">
                    {COMMAND_BUILDER_CONTENT.posixBadge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.macos.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="cb-native-label text-gray-400 font-semibold">
                  {COMMAND_BUILDER_CONTENT.findLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.macos.find}
                >
                  {osDetails.macos.find}
                </div>
                <div className="cb-native-label text-gray-400 font-semibold mt-1">
                  {COMMAND_BUILDER_CONTENT.killLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.macos.kill}
                >
                  {osDetails.macos.kill}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {COMMAND_BUILDER_CONTENT.linuxLabel}
                  </span>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-mono font-medium">
                    {COMMAND_BUILDER_CONTENT.posixBadge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.linux.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="cb-native-label text-gray-400 font-semibold">
                  {COMMAND_BUILDER_CONTENT.findLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.linux.find}
                >
                  {osDetails.linux.find}
                </div>
                <div className="cb-native-label text-gray-400 font-semibold mt-1">
                  {COMMAND_BUILDER_CONTENT.killLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.linux.kill}
                >
                  {osDetails.linux.kill}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    {COMMAND_BUILDER_CONTENT.windowsLabel}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-mono font-medium">
                    {COMMAND_BUILDER_CONTENT.windowsBadge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {osDetails.windows.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/50 font-mono text-[10px] space-y-1">
                <div className="cb-native-label text-gray-400 font-semibold">
                  {COMMAND_BUILDER_CONTENT.findLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.windows.find}
                >
                  {osDetails.windows.find}
                </div>
                <div className="cb-native-label text-gray-400 font-semibold mt-1">
                  {COMMAND_BUILDER_CONTENT.killLabel}
                </div>
                <div
                  className="cb-native-command text-gray-800 bg-gray-200/40 p-1.5 rounded truncate"
                  title={osDetails.windows.kill}
                >
                  {osDetails.windows.kill}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
