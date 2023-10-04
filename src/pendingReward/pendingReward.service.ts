import { Injectable } from "@nestjs/common";
import { PendingRewardRepository } from "./pendingReward.repository";
import { PendingReward } from "./schemas";
import { CreatePendingRewardDTO, MyRewardsResultDto } from "./dto";
import { RewardStatus } from "src/common/constants";
import { JwtUserDto } from "src/auth/dtos";
import { Result } from "src/database/interfaces/result.interface";
import { responseHandler, resultHandler } from "src/common/helpers";

@Injectable()
export class PendingRewardService {
  constructor(private pendingRewardRepository: PendingRewardRepository) {}

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

  public async updatePendingRewardStatus(
    pendingRewardId: string,
    status: number,
    session
  ) {
    await this.pendingRewardRepository.updateOne(
      { _id: pendingRewardId },
      {
        $set: { status },
      },
      [],
      session
    );
  }

  public async addPendingRewardToList(pendingRewardId: string, session) {
    await this.pendingRewardRepository.updateOne(
      { _id: pendingRewardId },
      {
        $set: { inList: true },
      },
      [],
      session
    );
  }

  public async getFirstPendingRewardToReward(
    campaignId: string
  ): Promise<Result<PendingReward>> {
    const result = await this.pendingRewardRepository.sort(
      { inList: false, campaignId },
      { order: 1 }
    );

    if (!result[0]) {
      return resultHandler(404, "not found", null);
    }

    return resultHandler(200, "pending reward data", result[0]);
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
      status: RewardStatus.PENDING,
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
      status: RewardStatus.PENDING,
    });

    return resultHandler(200, "in list pending rewards count", count);
  }

  async getConfirmedRewardsCountForCampaign(
    campaignId: string
  ): Promise<Result<number>> {
    const count = await this.pendingRewardRepository.count({
      campaignId,
      status: RewardStatus.CONFIRMED,
    });

    return resultHandler(200, "confirmed rewards count", count);
  }
}
