// send-email.job.ts

import { InjectQueue, Process, Processor } from "@nestjs/bull";
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Job, Queue } from "bull";

import { Connection } from "mongoose";
import { CampaignService } from "src/campaigns/campaign.service";
import { responseHandler } from "src/common/helpers";
import { IResult } from "src/database/interfaces/IResult.interface";
import { LensApiService } from "src/lens-api/lens-api.service";
import { PendingRewardService } from "src/pendingReward/pendingReward.service";
import { PendingReward } from "src/pendingReward/schemas";
import { UserService } from "src/user/user.service";
import { Web3Service } from "src/web3/web3.service";
import BigNumber from "bignumber.js";
import {
  CONFIG,
  EventHandlerErrors,
  LensApiErrorMessage,
  Numbers,
  RewardStatus,
} from "src/common/constants";
import { PendingWithdrawService } from "src/pendingWithdraws/pendingWithdraws.service";
import { CampaignStatus } from "src/campaigns/enum";
import { utils } from "ethers";

export class QueueService {
  private x;
  constructor(
    @InjectQueue("rewards") private readonly rewardsQueue: Queue,
    private pendingRewardService: PendingRewardService,
    private campaignService: CampaignService,
    private web3Service: Web3Service,
    private lensApiService: LensApiService,
    private userService: UserService,
    @InjectConnection() private connection: Connection
  ) {
    this.x = 0;
  }

