import { Module } from "@nestjs/common";
import { DatabaseModule } from "./../database/database.module";
import { SchedulerService } from "./scheduler.service";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
@Module({
  imports: [DatabaseModule, PendingRewardModule],
  controllers: [],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
