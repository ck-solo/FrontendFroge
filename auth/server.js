import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { connectRabbitMQ } from "./src/config/mq.js";

connectDB();

async function startMQ() {
  while (true) {
    try {
      await connectRabbitMQ();
      break;
    } catch (error) {
      console.error("RabbitMQ connection failed, retrying in 5s...", error.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

startMQ().catch(console.error);

app.listen(3000, () => {
    console.log("Auth server is running on http://localhost:3000")
})