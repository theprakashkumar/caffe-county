import Redis from "ioredis";

// Connect to Redis
// const redis = new Redis({
//   host: process.env.Redis_HOST || "127.0.0.1",
//   port: parseInt(process.env.REDIS_PORT || "6379"),
//   password: process.env.REDIS_PASSWORD,
// });

const redis = new Redis(
  "rediss://default:AUQmAAIjcDExZTcxYzhlNGQ5ODQ0ZWM5OWM2MThhZGY4ODgyMWU1M3AxMA@wise-blowfish-17446.upstash.io:6379"
);

export default redis;
