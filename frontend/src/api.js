// API service layer for Kodr Sandbox

const BASE_URL = '/api';

/**
 * Start a new sandbox
 * POST /api/sandbox/start
 */
export async function startSandbox() {
  const res = await fetch(`${BASE_URL}/sandbox/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to start sandbox: ${res.statusText}`);
  return res.json();
}

/**
 * Get sandbox status
 * GET /api/sandbox/status?sandboxId=...
 */
export async function getSandboxStatus(sandboxId) {
  const res = await fetch(`${BASE_URL}/sandbox/status?sandboxId=${sandboxId}`);
  if (!res.ok) throw new Error(`Failed to get status: ${res.statusText}`);
  return res.json();
}

/**
 * Build agent base URL from sandboxId
 * e.g. 019e8368-24aa-7126-8ca6-63dcd957ca0a.agent.lvh.me
 */
export function getAgentUrl(sandboxId) {
  return `/agent/${sandboxId}`;
}

/**
 * List files in the sandbox
 * GET http://<sandboxId>.agent.lvh.me/list-files
 */
export async function listFiles(sandboxId) {
  const res = await fetch(`${getAgentUrl(sandboxId)}/list-files`);
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`);
  return res.json();
}

/**
 * Read one or more files
 * GET http://<sandboxId>.agent.lvh.me/read-files?files=src/App.jsx,...
 */
export async function readFiles(sandboxId, filePaths) {
  const query = Array.isArray(filePaths) ? filePaths.join(',') : filePaths;
  const res = await fetch(`${getAgentUrl(sandboxId)}/read-files?files=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Failed to read files: ${res.statusText}`);
  return res.json();
}

/**
 * Update files in the sandbox
 * PATCH http://<sandboxId>.agent.lvh.me/update-files
 * body: { files: { "src/App.jsx": "content..." } }
 */
export async function updateFiles(sandboxId, files) {
  const res = await fetch(`${getAgentUrl(sandboxId)}/update-files`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!res.ok) throw new Error(`Failed to update files: ${res.statusText}`);
  return res.json();
}

/**
 * Invoke AI with SSE streaming
 * POST /api/ai/invoke
 * Streams back SSE lines; calls onChunk(text) for each data event
 */
export async function invokeAI(projectId, message, onChunk, onDone) {
  const res = await fetch(`${BASE_URL}/ai/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, projectId }),
  });

  if (!res.ok) throw new Error(`AI invoke failed: ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          onDone && onDone();
          return;
        }
        if (data) {
          onChunk && onChunk(data);
        }
      }
    }
  }

  onDone && onDone();
}
