import express from "express"
import morgan from "morgan"
import { createProxyMiddleware } from "http-proxy-middleware"
import http from "http"
import { refreshTTL } from "./config/redis.js"

const app = express()
app.use(morgan("dev"))

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ message: "Router is healthy!" , status: "OK" })
})

app.get("/api/status/readyz", (req, res) => {
    res.status(200).json({ message: "Router is ready!" , status: "OK" })
})


const proxies = {}
const agentProxies = {}

function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  console.log("PREVIEW TARGET:", target);

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      onError(err, req, res) {
        console.error("Preview proxy error:", err.message);
        res.status(502).send(err.message);
      },
    });
  }

  return proxies[sandboxId];
}


function getAgentProxy(sandboxId){
   const target = `http://sandbox-service-${sandboxId}:3000`;
    
    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin:true,
            ws:true
        });
    }
    return agentProxies[sandboxId]
}

app.use(async (req, res, next) => {
    const host = req.headers.host;
    const sandboxId = host.split(".")[0];
    const type = host.split(".")[1];
    await refreshTTL(sandboxId)

    if (type === "agent") {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (type === "preview") {
        return getProxy(sandboxId)(req, res, next);
    }

    return res.status(400).send("Invalid host");
});
// Create the HTTP server explicitly
const server = http.createServer(app);

// ✅ Handle WebSocket upgrades — this is what was missing
server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[ 0 ];
    const type = host.split('.')[ 1 ];

    console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

    if (type === 'agent') {
        const proxy = getAgentProxy(sandboxId);
        proxy.upgrade(req, socket, head);
    } else if (type === 'preview') {
        const proxy = getProxy(sandboxId);
        proxy.upgrade(req, socket, head);
    } else {
        socket.destroy();
    }
});


export default server
 