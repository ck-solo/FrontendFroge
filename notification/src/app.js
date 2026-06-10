import express from 'express';
import morgan from 'morgan';
import { sendEmail } from './email.js';
import { connectRabbitMQ, QUEUE } from "./mq.js";

const app = express();
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello from Notification Service!');
});

app.get("/_status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({ status: "ready" });
});


async function startConsumer() {
  let channel;
  while (!channel) {
    try {
      channel = await connectRabbitMQ();
    } catch (error) {
      console.error("RabbitMQ connection failed, retrying in 5s...", error.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const messageContent = msg.content.toString();
    console.log("Received message from queue:", messageContent);

    try {
      const { timestamp, email } = JSON.parse(messageContent);

      const subject = "New Login Notification";
      const text = `A new login was detected for your account at ${timestamp}.`;
      const html = `<p>A new login was detected for your account at <strong>${timestamp}</strong>.</p>`;

      await sendEmail(email, subject, text, html);

      channel.ack(msg);
    } catch (error) {
      console.error("Error processing message:", error);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer().catch((error) => {
  console.error("RabbitMQ consumer failed:", error);
});



export default app;