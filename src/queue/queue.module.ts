import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        password: "QUEUE_PASS",
        host: "REDIS_HOST", // Redis server host
        port: 10819, // Redis server port
      },
    }),
    BullModule.registerQueue({
      name: "rewards", // Queue name
      defaultJobOptions: {
        attempts: 30,
        // lifo: true,

        backoff: 700,
        // Move the job to the dead-letter queue after 3 retries
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
