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
  ): Promise<Campaign> {
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
    let campaignCreator: string = await this.lensApiService.getPublicationOwner(
      input.publicationId
    );

    // if (campaignCreator != userWallet) {
    //   throw new ForbiddenException(CampaignErrorMessage.CREATOR_IS_NOT_OWNER);
    // }

    //check creator has balance

    const user = await this.userService.findUserByWallet(userWallet);

    const totalBalance = user.totalBalance;

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
    return createdData;
  }

  async activateCampaign(campaignId: string, user: JwtUserDto) {
    //check user is campaign creator
    const userWallet = user.walletAddress;

    const campaign = await this.getCampaignById(campaignId);

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

    let pendingRewardCount =
      await this.pendingRewardService.getNotDistributedPendingRewardsCountForCampaign(
        campaignId
      );

    if (pendingRewardCount > 0) {
      throw new ForbiddenException(
        CampaignErrorMessage.PENDING_REWARD_FOR_CAMPAIGN
      );
    }

    //check user has capacity
    const userData = await this.userService.findUserByWallet(userWallet);

    const totalBalance = userData.totalBalance;

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

    return "campaign activated";
  }
  async deactivateCampaign(campaignId: string, user: JwtUserDto) {
    //check user is campaign creator

    const userWallet = user.walletAddress;

    const campaign = await this.getCampaignById(campaignId);

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

    return "campaign deactivated";
  }

  async getCampaignById(campaignId: string): Promise<Campaign> {
    return await this.campaignRepository.findOne({ _id: campaignId });
  }

  async getMyCampaigns(
    user: JwtUserDto,
    filters,
    skip,
    limit
  ): Promise<Campaign[]> {
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
        status: 1,
        creator: 1,
        campaignSize: 1,
        awardedCount: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );

    const count = await this.campaignRepository.count(filterQuery);

    // @ts-ignore
    return { data, count };
  }

  async getCampaignDetails(
    campaignId: string,
    user: JwtUserDto
  ): Promise<CampaignDetailResultDto> {
    const campaign = await this.campaignRepository.findOne({ _id: campaignId });
    if (!campaign) {
      throw new NotFoundException(CampaignErrorMessage.NOT_FOUND);
    }

    if (campaign.creator != user.walletAddress) {
      throw new ForbiddenException(CampaignErrorMessage.INVALID_ACCESS);
    }

    const pendingRewards =
      await this.pendingRewardService.getPendingRewardsForCampaign(campaignId);
    return {
      campaignSize: campaign.campaignSize,
      awardedCount: campaign.awardedCount,
      isFollowerOnly: campaign.isFollowerOnly,
      minimumFollower: campaign.minFollower,
      status: campaign.status,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      //@ts-ignore
      pendingRewards,
    };
  }

  async updateCampaignStatusById(campaignId: string, newStatus: number) {
    return await this.campaignRepository.updateOne(
      { _id: campaignId },
      { $set: { status: newStatus } }
    );
  }

  async getActiveCampaignsTotalCapacityByCreator(
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

  async getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
    creator: string,
    campaignIdToActivate?: string
  ) {
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

    for (let index = 0; index < result.length; index++) {
      total += result[index].amount;
    }

    return total;
  }

  async getPendingWithdrawsCapacity(creator: string): Promise<number> {
    let total = 0;
    const result =
      await this.pendingWithdrawService.getPendingWithdrawsForCreator(creator);
    for (let index = 0; index < result.length; index++) {
      total += result[index].amount;
    }

    return total;
  }
}
