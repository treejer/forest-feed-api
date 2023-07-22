import {
  ConflictException,
  ForbiddenException,
  Injectable,
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

    if (campaignCreator != userWallet) {
      throw new ForbiddenException(CampaignErrorMessage.CREATOR_IS_NOT_OWNER);
    }

    //check creator has balance

    const user = await this.userService.findUserByWallet(userWallet);

    const activeCampaignsCapacity =
      await this.getActiveCamapaingsTotalCapacityByCreator(userWallet);
    const notDitributedPendingRewardsForDeactiveCampaingns =
      await this.getNotDistributedPendingReardsCapacityForDeactiveCamapaignsByCreator(
        userWallet
      );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      userWallet
    );

    const totalBalance = user.totalBalance;

    const finalCapacity =
      totalBalance -
      (activeCampaignsCapacity +
        notDitributedPendingRewardsForDeactiveCampaingns +
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

  async getActiveCamapaingsTotalCapacityByCreator(
    creator: string
  ): Promise<number> {
    let total;
    let activeCamapaings = await this.campaignRepository.find({
      creator,
      status: CampaignStatus.ACTIVE,
    });

    for (let index = 0; index < activeCamapaings.length; index++) {
      total +=
        activeCamapaings[index].campaignSize -
        activeCamapaings[index].awardedCount;
    }

    return total;
  }

  async getNotDistributedPendingReardsCapacityForDeactiveCamapaignsByCreator(
    creator: string
  ) {
    const inactiveCampaigns = await this.campaignRepository.find({
      status: CampaignStatus.DEACTICE,
      creator,
    });

    let total = 0;
    const campaignIds = inactiveCampaigns.map((campaign) => campaign._id);

    const result =
      await this.pendingRewardService.getNotDistributedPendingRewardsForCampaingIds(
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
