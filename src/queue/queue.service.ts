// send-email.job.ts

import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
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
import { Numbers, RewardStatus } from "src/common/constants";
import { PendingWithdrawService } from "src/pendingWithdraws/pendingWithdraws.service";

@Processor("rewards") // Queue name
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
      await this.rewardsQueue.add("distribute", pendingRewardId, { delay: 0 });
    } catch (error) {
      console.log("errrrrr", error);
    }

    return responseHandler(200, "added to queue");
  }
  @Process("distribute")
  async distributeReward(job: Job<any>) {
    await this.sleep(2000);

    let failed = true;
    let retryCount = 0;
    let okToReward = true;

    const data = job.data;

    while (failed && retryCount < 2) {
      console.log("data", data);

      try {
        // if (data == "2") {
        //   throw new InternalServerErrorException();
        // }

        // if (data == "3" && this.x == 0) {
        //   this.x++;
        //   await this.addRewardToQueue("3");
        // }

        const pendingReward = await this.pendingRewardService.getPendingReward({
          _id: data,
        });
        if (pendingReward.statusCode != 200) {
          throw new InternalServerErrorException();
        }

        const campaign = await this.campaignService.getCampaignById(
          pendingReward.data.campaignId
        );

        if (campaign.statusCode != 200) {
          throw new InternalServerErrorException();
        }

        if (campaign.data.isFollowerOnly) {
          const followedData =
            await this.lensApiService.getProfileAFollowedByProfileB(
              pendingReward.data.profileId,
              pendingReward.data.profileIdPointed
            );

          console.log("followed", followedData);

          if (followedData.statusCode != 200) {
            throw new InternalServerErrorException();
          }

          if (!followedData.data.isFollowing) {
            okToReward = false;
          }
        }

        if (campaign.data.minFollower > 0 && okToReward) {
          const followerCountData = await this.lensApiService.getFollowersCount(
            pendingReward.data.profileId
          );
          console.log("followerCountData", followerCountData);

          if (followerCountData.statusCode != 200) {
            throw new InternalServerErrorException();
          }
          if (
            followerCountData.data.totalFollowers < campaign.data.minFollower
          ) {
            okToReward = false;
          }
        }

        // console.log("pending", pendingReward);
        // //check if condition pass
        if (okToReward) {
          const session = await this.connection.startSession();
          await session.startTransaction();
          try {
            const treePrice = 10 ^ 18;
            await this.userService.setUserBalance(
              pendingReward.data.from,
              BigNumber(pendingReward.data.amount).times(treePrice),
              session
            );

            await this.campaignService.updateCampaignAwardedCount(
              campaign.data._id,
              pendingReward.data.amount,
              session
            );

            await this.pendingRewardService.updatePendingRewardStatus(
              pendingReward.data._id,
              RewardStatus.CONFIRMED,
              session
            );
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
            await this.pendingRewardService.getFirstPendingRewardToReward();
          //updatePendingReward inList to true

          if (newPendingReward.statusCode == 200) {
            await this.pendingRewardService.addPendingRewardToList(
              newPendingReward.data._id
            );

            let now = new Date();
            let createdTime = new Date(newPendingReward.data.createdAt);

            let newDelay = Math.max(
              Numbers.REWARD_DELAY - (now.getTime() - createdTime.getTime()),
              0
            );
            await this.addRewardToQueue(newPendingReward.data._id, newDelay);
            //add first inList=false to queue and change its inList to true for this campaign
          }
        }

        failed = false;
      } catch (error) {
        retryCount++;
        if (retryCount == 2) {
          console.log("aaaa");

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
    private pendingWithdrawService: PendingWithdrawService,
    @InjectConnection() private connection: Connection,
    private web3Service: Web3Service
  ) {}

  async addWithdrawRequestToQueue(pendingWithdrawId: string): Promise<IResult> {
    await this.withdrawsQueue.add("withdraw", pendingWithdrawId);

    return responseHandler(200, "added to queue");
  }

  @Process("withdraw")
  async withdraw(job: Job<any>) {
    let failed = true;
    let retryCount = 0;

    const data = job.data;

    while (failed && retryCount < 2) {
      try {
        //----------------> try to found pending withdraw request (if found error goto catch,if 404 remove from queue , 200 countinue)

        const pendingWithdraw =
          await this.pendingWithdrawService.getPendingWithdrawWithId(data);

        if (pendingWithdraw.statusCode == 200) {
          //---->  try to call blockchain and update database

          const session = await this.connection.startSession();
          await session.startTransaction();

          try {
            await this.pendingWithdrawService.updatePendingWithdrawStatus(
              data,
              true
            );

            let result = await this.web3Service.distributeWithdraw(
              pendingWithdraw.data.recipient,
              pendingWithdraw.data.amount
            );

            await session.commitTransaction();

            session.endSession();
          } catch (e) {
            await session.abortTransaction();

            session.endSession();

            throw new InternalServerErrorException(e);
          }
        }
      } catch (error) {
        retryCount++;
        if (retryCount == 2) {
          await job.retry();
        } else {
          await this.sleep(500);
        }
      }
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
