/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  HeartHandshake,
  GitPullRequest,
  BookOpen,
  Key,
  Check,
  Copy,
  Flame,
  AlertCircle,
} from 'lucide-react';
import {
  README_VIEWER_API_ROWS,
  README_VIEWER_API_SIGNATURE_SNIPPET,
  README_VIEWER_ARCHITECTURE_SNIPPET,
  README_VIEWER_BADGES,
  README_VIEWER_CHAINING_WARNING,
  README_VIEWER_CLI_EXAMPLES,
  README_VIEWER_CLI_FLAG_ROWS,
  README_VIEWER_COMPATIBILITY_ROWS,
  README_VIEWER_CONSTANTS,
  README_VIEWER_ERROR_BEHAVIOR_NOTES,
  README_VIEWER_FEATURES,
  README_VIEWER_PERMISSION_NOTES,
  README_VIEWER_SECURITY_NOTES,
  README_VIEWER_INSTALL_SNIPPETS,
  README_VIEWER_TEST_SNIPPET,
} from './constants/readmeViewer.constants';
import { copyTextWithFallback } from '../utils/clipboard';

export default function ReadmeViewer() {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState<string | null>(null);

  const copySnippet = async (text: string, id: string) => {
    const success = await copyTextWithFallback(text);
    if (success) {
      setCopyFailed(null);
      setCopied(id);
      setTimeout(() => setCopied(null), README_VIEWER_CONSTANTS.copiedTimeoutMs);
      return;
    }

    setCopied(null);
    setCopyFailed(id);
    setTimeout(() => setCopyFailed(null), README_VIEWER_CONSTANTS.copiedTimeoutMs);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-slate-100 pb-6 space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {README_VIEWER_CONSTANTS.packageName}
        </h2>

        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-semibold text-white">
          {README_VIEWER_BADGES.map((badge) => (
            <span key={badge.label} className="inline-flex rounded overflow-hidden">
              <span className={`${badge.labelClass} px-2.5 py-1`}>{badge.label}</span>
              <span className={`${badge.valueClass} px-2.5 py-1`}>{badge.value}</span>
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed font-sans max-w-2xl">
          {README_VIEWER_CONSTANTS.description}
        </p>
      </div>

      <div className="space-y-4 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.keyAdvantagesTitle}
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          {README_VIEWER_FEATURES.map((item) => (
            <li
              key={item.title}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-2.5"
            >
              <span className="text-blue-500 mt-0.5 font-bold">
                {README_VIEWER_CONSTANTS.featureCheck}
              </span>
              <div>
                <span className="font-semibold text-slate-800 block">{item.title}</span>
                {item.description}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.compatibilityTitle}
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50 font-semibold text-slate-700 text-left">
              <tr>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderEnvironment}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderSupport}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderNotes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
              {README_VIEWER_COMPATIBILITY_ROWS.map((row) => (
                <tr key={row.environment}>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{row.environment}</td>
                  <td className="px-4 py-2.5 text-blue-700 font-mono">{row.support}</td>
                  <td className="px-4 py-2.5 leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1">
          {README_VIEWER_PERMISSION_NOTES.map((note) => (
            <p key={note} className="text-xs text-slate-600 leading-relaxed">
              {README_VIEWER_CONSTANTS.featureCheck} {note}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.intendedUsageTitle}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {README_VIEWER_CONSTANTS.intendedUsageBody}
        </p>
      </div>

      <div className="space-y-3 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.installationTitle}
        </h3>

        <div className="space-y-3.5">
          {README_VIEWER_INSTALL_SNIPPETS.map((snippet) => (
            <div key={snippet.id} className="space-y-1">
              <p className="text-xs text-slate-500">{snippet.hint}</p>
              <div className="flex bg-slate-50 rounded-lg p-2.5 border border-slate-200 items-center justify-between font-mono text-xs text-slate-800">
                <code>{snippet.command}</code>
                <button
                  onClick={() => copySnippet(snippet.command, snippet.id)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {copied === snippet.id ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : copyFailed === snippet.id ? (
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

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.directCliTitle}
        </h3>

        <p className="text-xs text-slate-500">{README_VIEWER_CONSTANTS.cliHint}</p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs text-sky-200 space-y-3.5">
          {README_VIEWER_CLI_EXAMPLES.map((item) => (
            <div key={item.command}>
              <span className="text-gray-500 block">{item.description}</span>
              <span>{item.command}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.cliFlagsTitle}
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50 font-semibold text-slate-700 text-left">
              <tr>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderFlag}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderAlias}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderType}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderDefault}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderDescription}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
              {README_VIEWER_CLI_FLAG_ROWS.map((row) => (
                <tr key={row.flag}>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{row.flag}</td>
                  <td className="px-4 py-2.5 font-mono text-blue-700">{row.alias}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">{row.type}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{row.defaultValue}</td>
                  <td className="px-4 py-2.5 leading-relaxed">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.apiSignatureTitle}
        </h3>
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
          {README_VIEWER_API_SIGNATURE_SNIPPET}
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.errorBehaviorTitle}
        </h3>
        <div className="space-y-2">
          {README_VIEWER_ERROR_BEHAVIOR_NOTES.map((item) => (
            <p key={item} className="text-xs text-slate-600 leading-relaxed">
              {README_VIEWER_CONSTANTS.featureCheck} {item}
            </p>
          ))}
        </div>
        <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
          {README_VIEWER_CHAINING_WARNING}
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.securityNotesTitle}
        </h3>
        <div className="space-y-2">
          {README_VIEWER_SECURITY_NOTES.map((item) => (
            <div
              key={item.title}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed"
            >
              <span className="font-semibold text-slate-800">{item.title}: </span>
              <span className="text-slate-600">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.testingTitle}
        </h3>
        <p className="text-xs text-slate-500">{README_VIEWER_CONSTANTS.testHint}</p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
          {README_VIEWER_TEST_SNIPPET}
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.apiOptionsTitle}
        </h3>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-xs">
          <table className="min-w-full divide-y divide-slate-150">
            <thead className="bg-slate-50 font-semibold text-slate-700 text-left">
              <tr>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderOption}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderType}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderDefault}</th>
                <th className="px-4 py-2.5">{README_VIEWER_CONSTANTS.tableHeaderDescription}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 bg-white font-mono">
              {README_VIEWER_API_ROWS.map((row) => (
                <tr key={row.option}>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.option}</td>
                  <td className="px-4 py-2.5 text-blue-600">{row.type}</td>
                  <td className="px-3.5 py-2.5 text-slate-500">{row.defaultValue}</td>
                  <td className="px-4 py-2.5 font-sans leading-relaxed text-slate-600 font-medium">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 pt-2 font-sans">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-blue-600" />
          {README_VIEWER_CONSTANTS.architectureTitle}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {README_VIEWER_CONSTANTS.architectureHint}
        </p>
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
          {README_VIEWER_ARCHITECTURE_SNIPPET}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-3 font-sans">
        <HeartHandshake className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-slate-900">{README_VIEWER_CONSTANTS.contributionTitle}</h4>
          <p className="text-slate-600 leading-relaxed">
            {README_VIEWER_CONSTANTS.contributionBody}
          </p>
        </div>
      </div>
    </div>
  );
}
