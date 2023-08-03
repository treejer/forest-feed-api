import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LastStateRepository } from "./lastState.repository";
import { CreateResult, EditResult } from "./interfaces";
import { CampaignService } from "src/campaigns/campaign.service";
import { LensApiService } from "src/lens-api/lens-api.service";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";
import { QueueService } from "src/queue/queue.service";

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
      await this.campaignService.getActiveCampaingByPublicationId(
        publicationId
      );
    if (!campaign) {
      throw new ConflictException("");
    }

    let from = "from";
    let to = "to";

    let pendingReward =
      await this.pendingRewardService.getPendingReward({
      profileId,
      pubId,
      profileIdPointed,
      pubIdPointed,
      });
    console.log("1");
    

    if (pendingReward.data) {
      throw new ConflictException("");
    }
    console.log("2",campaign.data);

    if (campaign.data.isFollowerOnly) {
      const followedData =
        await this.lensApiService.getProfileAFollowedByProfileB(
          this.generateHexString(profileId),
          this.generateHexString(profileIdPointed)
        );

      if (followedData.statusCode != 200) {
        throw new ConflictException("");
      }

      if (!followedData.data.isFollowing) {
        throw new ConflictException("");
      }

      to = followedData.data.ownedBy;
    }
    if (campaign.data.minFollower > 0) {
      const followerCountData = await this.lensApiService.getFollowersCount(
        this.generateHexString(profileId)
      );
      if (followerCountData.statusCode != 200) {
        throw new ConflictException("");
      }
      if (followerCountData.data.totalFollowers < campaign.data.minFollower) {
        throw new ConflictException("");
      }
      if (!to) {
        to = followerCountData.data.ownedBy;
      }
    }

    let inList = true;

    const inListCount =
      await this.pendingRewardService.getInListPendingRewardsCountForCampaign(
        campaign.data.id
      );
    const confirmedRewardCount =
      await this.pendingRewardService.getConfirmedRewardsCountForCampaign(
        campaign.data.id
      );

    //check if this pendingReward is in the reward list
    if (
      inListCount.data + confirmedRewardCount.data >=
      campaign.data.campaignSize
    ) {
      inList = false;
    }
    
    // const fromProfileData = await this.lensApiService.getProfileOWner(
    //   this.generateHexString(profileIdPointed).toLocaleLowerCase()
    // );

    // if (fromProfileData.statusCode != 200) {
    //   throw new ConflictException("");
    // }
    // from = fromProfileData.data;
    // if (!to) {
    //   const toProfileData = await this.lensApiService.getProfileOWner(
    //     this.generateHexString(profileId).toLocaleLowerCase()
    //   );
    //   if (toProfileData.statusCode != 200) {
    //     throw new ConflictException("");
    //   }
    //   to = toProfileData.data;
    // }

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
        profileId,
        pubId,
        profileIdPointed,
        pubIdPointed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    console.log("createdPendingReward", createdPendingReward.data
    );
    
    // await this.queueService.addRewardToQueue(createdPendingReward.data.id,24*60*60*1000);
    await this.queueService.addRewardToQueue(createdPendingReward.data._id ,10*1000);
  }

  private generateHexString(value) {
    // Convert the value to hexadecimal and pad with leading zeros if necessary
    const hexValue = value.toString(16).padStart(2, "0");

    // Format the hex value with '0x' prefix
    const hexString = `0x${hexValue}`.toLowerCase();

    return hexString;
  }
}
