// scheduler.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import * as cron from "node-cron";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";
import { Web3Service } from "src/web3/web3.service";

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private pendingRewardService: PendingRewardService,
    private web3Service: Web3Service
  ) {}

  onModuleInit() {
    // Schedule the recurring task to run every 1s
    cron.schedule("*/5 * * * * *", async () => {
      try {
        await this.pendingRewardService.getPendingRewards();
        await this.web3Service.distributeReward("", "", 2, "");
      } catch (error) {
        console.error("error", error);
      }
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
