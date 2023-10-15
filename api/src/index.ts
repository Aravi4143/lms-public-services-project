import app from "./app";
import { getConfig } from "./common/config";
import redisClient from "./common/redis-client";
import cron from "node-cron";
import { promises as fs } from "fs";
import { join } from "path";

if (!getConfig("PORT")) {
  process.exit(1);
}

const PORT: number = parseInt(getConfig("PORT") as string, 10);

async function main() {
  // Connect to cache server
  await redisClient
    .connect()
    .then(() => {
      console.log(`Connected to Redis`);
    })
    .catch((err) => {
      console.error("Error connecting to Redis", err);
    });

  cron.schedule(getConfig("PURGE_CRON_EXP") as string, async () => {
    console.log(
      `Purging the face files older than ${getConfig("TTL_DAYS")} days started`
    );
    await deleteOldFiles(
      "uploads/",
      parseInt(getConfig("TTL_DAYS") as string, 10)
    );
    console.log(
      `Purged the face files older than ${getConfig("TTL_DAYS")} days`
    );
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 App started in ${getConfig("MODE")} mode on port ${PORT}.`);
  });
}

async function deleteOldFiles(uploadsPath: string, ttlDays: number) {
  const now = new Date();
  const daysAgo = new Date(now.getTime() - ttlDays * 24 * 60 * 60 * 1000);

  const files = await fs.readdir(uploadsPath);

  for (const file of files) {
    const filePath = join(uploadsPath, file);
    const stats = await fs.stat(filePath);

    if (stats.mtime < daysAgo) {
      await fs.unlink(filePath);
    }
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
