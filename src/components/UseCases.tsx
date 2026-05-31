/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { Copy, Check, Layers, TerminalSquare, Braces, AlertCircle } from 'lucide-react';
import { USE_CASES, USE_CASES_CONTENT, UseCaseId } from './constants/useCases.constants';
import QuickStartReference from './QuickStartReference';
import { copyTextWithFallback } from '../utils/clipboard';

export default function UseCases() {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseId>(USE_CASES[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyFailedKey, setCopyFailedKey] = useState<string | null>(null);

  const selectedUseCase = useMemo(
    () => USE_CASES.find((item) => item.id === activeUseCase) ?? USE_CASES[0],
    [activeUseCase]
  );

  const copyContent = async (text: string, key: string) => {
    const success = await copyTextWithFallback(text);
    if (success) {
      setCopyFailedKey(null);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
      return;
    }

    setCopiedKey(null);
    setCopyFailedKey(key);
    setTimeout(() => setCopyFailedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      <QuickStartReference />

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-semibold tracking-tight">
            {USE_CASES_CONTENT.sectionTitle}
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
          {USE_CASES_CONTENT.sectionSubtitle}
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {USE_CASES.map((useCase) => {
            const isActive = activeUseCase === useCase.id;
            return (
              <button
                key={useCase.id}
                onClick={() => setActiveUseCase(useCase.id)}
                aria-pressed={isActive}
                className={`text-xs px-3 py-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {useCase.tabLabel}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 md:p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{selectedUseCase.title}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {selectedUseCase.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-1">
                {USE_CASES_CONTENT.problemLabel}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedUseCase.problem}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-1">
                {USE_CASES_CONTENT.usefulWhenLabel}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {selectedUseCase.usefulWhen}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-900">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <TerminalSquare className="w-3.5 h-3.5 text-blue-400" />
                {USE_CASES_CONTENT.cliBlockTitle}
              </span>
              <button
                onClick={() => copyContent(selectedUseCase.cliExample, `${selectedUseCase.id}-cli`)}
                title={USE_CASES_CONTENT.copyCliTitle}
                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                {copiedKey === `${selectedUseCase.id}-cli` ? (
                  <Check className="w-4 h-4 text-blue-400" />
                ) : copyFailedKey === `${selectedUseCase.id}-cli` ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="text-[12px] text-slate-100 font-mono p-3 overflow-x-auto">
              <code>{selectedUseCase.cliExample}</code>
            </pre>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-900">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
                <Braces className="w-3.5 h-3.5 text-blue-400" />
                {USE_CASES_CONTENT.codeBlockTitle}
              </span>
              <button
                onClick={() =>
                  copyContent(selectedUseCase.codeExample, `${selectedUseCase.id}-code`)
                }
                title={USE_CASES_CONTENT.copyCodeTitle}
                className="text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                {copiedKey === `${selectedUseCase.id}-code` ? (
                  <Check className="w-4 h-4 text-blue-400" />
                ) : copyFailedKey === `${selectedUseCase.id}-code` ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="text-[12px] text-slate-100 font-mono p-3 overflow-x-auto">
              <code>{selectedUseCase.codeExample}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
