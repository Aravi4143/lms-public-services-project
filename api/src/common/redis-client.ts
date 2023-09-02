import { createClient } from "redis";
import { getConfig } from "./config";

const redisClient = createClient({
  url: `redis://${getConfig("REDIS_HOST")}`,
  password: getConfig("REDIS_PASSWORD") as string,
});

export default redisClient;
