import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { CampaignModule } from "src/campaigns/campaign.module";
import { LensApiModule } from "src/lens-api/lens-api.module";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
import { PendingWithdrawModule } from "src/pendingWithdraws/pendingWithdraws.module";
import { Web3Module } from "src/web3/web3.module";
import { UserModule } from "src/user/user.module";
import { RewardPocess, WithdrawProcess } from "./worker.service";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { QueueModule } from "src/queue/queue.module";

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
    }),
    BullModule.registerQueue({
      name: "pendingWithdraw",
    }),
    CampaignModule,
    LensApiModule,
    PendingRewardModule,
    PendingWithdrawModule,
    Web3Module,
    UserModule,
    QueueModule,
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "views"),
    }),
  ],
  providers: [RewardPocess, WithdrawProcess],
  controllers: [],
})
export class WorkerModule {}
