import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { SchedulerService } from "./scheduler.service";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
import { Web3Module } from "src/web3/web3.module";
@Module({
  imports: [DatabaseModule, PendingRewardModule, Web3Module],
  controllers: [],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
