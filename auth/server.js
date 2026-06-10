import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { connectRabbitMQ } from "./src/config/mq.js";


connectDB()
await connectRabbitMQ()

app.listen(3000, () => {
    console.log("Auth server is running on http://localhost:3000")
})