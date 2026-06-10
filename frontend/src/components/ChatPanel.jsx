import { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Loader2, Sparkles, AlertCircle, ChevronDown
} from 'lucide-react';
import { invokeAI } from '../api.js';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const isError = msg.role === 'error';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-indigo-600'
          : isError
          ? 'bg-red-500/20 border border-red-500/40'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <span className="text-xs text-slate-500 px-1">
          {isUser ? 'You' : isError ? 'Error' : 'Kodr AI'}
        </span>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : isError
            ? 'bg-red-500/10 border border-red-500/30 text-red-400 rounded-tl-sm'
            : 'bg-[#1a1d27] border border-[#1e2130] text-slate-200 rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        {msg.timestamp && (
          <span className="text-xs text-slate-600 px-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

function StreamingBubble({ text }) {
  return (
    <div className="flex gap-3 flex-row mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
        <Sparkles className="w-4 h-4 text-white animate-pulse" />
      </div>
      <div className="max-w-[80%] flex flex-col gap-1 items-start">
        <span className="text-xs text-slate-500 px-1">Kodr AI</span>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-[#1a1d27] border border-indigo-500/30 text-slate-200 whitespace-pre-wrap break-words">
          {text || <span className="flex gap-1 items-center text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Thinking...</span>
          </span>}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ sandboxId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Kodr AI. Tell me what you want to build and I\'ll generate the frontend code for your sandbox.\n\nTry: *"Create a todo app with dark mode"* or *"Build a landing page for a SaaS product"*',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!atBottom);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || streaming || !sandboxId) return;

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
    setInput('');
    setStreaming(true);
    setStreamText('');

    try {
      let fullText = '';

      await invokeAI(
        sandboxId,
        msg,
        (chunk) => {
          fullText += chunk;
          setStreamText(fullText);
        },
        () => {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: fullText || '✅ Done! Check the preview panel.', timestamp: Date.now() }
          ]);
          setStreamText('');
          setStreaming(false);
        }
      );
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'error', content: `Error: ${err.message}`, timestamp: Date.now() }
      ]);
      setStreaming(false);
      setStreamText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111318] relative">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2130] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Kodr AI</div>
          <div className="text-xs text-slate-500">AI Code Generator</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${streaming ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-xs text-slate-500">{streaming ? 'Generating...' : 'Ready'}</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {streaming && <StreamingBubble text={streamText} />}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom btn */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors z-10"
        >
          <ChevronDown className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[#1e2130] p-3">
        {!sandboxId && (
          <div className="text-center text-xs text-slate-500 mb-2 bg-[#1a1d27] rounded-lg py-2">
            Start a sandbox to begin chatting
          </div>
        )}
        <div className={`flex items-end gap-2 bg-[#1a1d27] rounded-xl border transition-colors ${
          sandboxId
            ? 'border-[#252836] focus-within:border-indigo-500/50'
            : 'border-[#1e2130] opacity-60'
        }`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            disabled={!sandboxId || streaming}
            placeholder={sandboxId ? 'Describe what you want to build...' : 'Start a sandbox first...'}
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none border-none outline-none px-4 py-3 min-h-[44px] max-h-[160px] font-sans"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            onClick={handleSend}
            disabled={!sandboxId || !input.trim() || streaming}
            className="m-2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 px-1">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
