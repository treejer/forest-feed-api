import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PendingRewardService } from "./pendingReward.service";
import { PendingReward, PendingRewardSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { PendingRewardRepository } from "./pendingReward.repository";
import { PendingRewardController } from "./pendingReward.controller";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingReward.name, schema: PendingRewardSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [PendingRewardController],
  providers: [PendingRewardService, ConfigService, PendingRewardRepository],
  exports: [PendingRewardService],
})
export class PendingRewardModule {}
