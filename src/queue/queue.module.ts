import { Module } from "@nestjs/common";
import { SendEmailJob } from "./queue.service";
import { AppController } from "./queue.controller";
import { BullModule } from "@nestjs/bull";
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
  ],
  controllers: [AppController],
  providers: [SendEmailJob],
  exports: [SendEmailJob],
})
export class QueueModule {}
