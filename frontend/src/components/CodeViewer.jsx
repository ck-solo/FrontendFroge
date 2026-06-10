import { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';

export default function CodeViewer({ file }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!file?.content) return;
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center bg-[#0d0e13]">
        <Code2 className="w-10 h-10 text-slate-700" />
        <div>
          <p className="text-sm text-slate-500 font-medium">Select a file to view</p>
          <p className="text-xs text-slate-600 mt-1">Click any file in the explorer</p>
        </div>
      </div>
    );
  }

  const lines = file.content.split('\n');

  return (
    <div className="flex flex-col h-full bg-[#0d0e13]">
      {/* Tab bar */}
      <div className="flex items-center border-b border-[#1e2130] flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-[#1e2130] bg-[#111318]">
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-300 font-mono">{file.path}</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <table className="w-full border-collapse text-xs">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-[#111318] group">
                <td className="w-10 text-right pr-4 py-0.5 select-none text-slate-600 font-mono border-r border-[#1a1d27] sticky left-0 bg-[#0d0e13] group-hover:bg-[#111318]">
                  {i + 1}
                </td>
                <td className="pl-4 py-0.5 font-mono text-slate-300 whitespace-pre">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-[#1e2130] text-xs text-slate-600 flex-shrink-0">
        <span>{lines.length} lines</span>
        <span>{file.content.length} chars</span>
        <span className="font-mono">{file.path.split('.').pop()?.toUpperCase()}</span>
      </div>
    </div>
  );
}
