import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { BugsnagModule } from "src/bugsnag/bugsnag.module";
import { Web3Module } from "src/web3/web3.module";
import { EventService } from "./event.service";
import { LastStateRepository } from "./lastState.repository";
import { Listener } from "./listener/listener.event";
import { LastState, LastStateSchema } from "./schemas";
import { CampaignModule } from "src/campaigns/campaign.module";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
import { LensApiModule } from "src/lens-api/lens-api.module";
import { QueueModule } from "src/queue/queue.module";
import { EventController } from "./event.controller";
import { UserModule } from "src/user/user.module";
import { StackModule } from "src/stack/stack.module";
import { MomokaListener } from "./listener/momoka-listener.event";

@Module({
  imports: [
    Web3Module,
    UserModule,
    MongooseModule.forFeature([
      { name: LastState.name, schema: LastStateSchema },
    ]),
    BugsnagModule,
    CampaignModule,
    PendingRewardModule,
    LensApiModule,
    QueueModule,
    StackModule,
  ],
  controllers: [EventController],
  providers: [Listener, EventService, MomokaListener, LastStateRepository],
  exports: [],
})
export class EventModule {}
