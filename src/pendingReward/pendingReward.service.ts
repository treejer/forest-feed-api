import { Injectable } from "@nestjs/common";

import { PendingRewardRepository } from "./pendingReward.repository";
import { PendingReward } from "./schemas";
import { CreatePendingRewardDTO } from "./dto";

@Injectable()
export class PendingRewardService {
  constructor(private pendingRewardRepository: PendingRewardRepository) {}

  async createPendingRewards(input: CreatePendingRewardDTO) {
    await this.pendingRewardRepository.create({ ...input });
  }

  async getPendingRewards(): Promise<PendingReward[]> {
    console.log("ali 2");

    return await this.pendingRewardRepository.find({ isDistributed: false });
  }
}
