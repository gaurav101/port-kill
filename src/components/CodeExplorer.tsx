/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@monaco-editor/react';
import { LIBRARY_FILES } from '../data/mockFiles';
import { FileCode, Copy, Check, Info, FileJson, Layers, Activity, AlertCircle } from 'lucide-react';
import { CODE_EXPLORER_CONSTANTS } from './constants/codeExplorer.constants';
import { copyTextWithFallback } from '../utils/clipboard';

function normalizeEditorLanguage(language: string): string {
  if (language === 'typescript') return 'typescript';
  if (language === 'json') return 'json';
  return 'plaintext';
}

export default function CodeExplorer() {
  const [activeFileIdx, setActiveFileIdx] = useState<number>(
    CODE_EXPLORER_CONSTANTS.defaultActiveFileIndex
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [copyFailed, setCopyFailed] = useState<boolean>(false);

  const activeFile =
    LIBRARY_FILES[activeFileIdx] || LIBRARY_FILES[CODE_EXPLORER_CONSTANTS.defaultActiveFileIndex];

  const handleCopy = async () => {
    const success = await copyTextWithFallback(activeFile.content);
    if (success) {
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), CODE_EXPLORER_CONSTANTS.copyTimeoutMs);
      return;
    }

    setCopied(false);
    setCopyFailed(true);
    setTimeout(() => setCopyFailed(false), CODE_EXPLORER_CONSTANTS.copyTimeoutMs);
  };

  // Helper to choose file extension avatar icons
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(CODE_EXPLORER_CONSTANTS.jsonExtension)) {
      return <FileJson className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-blue-500 shrink-0" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch min-h-[500px]">
      {/* LEFT: File Selector Rail */}
      <div className="order-2 lg:order-1 ce-file-rail lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm tracking-tight font-sans">
              {CODE_EXPLORER_CONSTANTS.workspaceTitle}
            </h3>
          </div>

          <p className="text-xs text-gray-400 leading-normal">
            {CODE_EXPLORER_CONSTANTS.workspaceDescription}
          </p>

          <div className="space-y-1.5 overflow-y-auto max-h-[240px] sm:max-h-[320px] lg:max-h-[380px] pr-1">
            {LIBRARY_FILES.map((file, idx) => {
              const isActive = activeFileIdx === idx;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setActiveFileIdx(idx);
                    setCopied(false);
                    setCopyFailed(false);
                  }}
                  className={`ce-file-button w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${isActive ? 'ce-file-button-active bg-blue-50/40 border-blue-200 text-slate-900 font-semibold' : 'ce-file-button-inactive bg-slate-50/60 hover:bg-slate-100/60 border-transparent text-slate-600'}`}
                >
                  <div className="mt-0.5">{getFileIcon(file.name)}</div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-mono truncate">{file.name}</p>
                    <p className="ce-file-desc text-[10px] text-gray-400 truncate leading-tight">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Maintainability Specs Block */}
        <div className="ce-metrics bg-blue-50/30 rounded-xl p-4 border border-blue-100/50 space-y-2.5 mt-4 lg:mt-0 font-sans">
          <div className="ce-metrics-title flex items-center gap-1.5 text-xs font-semibold text-blue-800 leading-snug">
            <Activity className="w-3.5 h-3.5" />
            <span>{CODE_EXPLORER_CONSTANTS.metricsTitle}</span>
          </div>
          <div className="ce-metrics-items grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] sm:text-[10px] text-blue-700 font-mono leading-relaxed">
            <div className="break-words">{CODE_EXPLORER_CONSTANTS.metricZeroDeps}</div>
            <div className="break-words">{CODE_EXPLORER_CONSTANTS.metricCoreLines}</div>
            <div className="break-words">{CODE_EXPLORER_CONSTANTS.metricPosix}</div>
            <div className="break-words">{CODE_EXPLORER_CONSTANTS.metricWindows}</div>
          </div>
        </div>
      </div>

      {/* RIGHT: High Fidelity Code Editor Viewer */}
      <div className="order-1 lg:order-2 lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-xl flex flex-col min-h-[360px] sm:min-h-[440px]">
        {/* Editor Tab Header */}
        <div className="flex items-center justify-between bg-slate-950 px-5 py-3 border-b border-slate-900 select-none">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <div className="font-mono text-xs text-slate-300">{activeFile.path}</div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">
              {activeFile.language}
            </span>
          </div>

          {/* Copy action */}
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={CODE_EXPLORER_CONSTANTS.copyButtonTitle}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="checked"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold"
                >
                  <Check className="w-3.5 h-3.5" /> {CODE_EXPLORER_CONSTANTS.copiedLabel}
                </motion.span>
              ) : copyFailed ? (
                <motion.span
                  key="copy-failed"
                  className="flex items-center gap-1 text-[11px] text-rose-400 font-mono"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Copy Failed
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  className="flex items-center gap-1 text-[11px] text-slate-400 font-mono hover:text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" /> {CODE_EXPLORER_CONSTANTS.copyLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Code Content Box */}
        <div className="bg-slate-950/98 h-[240px] sm:h-[320px] lg:h-auto lg:flex-1 lg:min-h-0">
          <Editor
            path={activeFile.path}
            value={activeFile.content || CODE_EXPLORER_CONSTANTS.emptyCodeLine}
            language={normalizeEditorLanguage(activeFile.language)}
            theme="vs-dark"
            loading={null}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'off',
              automaticLayout: true,
              fontFamily:
                'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 11,
              lineHeight: 18,
              tabSize: 2,
              renderLineHighlight: 'all',
              lineNumbersMinChars: 3,
              padding: { top: 14, bottom: 14 },
              contextmenu: false,
              overviewRulerBorder: false,
              folding: true,
              glyphMargin: false,
              guides: {
                indentation: true,
              },
            }}
          />
        </div>

        {/* Code File Description footer */}
        <div className="bg-slate-950/90 border-t border-slate-900 px-5 py-3.5 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            <span className="font-semibold text-slate-300">
              {CODE_EXPLORER_CONSTANTS.filePurposePrefix}
            </span>{' '}
            {activeFile.description}
          </p>
        </div>
      </div>
    </div>
  );
}
