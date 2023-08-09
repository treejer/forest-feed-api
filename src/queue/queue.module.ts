import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { AppController } from "./queue.controller";
import { SendEmailJob, WithdrawJobService } from "./queue.service";
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: "localhost", // Redis server host
        port: 6379, // Redis server port
      },
    }),
    BullModule.registerQueue({
      name: "emails", // Queue name
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000, // 1 second delay between retries
        },
        // Move the job to the dead-letter queue after 3 retries
        removeOnComplete: true,
        removeOnFail: 3,
      },
    }),
    BullModule.registerQueue({
      name: "pendingWithdraw", // Queue name
      defaultJobOptions: {
        attempts: 3,
        backoff: 1000, // 1 second delay between retries

        // Move the job to the dead-letter queue after 3 retries
        removeOnComplete: true,
        removeOnFail: 3,
      },
    }),
  ],
  controllers: [AppController],
  providers: [SendEmailJob, WithdrawJobService],
  exports: [SendEmailJob],
})
export class QueueModule {}
