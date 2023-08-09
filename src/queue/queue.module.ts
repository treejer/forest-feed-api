import { Module } from "@nestjs/common";
import { QueueService, WithdrawJobService } from "./queue.service";
import { QueueController } from "./queue.controller";
import { BullModule } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
import { Web3Module } from "src/web3/web3.module";
import { CampaignModule } from "src/campaigns/campaign.module";
import { LensApiModule } from "src/lens-api/lens-api.module";
import { UserModule } from "src/user/user.module";
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        // password: "QUEUE_PASS",
        host: "localhost", // Redis server host
        port: 6379, // Redis server port
      },
    }),
    BullModule.registerQueue({
      name: "rewards", // Queue name
      defaultJobOptions: {
        attempts: 30,
        // lifo: true,

        backoff: 2000,
        // Move the job to the dead-letter queue after 3 retries
        removeOnComplete: true,
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
    CampaignModule,
    LensApiModule,
    PendingRewardModule,
    Web3Module,
    UserModule,
  ],
  controllers: [QueueController],
  providers: [QueueService, WithdrawJobService],
  exports: [QueueService, WithdrawJobService],
})
export class QueueModule {}
