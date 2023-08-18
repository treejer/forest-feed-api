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
import { PendingWithdrawModule } from "src/pendingWithdraws/pendingWithdraws.module";
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        password: "urfE0FbCpwI0kV361jCN7mJvfYLDrTZm",
        host: "redis-11280.c273.us-east-1-2.ec2.cloud.redislabs.com", // Redis server host
        port: 11280, // Redis server port
        // // password: "QUEUE_PASS",
        // host: "localhost", // Redis server host
        // port: 6379, // Redis server port
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
    CampaignModule,
    LensApiModule,
    PendingRewardModule,
    PendingWithdrawModule,
    Web3Module,
    UserModule,
  ],
  controllers: [QueueController],
  providers: [QueueService, WithdrawJobService],
  exports: [QueueService, WithdrawJobService],
})
export class QueueModule {}
