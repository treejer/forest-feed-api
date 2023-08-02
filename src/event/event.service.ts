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

@Injectable()
export class EventService {
  constructor(
    private lastStateRepository: LastStateRepository,
    private campaignService: CampaignService,
    private pendingRewardService: PendingRewardService,
    private lensApiService: LensApiService
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

    if (campaign.statusCode == 200) {
      let conflictChecked = true;
      let followedChecked = true;
      let followersCountChecked = true;

      let pendingReward = await this.pendingRewardService.getPendingReward({
        profileId,
        pubId,
        profileIdPointed,
        pubIdPointed,
      });

      if (pendingReward) {
        conflictChecked = false;
      }

      if (campaign.data.isFollowerOnly && conflictChecked) {
        const isFollowed =
          await this.lensApiService.getProfileAFollowedByProfileB(
            this.generateHexString(profileId),
            this.generateHexString(profileIdPointed)
          );
        if (!isFollowed) {
          followedChecked = false;
        }
      }
      if (campaign.data.minFollower > 0 && conflictChecked && followedChecked) {
        const followerCount = this.lensApiService.getFollowersCount(
          this.generateHexString(profileId)
        );

        if (followerCount < campaign.data.minFollower) {
          followersCountChecked = false;
        }
      }

      if (conflictChecked && followedChecked && followersCountChecked) {
        let inList = true;
        //check if this pendingReward is in the reward list
        if (false) {
          inList = false;
        }

        await this.pendingRewardService.createPendingRewards({
          amount: 1,
          campaignId: campaign.data.id,
          createdAt: new Date(),
          from: "",
          to: "",
          updatedAt: new Date(),
        });
      }
    }
  }

  private generateHexString(value) {
    // Convert the value to hexadecimal and pad with leading zeros if necessary
    const hexValue = value.toString(16).padStart(2, "0");

    // Format the hex value with '0x' prefix
    const hexString = `0x${hexValue}`;

    return hexString;
  }
}
