import express from "express"

import morgan from "morgan"
import agentRouter from "./routes/agents.routes.js"

const app = express()
app.use(morgan("dev"))
app.use(express.json())


app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ message: "Orchestration service is healthy!" , status: "OK" })
})

app.get("/api/status/readyz", (req, res) => {
    res.status(200).json({ message: "Orchestration service is ready!" , status: "OK" })
})

app.use("/api/ai", agentRouter)

export default app