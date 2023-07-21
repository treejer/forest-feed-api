import { Injectable } from "@nestjs/common";

import { PendingRewardRepository } from "./pendingReward.repository";
import { PendingReward } from "./schemas";
import { CreatePendingRewardDTO } from "./dto";
import { CampaignStatus } from "src/campaigns/enum";
import { CollectionNames } from "src/common/constants";
import { CampaignService } from "src/campaigns/campaign.service";

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

  async getNotDistributedPendingRewardsForCampaingIds(
    campaignIds: string[]
  ): Promise<PendingReward[]> {
    const pendingRewards = await this.pendingRewardRepository.find({
      campaignId: { $in: campaignIds },
      isDistributed: false,
    });

    return pendingRewards;
  }
}
