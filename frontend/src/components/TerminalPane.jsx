import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPane({ sandboxId }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const initializedRef = useRef(false);

  const initTerminal = useCallback(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    // Create terminal
    const term = new Terminal({
      theme: {
        background: '#0a0b0f',
        foreground: '#e2e8f0',
        cursor: '#6366f1',
        cursorAccent: '#0a0b0f',
        selectionBackground: 'rgba(99,102,241,0.3)',
        black: '#1e2130',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#f59e0b',
        blue: '#6366f1',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#e2e8f0',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#fbbf24',
        brightBlue: '#818cf8',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#f8fafc',
      },
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect socket.io
    const socket = io('/', {
      path: `/agent/${sandboxId}/socket.io`,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\r\n\x1b[1;32m✓ Terminal connected\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      term.writeln('\r\n\x1b[1;33m⚠ Terminal disconnected\x1b[0m\r\n');
    });

    socket.on('connect_error', (err) => {
      term.writeln(`\r\n\x1b[1;31m✗ Connection error: ${err.message}\x1b[0m\r\n`);
    });

    // Receive terminal output from server
    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Send terminal input to server
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    // Handle resize
    const observer = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (_) {}
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      socket.disconnect();
      term.dispose();
    };
  }, [sandboxId]);

  useEffect(() => {
    const cleanup = initTerminal();
    return () => {
      cleanup && cleanup();
      initializedRef.current = false;
    };
  }, [initTerminal]);

  return (
    <div className="flex flex-col h-full bg-[#0a0b0f]">
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
