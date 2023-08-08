import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { CampaignRepository } from "./campaign.repository";
import { Campaign } from "./schemas";
import { CreateCampaignDto } from "./dto";
import { CampaignStatus } from "./enum";
import { CampaignErrorMessage } from "src/common/constants";
import { LensApiService } from "src/lens-api/lens-api.service";
import { UserService } from "src/user/user.service";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";
import { PendingWithdrawService } from "src/pendingWithdraws/pendingWithdraws.service";
import { JwtUserDto } from "src/auth/dtos";
import { CampaignDetailResultDto } from "./dto/campaign-detail-result.dto";
import { IResult } from "src/database/interfaces/IResult.interface";
import { responseHandler, resultHandler } from "src/common/helpers";
import { Result } from "src/database/interfaces/result.interface";
import { MyCampaignResultDto } from "./dto/my-campaign-result.dto";

@Injectable()
export class CampaignService {
  constructor(
    private campaignRepository: CampaignRepository,
    private lensApiService: LensApiService,
    private userService: UserService,
    private pendingRewardService: PendingRewardService,
    private pendingWithdrawService: PendingWithdrawService
  ) {}

  async createCampaign(
    input: CreateCampaignDto,
    jwtInput: JwtUserDto
  ): Promise<Result<Campaign>> {
    //cehck no active campaign
    const userWallet = jwtInput.walletAddress.toLowerCase();

    let exists = await this.campaignRepository.findOne({
      creator: userWallet,
      publicationId: input.publicationId,
      status: CampaignStatus.ACTIVE,
    });

    if (exists) {
      throw new ConflictException(
        CampaignErrorMessage.PUBLICATION_HAS_ACTIVE_CAMPAIGN
      );
    }

    //check creator is the publication owner
    const publicationOwnerResult =
      await this.lensApiService.getPublicationOwner(input.publicationId);

    if (publicationOwnerResult.data != userWallet) {
      throw new ForbiddenException(CampaignErrorMessage.CREATOR_IS_NOT_OWNER);
    }

    //check creator has balance

    const user = await this.userService.findUserByWallet(userWallet);

    const totalBalance = user.data.totalBalance;

    const activeCampaignsCapacity =
      await this.getActiveCampaignsTotalCapacityByCreator(userWallet);

    const notDistributedPendingRewardsForDeactiveCampaigns =
      await this.getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
        userWallet
      );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      userWallet
    );

    const finalCapacity =
      totalBalance -
      (activeCampaignsCapacity +
        notDistributedPendingRewardsForDeactiveCampaigns +
        totalPendingWithdraw);

    if (input.campaignSize > finalCapacity) {
      throw new ForbiddenException(
        CampaignErrorMessage.CAMPAIGNS_SIZE_IS_MORE_THAN_YOUR_CAPACITY
      );
    }

    const createdData = await this.campaignRepository.create({
      ...input,
      creator: userWallet,
    });
    return resultHandler(200, "campaign created", createdData);
  }

  async activateCampaign(
    campaignId: string,
    user: JwtUserDto
  ): Promise<IResult> {
    //check user is campaign creator
    const userWallet = user.walletAddress;

    const result = await this.getCampaignById(campaignId);
    if (result.statusCode !== 200) {
      throw new NotFoundException(CampaignErrorMessage.NOT_FOUND);
    }
    const campaign = result.data;

    if (campaign.status != CampaignStatus.DEACTIVE) {
      throw new ForbiddenException(
        CampaignErrorMessage.INVALID_CAMPAIGN_STATUS
      );
    }

    if (campaign.creator !== userWallet) {
      throw new ForbiddenException(
        CampaignErrorMessage.CALLER_IS_NOT_CAMPAIGN_CREATOR
      );
    }

    //check no active campaign

    let exists = await this.campaignRepository.findOne({
      creator: userWallet,
      publicationId: campaign.publicationId,
      status: CampaignStatus.ACTIVE,
    });

    if (exists) {
      throw new ConflictException(
        CampaignErrorMessage.PUBLICATION_HAS_ACTIVE_CAMPAIGN
      );
    }

    //check no pending reward for campaign

    let notDistributedPendingRewardsResult =
      await this.pendingRewardService.getNotDistributedPendingRewardsCountForCampaign(
        campaignId
      );

    if (notDistributedPendingRewardsResult.data > 0) {
      throw new ForbiddenException(
        CampaignErrorMessage.PENDING_REWARD_FOR_CAMPAIGN
      );
    }

    //check user has capacity
    const userData = await this.userService.findUserByWallet(userWallet);

    const totalBalance = userData.data.totalBalance;

    const activeCampaignsCapacity =
      await this.getActiveCampaignsTotalCapacityByCreator(userWallet);

    const notDistributedPendingRewardsForDeactiveCampaigns =
      await this.getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
        userWallet
      );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      userWallet
    );

    const finalCapacity =
      totalBalance -
      (activeCampaignsCapacity +
        notDistributedPendingRewardsForDeactiveCampaigns +
        totalPendingWithdraw);

    if (campaign.campaignSize - campaign.awardedCount > finalCapacity) {
      throw new ForbiddenException(
        CampaignErrorMessage.CAMPAIGNS_SIZE_IS_MORE_THAN_YOUR_CAPACITY
      );
    }

    //update campaign status
    await this.updateCampaignStatusById(campaignId, CampaignStatus.ACTIVE);

    return responseHandler(200, "campaign activated");
  }
  async deactivateCampaign(
    campaignId: string,
    user: JwtUserDto
  ): Promise<IResult> {
    //check user is campaign creator

    const userWallet = user.walletAddress;

    const result = await this.getCampaignById(campaignId);

    if (result.statusCode !== 200) {
      throw new NotFoundException(CampaignErrorMessage.NOT_FOUND);
    }
    const campaign = result.data;
    if (campaign.status != CampaignStatus.ACTIVE) {
      throw new ForbiddenException(
        CampaignErrorMessage.INVALID_CAMPAIGN_STATUS
      );
    }

    if (campaign.creator !== userWallet) {
      throw new ForbiddenException(
        CampaignErrorMessage.CALLER_IS_NOT_CAMPAIGN_CREATOR
      );
    }

    await this.updateCampaignStatusById(campaignId, CampaignStatus.DEACTIVE);

    return responseHandler(200, "campaign deactivated");
  }

  async getMyCampaigns(
    user: JwtUserDto,
    filters,
    skip,
    limit
  ): Promise<Result<MyCampaignResultDto>> {
    const filterQuery = {
      ...filters,
      creator: user.walletAddress,
    };

    const data = await this.campaignRepository.findWithPaginate(
      skip * limit,
      limit,
      filterQuery,
      { createdAt: 1 },
      {
        _id: 1,
        title: 1,
        publicationId: 1,
        status: 1,
        creator: 1,
        campaignSize: 1,
        awardedCount: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    const count = await this.campaignRepository.count(filterQuery);

    return resultHandler(200, "campaign list", { campaignList: data, count });
  }

  async getCampaignDetails(
    campaignId: string,
    user: JwtUserDto
  ): Promise<Result<CampaignDetailResultDto>> {
    const campaign = await this.campaignRepository.findOne({ _id: campaignId });
    if (!campaign) {
      throw new NotFoundException(CampaignErrorMessage.NOT_FOUND);
    }

    if (campaign.creator != user.walletAddress) {
      throw new ForbiddenException(CampaignErrorMessage.INVALID_ACCESS);
    }

    const pendingRewards =
      await this.pendingRewardService.getPendingRewardsForCampaign(campaignId);

    return resultHandler(200, "campaign details", {
      title: campaign.title,
      campaignSize: campaign.campaignSize,
      awardedCount: campaign.awardedCount,
      isFollowerOnly: campaign.isFollowerOnly,
      minimumFollower: campaign.minFollower,
      status: campaign.status,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      pendingRewards: pendingRewards.data,
    });
  }
  async getActiveCampaignByPublicationId(
    publicationId: string
  ): Promise<Result<Campaign>> {
    const campaign = await this.campaignRepository.findOne({
      publicationId,
      status: CampaignStatus.ACTIVE,
    });
    if (!campaign) {
      return resultHandler(404, "campaign not found", undefined);
    }
    return resultHandler(200, "campaign data", campaign);
  }

  private async updateCampaignStatusById(
    campaignId: string,
    newStatus: number
  ): Promise<IResult> {
    await this.campaignRepository.updateOne(
      { _id: campaignId },
      { $set: { status: newStatus } }
    );

    return responseHandler(200, "campaign status updated");
  }

  private async getCampaignById(campaignId: string): Promise<Result<Campaign>> {
    const campaign = await this.campaignRepository.findOne({ _id: campaignId });
    if (!campaign) {
      return resultHandler(404, "campaign not found", undefined);
    }
    return resultHandler(200, "campaign data", campaign);
  }

  private async getActiveCampaignsTotalCapacityByCreator(
    creator: string
  ): Promise<number> {
    let total = 0;
    let activeCampaigns = await this.campaignRepository.find({
      creator,
      status: CampaignStatus.ACTIVE,
    });

    for (let index = 0; index < activeCampaigns.length; index++) {
      total +=
        activeCampaigns[index].campaignSize -
        activeCampaigns[index].awardedCount;
    }

    return total;
  }

  private async getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
    creator: string,
    campaignIdToActivate?: string
  ): Promise<number> {
    let inactiveCampaigns: Campaign[] = [];

    if (campaignIdToActivate) {
      inactiveCampaigns = await this.campaignRepository.find({
        _id: { $ne: campaignIdToActivate },
        status: CampaignStatus.DEACTIVE,
        creator,
      });
    } else {
      inactiveCampaigns = await this.campaignRepository.find({
        status: CampaignStatus.DEACTIVE,
        creator,
      });
    }

    let total = 0;
    const campaignIds = inactiveCampaigns.map((campaign) => campaign._id);

    const result =
      await this.pendingRewardService.getNotDistributedPendingRewardsForCampaignIds(
        campaignIds
      );

    for (let index = 0; index < result.data.length; index++) {
      total += result.data[index].amount;
    }

    return total;
  }

  private async getPendingWithdrawsCapacity(creator: string): Promise<number> {
    let total = 0;
    const result =
      await this.pendingWithdrawService.getPendingWithdrawsForCreator(creator);
    for (let index = 0; index < result.length; index++) {
      total += result[index].amount;
    }

    return total;
  }
}
