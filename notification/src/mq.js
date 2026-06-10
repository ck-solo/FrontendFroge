import amqplib from "amqplib";

const QUEUE = "auth_notification_queue";

export async function connectRabbitMQ() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });

  console.log("RabbitMQ connected");
  console.log("Queue ready:", QUEUE);

  return channel;
}

export { QUEUE };