  async emptyQueue(): Promise<IResult> {
    try {
      await this.rewardsQueue.removeJobs("");
    } catch (error) {
      console.log("errrrrr", error);
    }

    return responseHandler(200, "added to queue");
  }
  async addRewardToQueue(
    pendingRewardId: string,
    delay?: number
  ): Promise<IResult> {
    try {
      await this.rewardsQueue.add("distribute", pendingRewardId, { delay });
    } catch (error) {
      console.log("errrrrr", error);
    }

    return responseHandler(200, "added to queue");
  }
  @Process("distribute")
  async distributeReward(job: Job<any>) {
    await this.sleep(2000);
    console.log("aaaa");

    let failed = true;
    let retryCount = 0;
    let okToReward = true;
    let mirrorExistanseChecked = true;
    let followingPostCreatorChecked = true;
    let followerCountChecked = true;
    let campaign;

    const data = job.data;

    while (failed && retryCount < 2) {
      try {
        const pendingReward = await this.pendingRewardService.getPendingReward({
          _id: data,
        });

        if (pendingReward.statusCode != 200) {
          throw new NotFoundException(
            EventHandlerErrors.PENDING_REWARD_NOT_FOUND
          );
        }

        let publicationStatus =
          await this.lensApiService.getMirroredPublicationStatus(
            pendingReward.data.profileId + "-" + pendingReward.data.pubId
          );

        if (publicationStatus.statusCode != 200) {
          throw new NotFoundException(EventHandlerErrors.PUBLICATION_NOT_FOUND);
        }

        if (publicationStatus.data) {
          mirrorExistanseChecked = false;
        }

        if (mirrorExistanseChecked) {
          campaign = await this.campaignService.getCampaignById(
            pendingReward.data.campaignId
          );

          if (campaign.statusCode != 200) {
            throw new NotFoundException(EventHandlerErrors.CAMPAIGN_NOT_FOUND);
          }

          if (campaign.data.isFollowerOnly) {
            const followedData =
              await this.lensApiService.getProfileAFollowedByProfileB(
                pendingReward.data.profileId,
                pendingReward.data.profileIdPointed
              );

            if (followedData.statusCode != 200) {
              throw new NotFoundException(
                EventHandlerErrors.CANT_GET_FOLLOWED_DATA
              );
            }

            if (!followedData.data.isFollowing) {
              followingPostCreatorChecked = false;
            }
          }

          if (campaign.data.minFollower > 0 && followerCountChecked) {
            const followerCountData =
              await this.lensApiService.getFollowersCount(
                pendingReward.data.profileId
              );

            if (followerCountData.statusCode != 200) {
              throw new NotFoundException(EventHandlerErrors.IS_FOLLOWING);
            }
            if (
              followerCountData.data.totalFollowers < campaign.data.minFollower
            ) {
              followerCountChecked = false;
            }
          }
        }

        // //check if condition pass
        if (
          mirrorExistanseChecked &&
          followingPostCreatorChecked &&
          followerCountChecked
        ) {
          const session = await this.connection.startSession();
          await session.startTransaction();
          try {
            await this.userService.setUserBalance(
              pendingReward.data.from.toLowerCase(),
              BigNumber(pendingReward.data.amount).times(CONFIG.TREE_PRICE),
              session
            );

            await this.campaignService.updateCampaignAwardedCount(
              pendingReward.data.campaignId,
              pendingReward.data.amount,
              session
            );

            await this.pendingRewardService.updatePendingRewardStatus(
              pendingReward.data._id,
              RewardStatus.CONFIRMED,
              session
            );
            //if

            if (
              campaign.data.awardedCount + pendingReward.data.amount >=
              campaign.data.campaignSize
            ) {
              await this.campaignService.updateCampaignStatus(
                campaign.data._id,
                CampaignStatus.FINISHED,
                session
              );
            }
            let result = await this.web3Service.distributeReward(
              pendingReward.data.from,
              pendingReward.data.to,
              pendingReward.data.amount
            );

            await session.commitTransaction();

            session.endSession();

            return responseHandler(200, "user balance updated");
          } catch (e) {
            await session.abortTransaction();

            session.endSession();

            throw new InternalServerErrorException(e);
          }
        } else {
          let newPendingReward =
            await this.pendingRewardService.getFirstPendingRewardToReward(
              pendingReward.data.campaignId
            );

          //updatePendingReward inList to true

          if (newPendingReward.statusCode == 200) {
            const session1 = await this.connection.startSession();
            await session1.startTransaction();

            ///////////////////////////////////////////////////////////////////////////////////
            try {
              await this.pendingRewardService.addPendingRewardToList(
                newPendingReward.data._id.toString(),
                session1
              );

              let now = new Date();
              let createdTime = new Date(newPendingReward.data.createdAt);

              let newDelay = Math.max(
                Numbers.REWARD_DELAY - (now.getTime() - createdTime.getTime()),
                0
              );

              await this.addRewardToQueue(
                newPendingReward.data._id.toString(),
                newDelay
              );

              await session1.commitTransaction();

              session1.endSession();

              return responseHandler(200, "user balance updated");
            } catch (e) {
              console.log("errrrr", e);

              await session1.abortTransaction();

              session1.endSession();

              throw new InternalServerErrorException(e);
            }

            /////////////////////////////////////////////////////////////////////

            //add first inList=false to queue and change its inList to true for this campaign
          }
        }

        failed = false;
      } catch (error) {
        retryCount++;
        if (retryCount == 2) {
          console.log("limit reached");

          await job.retry();
        } else {
          await this.sleep(500);
        }
      }
    }

    // try {
    //   console.log(`Sending email to: ${data.email}`);

    //   console.log("asad", job.attemptsMade);

    //   throw new InternalServerErrorException();
    // } catch (error) {
    //   if (job.attemptsMade >= 2) {
    //     job.queue.add(
    //       "send",
    //       {
    //         email: "recipient@example.com",
    //         subject: "Hello from NestJS Queue",
    //         content: "This is a test email sent via NestJS queue.",
    //       },
    //       { delay: 10000 }
    //     );
    //     // Job has reached maximum retries, do something or log the error
    //     console.error(`Job failed after ${job.attemptsMade} attempts.`);
    //   } else {
    //     // Retry the job

    //     await job.retry();
    //   }
    // }
    // Your email sending logic here
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

@Processor("pendingWithdraw")
export class WithdrawJobService {
  constructor(
    @InjectQueue("pendingWithdraw") private readonly withdrawsQueue: Queue,
    @InjectQueue("rewards") private readonly rewardsQueue: Queue
  ) {}

  async addWithdrawRequestToQueue(pendingWithdrawId: string): Promise<IResult> {
    await this.withdrawsQueue.add("withdraw", pendingWithdrawId);
    return responseHandler(200, "added to queue");
  }

  async addRewardToQueue(
    pendingRewardId: string,
    delay?: number
  ): Promise<IResult> {
    try {
      await this.rewardsQueue.add("distribute", pendingRewardId, { delay: 0 });
    } catch (error) {
      console.log("error", error);
    }

    return responseHandler(200, "added to queue");
  }
}
