import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import BigNumber from "bignumber.js";
import { Connection } from "mongoose";
import { JwtUserDto } from "src/auth/dtos";
import { CONFIG, pendingWithdrawsErrorMessage } from "src/common/constants";
import { responseHandler } from "src/common/helpers";
import { WithdrawJobService } from "src/queue/queue.service";
import { CampaignService } from "./../campaigns/campaign.service";
import { UserService } from "./../user/user.service";
import { CreatePendingWithdrawDTO } from "./dto";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { PendingWithdraw } from "./schemas";
@Injectable()
export class PendingWithdrawService {
  constructor(
    private pendingWithdrawRepository: PendingWithdrawRepository,
    private userService: UserService,
    private withdrawJobService: WithdrawJobService,
    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
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

  async withderawRequest(amount: BigNumber, jwtInput: JwtUserDto) {
    const user = await this.userService.findUserByWallet(
      jwtInput.walletAddress
    );

    const totalBalance = user.data.totalBalance;

    const activeCampaignsCapacity =
      await this.campaignService.getActiveCampaignsTotalCapacityByCreator(
        jwtInput.walletAddress
      );

    const notDistributedPendingRewardsForDeactiveCampaigns =
      await this.campaignService.getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
        jwtInput.walletAddress
      );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      jwtInput.walletAddress
    );

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

        this.withdrawJobService.addWithdrawRequestToQueue(withdrawPending._id);

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
    let total = BigNumber(0);

    const result = await this.getPendingWithdrawsForCreator(creator);

    for (let index = 0; index < result.length; index++) {
      total.plus(result[index].amount);
    }

    return total;
  }
}
