import { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, ChevronRight, ChevronDown, FileText, File,
  RefreshCw, Loader2
} from 'lucide-react';
import { listFiles, readFiles } from '../api.js';

const FILE_ICONS = {
  jsx: { color: 'text-blue-400', label: 'JSX' },
  tsx: { color: 'text-blue-400', label: 'TSX' },
  js: { color: 'text-yellow-400', label: 'JS' },
  ts: { color: 'text-blue-300', label: 'TS' },
  css: { color: 'text-purple-400', label: 'CSS' },
  html: { color: 'text-orange-400', label: 'HTML' },
  json: { color: 'text-green-400', label: 'JSON' },
  md: { color: 'text-slate-400', label: 'MD' },
  svg: { color: 'text-pink-400', label: 'SVG' },
};

function getFileInfo(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || { color: 'text-slate-400', label: ext?.toUpperCase() || 'FILE' };
}

function buildTree(files) {
  const root = {};
  for (const file of files) {
    // file could be a path string like "src/App.jsx" or just "App.jsx"
    const parts = (typeof file === 'string' ? file : file.path || file.name || '').split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node[part] = { __isFile: true, __path: parts.join('/') };
      } else {
        if (!node[part]) node[part] = {};
        node = node[part];
      }
    }
  }
  return root;
}

function TreeNode({ name, node, depth = 0, onSelect, selectedPath }) {
  const [open, setOpen] = useState(depth < 2);
  const isFile = node.__isFile;
  const info = isFile ? getFileInfo(name) : null;
  const isSelected = isFile && node.__path === selectedPath;

  if (isFile) {
    return (
      <button
        onClick={() => onSelect(node.__path)}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors group ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2130]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        title={node.__path}
      >
        <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${info?.color}`} />
        <span className="truncate">{name}</span>
        <span className={`ml-auto text-[10px] font-mono ${info?.color} opacity-60 group-hover:opacity-100`}>
          {info?.label}
        </span>
      </button>
    );
  }

  const children = Object.entries(node).filter(([k]) => !k.startsWith('__'));

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1e2130] transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        )}
        <FolderOpen className={`w-3.5 h-3.5 flex-shrink-0 ${open ? 'text-yellow-400' : 'text-slate-500'}`} />
        <span className="truncate font-medium">{name}</span>
      </button>
      {open && (
        <div>
          {children.map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ sandboxId, onFileContent }) {
  const [files, setFiles] = useState([]);
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  const fetchFiles = async () => {
    if (!sandboxId) return;
    setLoading(true);
    try {
      const data = await listFiles(sandboxId);
      // data could be { files: [...] } or { data: [...] } or just [...]
      const list = data.files || data.data || data || [];
      setFiles(list);
      setTree(buildTree(list));
    } catch (err) {
      console.error('Failed to list files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sandboxId) fetchFiles();
  }, [sandboxId]);

  const handleSelect = async (path) => {
    setSelectedPath(path);
    if (!sandboxId) return;
    setFileLoading(true);
    try {
      const data = await readFiles(sandboxId, [path]);
      const fileData = data.files?.[0] || {};
      const content = Object.values(fileData)[0] || '';
      onFileContent && onFileContent({ path, content });
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setFileLoading(false);
    }
  };

  const rootEntries = Object.entries(tree);

  return (
    <div className="flex flex-col h-full bg-[#111318]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#1e2130] flex-shrink-0">
        <FolderOpen className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Explorer</span>
        <button
          onClick={fetchFiles}
          disabled={!sandboxId || loading}
          className="ml-auto p-1 text-slate-500 hover:text-slate-300 disabled:opacity-40 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1" style={{ minHeight: 0 }}>
        {!sandboxId ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
            <FolderOpen className="w-8 h-8 text-slate-700" />
            <p className="text-xs text-slate-600">No sandbox running</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        ) : rootEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-600">No files found</p>
          </div>
        ) : (
          rootEntries.map(([name, node]) => (
            <TreeNode
              key={name}
              name={name}
              node={node}
              depth={0}
              onSelect={handleSelect}
              selectedPath={selectedPath}
            />
          ))
        )}
      </div>

      {/* File loading indicator */}
      {fileLoading && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[#1e2130] text-xs text-slate-500 flex-shrink-0">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading file...</span>
        </div>
      )}
    </div>
  );
}
