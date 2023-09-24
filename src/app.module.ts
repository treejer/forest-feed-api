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
import { PendingRewardModule } from "./pendingReward/pendingReward.module";
import { LensApiModule } from "./lens-api/lens-api.module";
import { QueueModule } from "./queue/queue.module";
import { CampaignModule } from "./campaigns/campaign.module";
import { EventModule } from "./event/event.module";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { StackModule } from "./stack/stack.module";
@Module({
  imports: [
    BugsnagModule,
    CommandModule,
    Web3Module,
    DatabaseModule,
    UserModule,
    AuthModule,
    PendingRewardModule,
    LensApiModule,
    CampaignModule,
    EventModule,
    QueueModule,
    StackModule,
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "views"),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
