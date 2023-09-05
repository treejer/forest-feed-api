// send-email.job.ts

import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { responseHandler } from "src/common/helpers";
import { IResult } from "src/database/interfaces/IResult.interface";

export class QueueService {
  constructor(
    @InjectQueue("pendingWithdraw") private readonly withdrawsQueue: Queue,
    @InjectQueue("rewards") private readonly rewardsQueue: Queue
  ) {}

  async addWithdrawRequestToQueue(pendingWithdrawId: string): Promise<IResult> {
    await this.withdrawsQueue.add("withdraw", pendingWithdrawId);
    return responseHandler(200, "added to queue");
  }

  async addRewardToQueue(
    pendingRewardId: string,
    delay?: number
  ): Promise<IResult> {
    try {
      await this.rewardsQueue.add("distribute", pendingRewardId, { delay: 0 });
    } catch (error) {
      console.log("error", error);
    }

    return responseHandler(200, "added to queue");
  }
}
