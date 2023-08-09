import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { LastStateRepository } from "./lastState.repository";
import { CreateResult, EditResult } from "./interfaces";
import { CampaignService } from "src/campaigns/campaign.service";
import { LensApiService } from "src/lens-api/lens-api.service";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";
import { QueueService } from "src/queue/queue.service";
import {
  EventHandlerErrors,
  Numbers,
  RewardStatus,
} from "src/common/constants";

@Injectable()
export class EventService {
  constructor(
    private lastStateRepository: LastStateRepository,
    private campaignService: CampaignService,
    private pendingRewardService: PendingRewardService,
    private lensApiService: LensApiService,
    private queueService: QueueService
  ) {}

  async saveLastState(
    id: string,
    lastBlockNumber: number
  ): Promise<EditResult> {
    let result = await this.lastStateRepository.updateOne(
      { _id: id },
      { lastBlockNumber }
    );

    return { acknowledged: result.acknowledged };
  }

  async loadLastState(id: string): Promise<number> {
    let result = await this.lastStateRepository.findOne(
      { _id: id },
      { lastBlockNumber: 1, _id: 0 }
    );

    return result ? result.lastBlockNumber + 1 : 1;
  }

  async handleMirror(pubId, profileId, pubIdPointed, profileIdPointed) {
    const publicationId =
      this.generateHexString(profileIdPointed) +
      "-" +
      this.generateHexString(pubIdPointed);

    const campaign =
      await this.campaignService.getActiveCampaignByPublicationId(
        publicationId
      );

    if (!campaign) {
      throw new NotFoundException(EventHandlerErrors.CAMPAIGN_NOT_FOUND);
    }

    const fromProfileData = await this.lensApiService.getProfileOWner(
      this.generateHexString(profileIdPointed).toLocaleLowerCase()
    );

    if (fromProfileData.statusCode != 200) {
      throw new NotFoundException(EventHandlerErrors.CANT_GET_FROM);
    }
    let from = fromProfileData.data;

    const toProfileData = await this.lensApiService.getProfileOWner(
      this.generateHexString(profileId).toLocaleLowerCase()
    );

    if (toProfileData.statusCode != 200) {
      throw new NotFoundException(EventHandlerErrors.CANT_GET_TO);
    }
    let to = toProfileData.data;

    let reward = await this.pendingRewardService.getPendingReward({
      campaignId: campaign.data._id,
      to,
      status: { $in: [RewardStatus.CONFIRMED, RewardStatus.PENDING] },
    });

    if (reward.data) {
      throw new ConflictException(EventHandlerErrors.ALREADY_MIRRORED);
    }

    if (campaign.data.isFollowerOnly) {
      const followedData =
        await this.lensApiService.getProfileAFollowedByProfileB(
          this.generateHexString(profileId),
          this.generateHexString(profileIdPointed)
        );

      if (followedData.statusCode != 200) {
        throw new NotFoundException(EventHandlerErrors.CANT_GET_FOLLOWED_DATA);
      }

      if (!followedData.data.isFollowing) {
        throw new ForbiddenException(
          EventHandlerErrors.NOT_FOLLOWING_POST_OWNER
        );
      }
    }

    if (campaign.data.minFollower > 0) {
      const followerCountData = await this.lensApiService.getFollowersCount(
        this.generateHexString(profileId)
      );

      if (followerCountData.statusCode != 200) {
        throw new NotFoundException(EventHandlerErrors.IS_FOLLOWING);
      }
      if (followerCountData.data.totalFollowers < campaign.data.minFollower) {
        throw new ForbiddenException(
          EventHandlerErrors.MIN_FOLLOWER_NOT_SATISFIED
        );
      }
    }

    let inList = true;

    const pendingCount =
      await this.pendingRewardService.getInListPendingRewardsCountForCampaign(
        campaign.data.id
      );

    const confirmedRewardCount =
      await this.pendingRewardService.getConfirmedRewardsCountForCampaign(
        campaign.data.id
      );

    //check if this pendingReward is in the reward list
    if (
      pendingCount.data + confirmedRewardCount.data >=
      campaign.data.campaignSize
    ) {
      inList = false;
    }

    const orderData = await this.pendingRewardService.getPendingRewardsCount({
      campaignId: campaign.data.id,
    });
    const createdPendingReward =
      await this.pendingRewardService.createPendingRewards({
        amount: 1,
        campaignId: campaign.data.id,
        order: orderData.data + 1,
        from: from,
        to: to,
        inList,
        pubId,
        profileId,
        pubIdPointed,
        profileIdPointed,
        status: RewardStatus.PENDING,
      });

    await this.queueService.addRewardToQueue(
      createdPendingReward.data._id,
      Numbers.REWARD_DELAY
    );
  }

  private generateHexString(value) {
    const hexValue = value.toString(16).padStart(2, "0");

    const hexString = `0x${hexValue}`.toLowerCase();

    return hexString;
  }
}
