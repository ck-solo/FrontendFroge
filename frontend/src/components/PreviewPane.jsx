import { useState, useRef, useEffect } from 'react';
import {
  RefreshCw, ExternalLink, Smartphone, Monitor, Tablet, Loader2, Globe
} from 'lucide-react';

const VIEWPORTS = [
  { label: 'Desktop', icon: Monitor, width: '100%' },
  { label: 'Tablet', icon: Tablet, width: '768px' },
  { label: 'Mobile', icon: Smartphone, width: '375px' },
];

export default function PreviewPane({ previewUrl }) {
  const [viewport, setViewport] = useState(0);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef(null);

  const refresh = () => {
    setLoading(true);
    setKey(k => k + 1);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (previewUrl) {
      setLoading(true);
      setKey(k => k + 1);
    }
  }, [previewUrl]);

  const currentViewport = VIEWPORTS[viewport];

  return (
    <div className="flex flex-col h-full bg-[#111318]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e2130] flex-shrink-0">
        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#0a0b0f] rounded-lg px-3 py-1.5 border border-[#1e2130]">
          <Globe className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span className="text-xs text-slate-400 truncate font-mono">
            {previewUrl || 'No sandbox running'}
          </span>
        </div>

        {/* Viewport toggles */}
        <div className="flex items-center bg-[#0a0b0f] rounded-lg border border-[#1e2130] p-0.5">
          {VIEWPORTS.map((vp, i) => {
            const Icon = vp.icon;
            return (
              <button
                key={i}
                onClick={() => setViewport(i)}
                title={vp.label}
                className={`p-1.5 rounded-md transition-all ${
                  viewport === i
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          disabled={!previewUrl}
          title="Refresh preview"
          className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Open in new tab */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-start justify-center bg-[#0d0e13] overflow-auto" style={{ minHeight: 0 }}>
        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1d27] border border-[#1e2130] flex items-center justify-center">
              <Monitor className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">No preview available</p>
              <p className="text-slate-600 text-sm mt-1">Start a sandbox to see your app here</p>
            </div>
          </div>
        ) : (
          <div
            className="relative transition-all duration-300 h-full"
            style={{
              width: currentViewport.width,
              maxWidth: '100%',
            }}
          >
            {loading && (
              <div className="absolute inset-0 bg-[#0a0b0f]/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-sm text-slate-400">Loading preview...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={key}
              src={previewUrl}
              onLoad={handleLoad}
              onError={() => setLoading(false)}
              className="w-full h-full border-none bg-white rounded-none"
              title="Sandbox Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          </div>
        )}
      </div>
    </div>
  );
}
