import {
  ConflictException,
  ForbiddenException,
  HttpException,
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
  CONFIG,
  EventHandlerErrors,
  Numbers,
  RewardStatus,
} from "src/common/constants";
import { BigNumber as BN } from "ethers";
import BigNumber from "bignumber.js";

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

  async handleMirror(pubId, profileId, pubIdPointed, profileIdPointed, isDA) {
    const publicationId = isDA
      ? pubIdPointed
      : this.generateHexString(profileIdPointed) +
        "-" +
        this.generateHexString(pubIdPointed);

    const mirroredPublication = isDA
      ? pubId
      : this.generateHexString(profileId) + "-" + this.generateHexString(pubId);

    const campaign =
      await this.campaignService.getActiveCampaignByPublicationId(
        publicationId
      );

    if (!campaign.data) {
      throw new NotFoundException(EventHandlerErrors.CAMPAIGN_NOT_FOUND);
    }

    const publicationDetail =
      await this.lensApiService.getMirroredPublicationDetail(
        mirroredPublication
      );
    console.log("publicationDetail", publicationDetail);

    if (publicationDetail.statusCode != 200) {
      throw new HttpException(EventHandlerErrors.CANT_GET_FROM, 499);
    }

    let from = publicationDetail.data.from;
    let to = publicationDetail.data.to;
    let mirrorDeleted = publicationDetail.data.deleted;

    if (mirrorDeleted) {
      throw new ForbiddenException(EventHandlerErrors.MIRROR_POST_DELETED);
    }

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
          isDA
            ? publicationDetail.data.fromProfileId
            : this.generateHexString(profileIdPointed),
          isDA
            ? publicationDetail.data.toProfileId
            : this.generateHexString(profileId)
        );

      if (followedData.statusCode != 200) {
        throw new HttpException(EventHandlerErrors.CANT_GET_FOLLOWED_DATA, 499);
      }
      console.log(
        "followedData.data.isFollowing",
        followedData.data.isFollowing
      );
      console.log("type of", typeof followedData.data.isFollowing);

      if (followedData.data.isFollowing == false) {
        throw new ForbiddenException(
          EventHandlerErrors.NOT_FOLLOWING_POST_OWNER
        );
      }
    }

    if (campaign.data.minFollower > 0) {
      const followerCountData = await this.lensApiService.getFollowersCount(
        isDA
          ? publicationDetail.data.toProfileId
          : this.generateHexString(profileId)
      );

      if (followerCountData.statusCode != 200) {
        throw new HttpException(EventHandlerErrors.IS_FOLLOWING, 499);
      }
      if (followerCountData.data.totalFollowers < campaign.data.minFollower) {
        throw new ForbiddenException(
          EventHandlerErrors.MIN_FOLLOWER_NOT_SATISFIED
        );
      }
    }
    console.log("xxxxx");

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
    console.log("yyyyy", campaign.data);

    const orderData = await this.pendingRewardService.getPendingRewardsCount({
      campaignId: campaign.data.id,
    });

    console.log("orderrrrr", orderData);

    const createdPendingReward =
      await this.pendingRewardService.createPendingRewards({
        amount: 1,
        campaignId: campaign.data.id,
        order: orderData.data + 1,
        from: from,
        to: to,
        inList,
        pubId: isDA ? pubId : this.generateHexString(pubId),
        profileId: isDA
          ? publicationDetail.data.toProfileId
          : this.generateHexString(profileId),
        pubIdPointed: isDA
          ? pubIdPointed
          : this.generateHexString(pubIdPointed),
        profileIdPointed: isDA
          ? publicationDetail.data.fromProfileId
          : this.generateHexString(profileIdPointed),
        status: RewardStatus.PENDING,
        isDA,
      });
    if (inList) {
      await this.queueService.addRewardToQueue(
        createdPendingReward.data._id,
        30000
        //      Numbers.REWARD_DELAY
      );
    }
  }

  private generateHexString(value) {
    return BN.from(value).toHexString();
  }
}
