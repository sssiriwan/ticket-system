import { Worker } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL!);
new Worker(
  'notify',
  async (job) => {
    console.log(
      `[notify] Ticket ${job.data.ticketId} created — sending notification...`,
    );
  },
  { connection },
);
