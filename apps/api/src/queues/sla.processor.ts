import { Worker } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL!);
new Worker(
  'sla',
  async (job) => {
    console.log(
      `[sla] Checking SLA for ticket ${job.data.ticketId} after 15 minutes...`,
    );
  },
  { connection },
);
