import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PendingRewardService } from "./pendingReward.service";
import { ConfirmedReward, ConfirmedRewardSchema, PendingReward, PendingRewardSchema, RejectedReward, RejectedRewardSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { ConfirmedRewardRepository, PendingRewardRepository, RejectedRewardRepository } from "./pendingReward.repository";
import { PendingRewardController } from "./pendingReward.controller";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingReward.name, schema: PendingRewardSchema },
      { name: ConfirmedReward.name, schema: ConfirmedRewardSchema },
      { name: RejectedReward.name, schema: RejectedRewardSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [PendingRewardController],
  providers: [PendingRewardService, ConfigService, PendingRewardRepository,ConfirmedRewardRepository,RejectedRewardRepository],
  exports: [PendingRewardService],
})
export class PendingRewardModule {}
