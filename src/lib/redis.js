import Redis from "ioredis";

let redis = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || "redis.bonneidee.biz",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    tls: {
      rejectUnauthorized: false, // Required for some Redis providers
    },
    retryStrategy: (times) => {
      const maxDelay = 5000; // Maximum delay between retries
      const delay = Math.min(times * 500, maxDelay);
      return delay;
    },
    maxRetriesPerRequest: 5,
    connectTimeout: 10000,
    keepAlive: 30000,
    enableReadyCheck: false,
    enableOfflineQueue: true,
    reconnectOnError: (err) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  });

  redis.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  redis.on("connect", () => {
    console.log("Redis Client Connected");
  });

  redis.on("ready", () => {
    console.log("Redis Client Ready");
  });

  redis.on("reconnecting", () => {
    console.log("Redis Client Reconnecting");
  });

  // Test the connection
  redis
    .ping()
    .then(() => {
      console.log("Redis connection test successful");
    })
    .catch((err) => {
      console.error("Redis connection test failed:", err);
    });
} catch (err) {
  console.error("Redis Client Initialization Error:", err);
}

if (!redis) {
  throw new Error("Redis client failed to initialize");
}

export default redis;
