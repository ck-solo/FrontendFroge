import amqplib from "amqplib";

const QUEUE = "auth_notification_queue";

let channel;

export async function connectRabbitMQ() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL);

  channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, {
    durable: true,
  });

  console.log("RabbitMQ Connected");
}

export async function sendAuthNotification(message) {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  channel.sendToQueue(
    QUEUE,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
}