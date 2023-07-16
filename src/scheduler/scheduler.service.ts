// scheduler.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import * as cron from "node-cron";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(private pendingRewardService: PendingRewardService) {}

  onModuleInit() {
    // Schedule the recurring task to run every 1s
    cron.schedule("*/1 * * * * *", async () => {
      try {
        await this.pendingRewardService.getPendingRewards();
      } catch (error) {
        console.error("error", error);
      }
    });
  }
}
