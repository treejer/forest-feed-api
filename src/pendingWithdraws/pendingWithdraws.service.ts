import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import BigNumber from "bignumber.js";
import { ClientSession, Connection } from "mongoose";
import { JwtUserDto } from "src/auth/dtos";
import { CONFIG, pendingWithdrawsErrorMessage } from "src/common/constants";
import { responseHandler, resultHandler } from "src/common/helpers";
import { CampaignService } from "./../campaigns/campaign.service";
import { UserService } from "./../user/user.service";
import { CreatePendingWithdrawDTO } from "./dto";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { PendingWithdraw } from "./schemas";
import { Result } from "src/database/interfaces/result.interface";
import { QueueService } from "src/queue/queue.service";
@Injectable()
export class PendingWithdrawService {
  constructor(
    private pendingWithdrawRepository: PendingWithdrawRepository,
    private userService: UserService,

    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
    @Inject(forwardRef(() => QueueService))
    private queueService: QueueService,
    @InjectConnection() private connection: Connection
  ) {}

  async createPendingRewards(input: CreatePendingWithdrawDTO) {
    await this.pendingWithdrawRepository.create({ ...input });
  }

  async getPendingWithdrawsForCreator(
    recipient: string
  ): Promise<PendingWithdraw[]> {
    return await this.pendingWithdrawRepository.find({
      isDistributed: false,
      recipient,
    });
  }

  async getPendingWithdrawWithId(id: string): Promise<Result<PendingWithdraw>> {
    let result = await this.pendingWithdrawRepository.findOne({
      _id: id,
      isDistributed: false,
    });

    if (!result) {
      return resultHandler(404, "pending withdraw not found", undefined);
    }

    return resultHandler(200, "pending withdraw data", result);
  }

  async updatePendingWithdrawStatus(
    id: string,
    isDistributed: boolean,
    session?: ClientSession
  ) {
    await this.pendingWithdrawRepository.updateOne(
      { _id: id },
      { isDistributed },
      [],
      session
    );
  }

  async withderawRequest(amount: BigNumber, jwtInput: JwtUserDto) {
    if (amount.isLessThanOrEqualTo(0)) {
      throw new BadRequestException(
        pendingWithdrawsErrorMessage.AMOUNT_IS_NOT_TRUE
      );
    }

    const user = await this.userService.findUserByWallet(
      jwtInput.walletAddress
    );

    const totalBalance = user.data.totalBalance;

    const activeCampaignsCapacity =
      await this.campaignService.getActiveCampaignsTotalCapacityByCreator(
        jwtInput.walletAddress
      );

    console.log("activeCampaignsCapacity", activeCampaignsCapacity);

    const notDistributedPendingRewardsForDeactiveCampaigns =
      await this.campaignService.getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
        jwtInput.walletAddress
      );

    console.log(
      "notDistributedPendingRewardsForDeactiveCampaigns",
      notDistributedPendingRewardsForDeactiveCampaigns
    );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      jwtInput.walletAddress
    );

    console.log("totalPendingWithdraw", totalPendingWithdraw);

    const remainingBalance = BigNumber(totalBalance).minus(
      BigNumber(
        BigNumber(activeCampaignsCapacity)
          .plus(notDistributedPendingRewardsForDeactiveCampaigns)
          .times(CONFIG.TREE_PRICE)
      ).plus(totalPendingWithdraw)
    );

    if (remainingBalance.isGreaterThanOrEqualTo(amount)) {
      const session = await this.connection.startSession();

      await session.startTransaction();

      try {
        let withdrawPending = await this.pendingWithdrawRepository.create(
          { recipient: jwtInput.walletAddress, amount: amount },
          session
        );

        await this.queueService.addWithdrawRequestToQueue(
          withdrawPending._id.toString()
        );

        await session.commitTransaction();

        session.endSession();

        return responseHandler(200, "withdraw request added successfully");
      } catch (e) {
        await session.abortTransaction();

        session.endSession();

        throw new InternalServerErrorException(e);
      }
    } else {
      throw new BadRequestException(
        pendingWithdrawsErrorMessage.INSUFFICIENT_ERROR
      );
    }
  }

  public async getPendingWithdrawsCapacity(
    creator: string
  ): Promise<BigNumber> {
    let total = new BigNumber(0);

    const result = await this.getPendingWithdrawsForCreator(creator);

    for (let index = 0; index < result.length; index++) {
      total = BigNumber(total).plus(BigNumber(result[index].amount));
    }

    return total;
  }
}
