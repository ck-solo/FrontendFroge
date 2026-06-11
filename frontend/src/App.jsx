import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play, Square, Loader2, Zap, Terminal as TerminalIcon,
  Monitor, MessageSquare, Code2, FolderOpen, ChevronRight,
  Activity, Clock, Hash, AlertCircle, CheckCircle2, X,
  PanelLeftClose, PanelLeft, LayoutPanelLeft
} from 'lucide-react';
import ChatPanel from './components/ChatPanel.jsx';
import PreviewPane from './components/PreviewPane.jsx';
import TerminalPane from './components/TerminalPane.jsx';
import FileExplorer from './components/FileExplorer.jsx';
import CodeViewer from './components/CodeViewer.jsx';
import { startSandbox, getCurrentUser } from './api.js';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

// ──── Resizable Splitter ────────────────────────────────────────────────────
function HorizontalResizer({ onResize }) {
  const dragging = useRef(false);
  const startX = useRef(0);

  const onMouseDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      onResize(delta);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 hover:w-1.5 bg-[#1e2130] hover:bg-indigo-500 cursor-col-resize transition-all flex-shrink-0 relative group"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}

function VerticalResizer({ onResize }) {
  const dragging = useRef(false);
  const startY = useRef(0);

  const onMouseDown = (e) => {
    dragging.current = true;
    startY.current = e.clientY;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientY - startY.current;
      startY.current = e.clientY;
      onResize(delta);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="h-1 hover:h-1.5 bg-[#1e2130] hover:bg-indigo-500 cursor-row-resize transition-all flex-shrink-0 relative group"
    >
      <div className="absolute -top-1 -bottom-1 inset-x-0" />
    </div>
  );
}

// ──── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    idle: { color: 'bg-slate-700 text-slate-400', dot: 'bg-slate-500', label: 'Idle' },
    starting: { color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse', label: 'Starting...' },
    running: { color: 'bg-green-500/10 text-green-400 border border-green-500/30', dot: 'bg-green-400', label: 'Running' },
    error: { color: 'bg-red-500/10 text-red-400 border border-red-500/30', dot: 'bg-red-400', label: 'Error' },
  };
  const s = map[status] || map.idle;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </div>
  );
}

