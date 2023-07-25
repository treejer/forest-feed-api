import { Injectable } from "@nestjs/common";

import { PendingRewardRepository } from "./pendingReward.repository";
import { PendingReward } from "./schemas";
import { CreatePendingRewardDTO } from "./dto";
import { CampaignStatus } from "src/campaigns/enum";
import { CollectionNames } from "src/common/constants";
import { CampaignService } from "src/campaigns/campaign.service";
import { JwtUserDto } from "src/auth/dtos";

@Injectable()
export class PendingRewardService {
  constructor(private pendingRewardRepository: PendingRewardRepository) {}

  async createPendingRewards(input: CreatePendingRewardDTO) {
    await this.pendingRewardRepository.create({ ...input });
  }

  async getPendingRewards(): Promise<PendingReward[]> {
    return await this.pendingRewardRepository.find({ isDistributed: false });
  }

  async getPendingRewardsForCampaign(
    campaignId: string
  ): Promise<PendingReward[]> {
    return await this.pendingRewardRepository.find({ campaignId });
  }

  async getMyRewards(user: JwtUserDto, skip, limit): Promise<PendingReward[]> {
    const filterQuery = {
      to: user.walletAddress,
      isDistributed: true,
    };

    const data = await this.pendingRewardRepository.findWithPaginate(
      skip * limit,
      limit,
      filterQuery,
      { updatedAt: 1 },
      {
        _id: 1,
        from: 1,
        to: 1,
        amount: 1,
        isDistributed: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    const count = await this.pendingRewardRepository.count(filterQuery);

    // @ts-ignore
    return { data, count };
  }

  async getNotDistributedPendingRewardsForCampaignIds(
    campaignIds: string[]
  ): Promise<PendingReward[]> {
    const pendingRewards = await this.pendingRewardRepository.find({
      campaignId: { $in: campaignIds },
      isDistributed: false,
    });

    return pendingRewards;
  }

  async getNotDistributedPendingRewardsCountForCampaign(campaignId) {
    return this.pendingRewardRepository.count({
      campaignId,
      isDistributed: false,
    });
  }
}
