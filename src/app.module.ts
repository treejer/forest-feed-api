import { Web3Module } from "./web3/web3.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CommandModule } from "nestjs-command";
import { BugsnagModule } from "./bugsnag/bugsnag.module";
import { join } from "path";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { PendingRewardModule } from "./pendingReward/pendingReward.module";
import { LensApiModule } from "./lens-api/lens-api.module";

import { SendEmailJob } from "./queue/queue.service";
import { QueueModule } from "./queue/queue.module";
import { CampaignModule } from "./campaigns/campaign.module";
@Module({
  imports: [
    BugsnagModule,
    CommandModule,
    Web3Module,
    DatabaseModule,
    UserModule,
    AuthModule,
    // SchedulerModule,
    PendingRewardModule,
    LensApiModule,
    CampaignModule,
    // QueueModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "views"),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
