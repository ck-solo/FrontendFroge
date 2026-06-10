import Redis from "ioredis";
import { deletePod } from '../Kubernetes/pod.js'
import { deleteService } from "../Kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL); //used to fire event
const subscriber = new Redis(process.env.REDIS_URL); // used to lieten event

export async function createSandboxKey(sandboxId) {
  await redis.set(
    `sandbox:${sandboxId}`,
    JSON.stringify({ status: "active" }),
    "EX",
    120,
  ); //120 mins
}

subscriber.config("SET", "notify-keyspace-events", "Ex"); // redis fire event

subscriber.subscribe("__keyevent@0__:expired"); // it lisen the expire event

subscriber.on("message", async (channel, key) => {
  console.log(`Key expired: ${key}`);
  /*
  * sandbox: 019e95c4-daf7-7747-ad2e-66e1677e0f30
  */
  const sandboxId = key.split(':')[ 1 ]

  /**
   * Delete the associated Kubernetes resources
   */
  await deletePod(sandboxId)
  await deleteService(sandboxId)
}); // channel is like a topic name in pub sub and here also

export default {  subscriber };
