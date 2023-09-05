import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { BullModule } from "@nestjs/bull";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        password: "qB6D3Cx7rRBZV4gL2XFFDs1qGGeO5Tmx",
        host: "redis-13763.c89.us-east-1-3.ec2.cloud.redislabs.com",
        port: 13763,
      },
    }),
    BullModule.registerQueue({
      name: "rewards",
      defaultJobOptions: {
        attempts: 30,
        backoff: 2000,
        removeOnComplete: true,
      },
    }),
    BullModule.registerQueue({
      name: "pendingWithdraw",
      defaultJobOptions: {
        attempts: 30,
        backoff: 1000,
        removeOnComplete: true,
      },
    }),

    BullBoardModule.forFeature({
      name: "rewards",
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),

    BullBoardModule.forFeature({
      name: "pendingWithdraw",
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
