import { Injectable } from "@nestjs/common";

import {
  ConfirmedRewardRepository,
  PendingRewardRepository,
  RejectedRewardRepository,
} from "./pendingReward.repository";
import { ConfirmedReward, PendingReward, RejectedReward } from "./schemas";
import {
  CreateConfirmedRewardDto,
  CreatePendingRewardDTO,
  CreateRejectedRewardDto,
  MyRewardsResultDto,
} from "./dto";
import { CampaignStatus } from "src/campaigns/enum";
import { CollectionNames } from "src/common/constants";
import { CampaignService } from "src/campaigns/campaign.service";
import { JwtUserDto } from "src/auth/dtos";
import { Result } from "src/database/interfaces/result.interface";
import { resultHandler } from "src/common/helpers";

@Injectable()
export class PendingRewardService {
  constructor(
    private pendingRewardRepository: PendingRewardRepository,
    private confirmedRewardRepository: ConfirmedRewardRepository,
    private rejectedRewardRepository: RejectedRewardRepository
  ) {}

  async createPendingRewards(
    input: CreatePendingRewardDTO
  ): Promise<Result<PendingReward>> {
    const createdData = await this.pendingRewardRepository.create({ ...input });
    return resultHandler(200, "pending reward Created", createdData);
  }

  async getMyRewards(
    user: JwtUserDto,
    skip,
    limit
  ): Promise<Result<MyRewardsResultDto>> {
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

    return resultHandler(200, "user rewards", {
      pendingRewardList: data,
      count,
    });
  }

  async getPendingRewards(): Promise<Result<PendingReward[]>> {
    const pendingRewardList = await this.pendingRewardRepository.find({
      isDistributed: false,
    });

    return resultHandler(200, "pending rewards list", pendingRewardList);
  }

  async getPendingRewardsForCampaign(
    campaignId: string
  ): Promise<Result<PendingReward[]>> {
    const pendingRewardList = await this.pendingRewardRepository.find({
      campaignId,
    });

    return resultHandler(200, "pending rewards list", pendingRewardList);
  }

  async getNotDistributedPendingRewardsForCampaignIds(
    campaignIds: string[]
  ): Promise<Result<PendingReward[]>> {
    const pendingRewards = await this.pendingRewardRepository.find({
      campaignId: { $in: campaignIds },
      isDistributed: false,
    });

    return resultHandler(
      200,
      "not distributed pending rewards for campaigns",
      pendingRewards
    );
  }

  async getNotDistributedPendingRewardsCountForCampaign(
    campaignId
  ): Promise<Result<number>> {
    const result = this.pendingRewardRepository.count({
      campaignId,
      isDistributed: false,
    });

    return resultHandler(
      200,
      "not distributed pending rewards count for campaign",
      result
    );
  }
  async getPendingReward(filters): Promise<Result<PendingReward>> {
    const result = await this.pendingRewardRepository.findOne(filters);
    if (!result) {
      return resultHandler(404, "no pending rewards", undefined);
    }

    return resultHandler(200, "pending rewards data", result);
  }

  async getPendingRewardsCount(filters): Promise<Result<number>> {
    const count = await this.pendingRewardRepository.count(filters);

    return resultHandler(200, "pending rewards count", count);
  }

  async getInListPendingRewardsCountForCampaign(
    campaignId: string
  ): Promise<Result<number>> {
    const count = await this.pendingRewardRepository.count({
      campaignId,
      inList: true,
    });

    return resultHandler(200, "in list pending rewards count", count);
  }
  //--------------------------------------------------- confirmed  rewards

  async createConfirmedRewards(
    input: CreateConfirmedRewardDto
  ): Promise<Result<ConfirmedReward>> {
    const createdData = await this.confirmedRewardRepository.create({
      ...input,
    });
    return resultHandler(200, "conf reward Created", createdData);
  }

  async getConfirmedRewardsCountForCampaign(
    campaignId: string
  ): Promise<Result<number>> {
    const count = await this.confirmedRewardRepository.count({ campaignId });

    return resultHandler(200, "confirmed rewards count", count);
  }

  //--------------------------------------------------- rejected  rewards
  async createRejectedRewards(
    input: CreateRejectedRewardDto
  ): Promise<Result<RejectedReward>> {
    const createdData = await this.rejectedRewardRepository.create({
      ...input,
    });
    return resultHandler(200, "rejected reward Created", createdData);
  }
}