// ──── Landing Screen ────────────────────────────────────────────────────────
function LandingScreen({ onStart, starting }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-8 animate-float-in">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30 -z-10" />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold shimmer-text mb-2">Kodr</h1>
          <p className="text-slate-400 text-lg">AI-Powered Sandbox IDE</p>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {[
          { icon: MessageSquare, label: 'AI Chat' },
          { icon: Monitor, label: 'Live Preview' },
          { icon: TerminalIcon, label: 'Terminal' },
          { icon: Code2, label: 'File Explorer' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1d27] border border-[#1e2130] rounded-full text-sm text-slate-400">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
            {label}
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        id="start-sandbox-btn"
        onClick={onStart}
        disabled={starting}
        className="relative group px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 animate-pulse-glow"
      >
        <span className="relative z-10 flex items-center gap-3">
          {starting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Sandbox...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              Start Sandbox
            </>
          )}
        </span>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
      </button>

      <p className="text-xs text-slate-600">
        Spins up a fresh environment in seconds
      </p>
    </div>
  );
}

// ──── Sidebar Tab Button ────────────────────────────────────────────────────
function SideTabBtn({ icon: Icon, label, active, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-1 py-3 px-2 w-full transition-all border-l-2 ${
        active
          ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
          : 'border-transparent text-slate-600 hover:text-slate-400'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// ──── Bottom Panel Tab Button ───────────────────────────────────────────────
function BottomTabBtn({ icon: Icon, label, active, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
        active
          ? 'border-indigo-500 text-indigo-400'
          : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ──── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [sandbox, setSandbox] = useState(null); // { sandboxId, previewUrl }
  const [sandboxStatus, setSandboxStatus] = useState('idle'); // idle | starting | running | error
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentView, setCurrentView] = useState('register'); // 'register' | 'login'
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        } else if (data && data.email) {
          setUser({ email: data.email });
        }
      } catch (err) {
        // Silent catch: user remains unauthenticated (null)
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Panel sizes (percentage-based for left panels, px for bottom)
  const [leftWidth, setLeftWidth] = useState(220); // sidebar icon strip
  const [sidebarWidth, setSidebarWidth] = useState(240); // file/chat left panel
  const [centerFlex, setCenterFlex] = useState(55); // center panel flex %
  const [rightFlex, setRightFlex] = useState(45); // right panel flex %
  const [bottomHeight, setBottomHeight] = useState(220); // terminal panel height

  const [activeSideTab, setActiveSideTab] = useState('chat'); // 'chat' | 'files'
  const [activeBottomTab, setActiveBottomTab] = useState('terminal'); // 'terminal' | 'output'
  const [bottomOpen, setBottomOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Uptime
  const [uptime, setUptime] = useState(0);
  const uptimeRef = useRef(null);

  useEffect(() => {
    if (sandboxStatus === 'running') {
      setUptime(0);
      uptimeRef.current = setInterval(() => setUptime(s => s + 1), 1000);
    } else {
      clearInterval(uptimeRef.current);
    }
    return () => clearInterval(uptimeRef.current);
  }, [sandboxStatus]);

  const formatUptime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleStartSandbox = async () => {
    setSandboxStatus('starting');
    setErrorMsg('');
    try {
      const data = await startSandbox();
      if (data.status === 'OK' || data.sandboxId) {
        setSandbox({ sandboxId: data.sandboxId, previewUrl: data.previewUrl });
        setSandboxStatus('running');
      } else {
        throw new Error(data.message || 'Unexpected response');
      }
    } catch (err) {
      setSandboxStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleStopSandbox = () => {
    setSandbox(null);
    setSandboxStatus('idle');
    setSelectedFile(null);
    setErrorMsg('');
  };

  const handleFileContent = useCallback(({ path, content }) => {
    setSelectedFile({ path, content });
    // Switch to code view if not already viewing
  }, []);

  // Resize handlers
  const handleCenterResize = useCallback((delta) => {
    setCenterFlex(prev => Math.max(20, Math.min(80, prev + delta * 0.05)));
  }, []);

  const handleSidebarResize = useCallback((delta) => {
    setSidebarWidth(prev => Math.max(180, Math.min(400, prev + delta)));
  }, []);

  const handleBottomResize = useCallback((delta) => {
    setBottomHeight(prev => Math.max(100, Math.min(500, prev - delta)));
  }, []);

  const sandboxId = sandbox?.sandboxId;
  const previewUrl = sandbox?.previewUrl;

  // ── Auth Loading Screen ────────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0b0f] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-slate-400 text-sm font-medium text-slate-500">Verifying Session...</span>
      </div>
    );
  }

  // ── Authentication Gate ────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-[#0a0b0f] overflow-y-auto">
        {/* Simplified Auth Top Nav */}
        <header className="flex items-center gap-3 px-6 py-3 border-b border-[#1e2130] flex-shrink-0 glass">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-lg">Kodr</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 text-sm">AI Sandbox IDE</span>
        </header>

        {currentView === 'login' ? (
          <Login
            onToggleRegister={() => setCurrentView('register')}
            onBackHome={null}
            onSuccess={(data) => {
              setUser(data?.user || (data?.email ? { email: data.email } : { email: 'Authenticated User' }));
            }}
          />
        ) : (
          <Register
            onToggleLogin={() => setCurrentView('login')}
            onBackHome={null}
            onSuccess={(data) => {
              setUser(data?.user || (data?.email ? { email: data.email, name: data.name } : { email: 'Authenticated User' }));
            }}
          />
        )}
      </div>
    );
  }

  // ── Landing View ───────────────────────────────────────────────────────────
  if (sandboxStatus === 'idle' || sandboxStatus === 'starting' || sandboxStatus === 'error') {
    return (
      <div className="flex flex-col h-screen bg-[#0a0b0f] overflow-y-auto">
        {/* Top nav */}
        <header className="flex items-center gap-3 px-6 py-3 border-b border-[#1e2130] flex-shrink-0 glass">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-lg">Kodr</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 text-sm">AI Sandbox IDE</span>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Logged in as <strong className="text-white">{user.name || user.email}</strong>
            </span>
            <button
              id="nav-logout-btn"
              onClick={() => {
                setUser(null);
                setCurrentView('register');
              }}
              className="px-4 py-1.5 text-sm font-semibold rounded-xl border border-[#1e2130] hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Error banner */}
        {sandboxStatus === 'error' && (
          <div className="flex items-center gap-3 mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg || 'Failed to start sandbox. Please try again.'}</span>
            <button onClick={() => setSandboxStatus('idle')} className="ml-auto hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <LandingScreen onStart={handleStartSandbox} starting={sandboxStatus === 'starting'} />
      </div>
    );
  }

  // ── IDE Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0a0b0f] overflow-hidden">
      {/* ── Topbar ── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[#1e2130] flex-shrink-0 bg-[#111318] z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white">Kodr</span>
        </div>

        <div className="h-4 w-px bg-[#1e2130]" />

        {/* Sandbox ID badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1a1d27] rounded-lg border border-[#1e2130]">
          <Hash className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-mono text-slate-400">{sandboxId?.slice(0, 18)}…</span>
        </div>

        {/* Status */}
        <StatusBadge status={sandboxStatus} />

        {/* Uptime */}
        {sandboxStatus === 'running' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{formatUptime(uptime)}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Layout toggles */}
        <button
          id="toggle-sidebar-btn"
          onClick={() => setSidebarOpen(o => !o)}
          title="Toggle sidebar"
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        <button
          id="toggle-terminal-btn"
          onClick={() => setBottomOpen(o => !o)}
          title="Toggle terminal"
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <TerminalIcon className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#1e2130]" />

        {/* Stop button */}
        <button
          id="stop-sandbox-btn"
          onClick={handleStopSandbox}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-colors mr-2"
        >
          <Square className="w-3 h-3 fill-red-400" />
          Stop
        </button>

        {/* Sign Out button inside IDE */}
        <button
          id="nav-logout-btn-ide"
          onClick={() => {
            handleStopSandbox();
            setUser(null);
            setCurrentView('register');
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#1e2130] hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Activity Bar (icon strip) ── */}
        <div className="w-12 flex-shrink-0 bg-[#0d0e13] border-r border-[#1e2130] flex flex-col items-center pt-2 z-10">
          <SideTabBtn
            id="sidebar-chat-tab"
            icon={MessageSquare}
            label="Chat"
            active={sidebarOpen && activeSideTab === 'chat'}
            onClick={() => {
              if (sidebarOpen && activeSideTab === 'chat') setSidebarOpen(false);
              else { setSidebarOpen(true); setActiveSideTab('chat'); }
            }}
          />
          <SideTabBtn
            id="sidebar-files-tab"
            icon={FolderOpen}
            label="Files"
            active={sidebarOpen && activeSideTab === 'files'}
            onClick={() => {
              if (sidebarOpen && activeSideTab === 'files') setSidebarOpen(false);
              else { setSidebarOpen(true); setActiveSideTab('files'); }
            }}
          />
        </div>

        {/* ── Sidebar Panel ── */}
        {sidebarOpen && (
          <>
            <div
              className="flex-shrink-0 border-r border-[#1e2130] flex flex-col overflow-hidden"
              style={{ width: sidebarWidth }}
            >
              {activeSideTab === 'chat' ? (
                <ChatPanel sandboxId={sandboxId} />
              ) : (
                <FileExplorer
                  sandboxId={sandboxId}
                  onFileContent={handleFileContent}
                />
              )}
            </div>
            <HorizontalResizer onResize={handleSidebarResize} />
          </>
        )}

        {/* ── Center + Right column ── */}
        <div className="flex flex-1 overflow-hidden flex-col">
          {/* Center + Right horizontal split */}
          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Center: Code Viewer */}
            <div
              className="flex flex-col overflow-hidden border-r border-[#1e2130]"
              style={{ flex: centerFlex }}
            >
              <CodeViewer file={selectedFile} />
            </div>

            <HorizontalResizer onResize={handleCenterResize} />

            {/* Right: Preview */}
            <div
              className="flex flex-col overflow-hidden"
              style={{ flex: rightFlex }}
            >
              <PreviewPane previewUrl={previewUrl} />
            </div>
          </div>

          {/* ── Bottom Panel ── */}
          {bottomOpen && (
            <>
              <VerticalResizer onResize={handleBottomResize} />
              <div
                className="flex-shrink-0 bg-[#0d0e13] border-t border-[#1e2130] flex flex-col overflow-hidden"
                style={{ height: bottomHeight }}
              >
                {/* Bottom tab bar */}
                <div className="flex items-center border-b border-[#1e2130] flex-shrink-0 bg-[#111318]">
                  <BottomTabBtn
                    id="terminal-tab"
                    icon={TerminalIcon}
                    label="Terminal"
                    active={activeBottomTab === 'terminal'}
                    onClick={() => setActiveBottomTab('terminal')}
                  />
                  <BottomTabBtn
                    id="output-tab"
                    icon={Activity}
                    label="Output"
                    active={activeBottomTab === 'output'}
                    onClick={() => setActiveBottomTab('output')}
                  />
                  <div className="flex-1" />
                  {/* Sandbox info in terminal bar */}
                  <div className="flex items-center gap-2 px-3 text-xs text-slate-600">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="font-mono">{sandboxId?.slice(0, 8)}…</span>
                  </div>
                  <button
                    onClick={() => setBottomOpen(false)}
                    className="p-2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                  {activeBottomTab === 'terminal' ? (
                    <TerminalPane sandboxId={sandboxId} />
                  ) : (
                    <OutputPane />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <footer className="flex items-center gap-4 px-4 py-1 bg-[#0d0e13] border-t border-[#1e2130] text-xs text-slate-600 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Sandbox Active</span>
        </div>
        <div className="h-3 w-px bg-[#1e2130]" />
        <span className="font-mono">{sandboxId}</span>
        <div className="flex-1" />
        <span>Kodr IDE v1.0</span>
      </footer>
    </div>
  );
}

// Simple output placeholder
function OutputPane() {
  return (
    <div className="flex items-center justify-center h-full text-slate-600 text-sm gap-2">
      <Activity className="w-4 h-4" />
      <span>No output yet</span>
    </div>
  );
}
