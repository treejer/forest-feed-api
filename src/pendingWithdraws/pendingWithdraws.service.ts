import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { PendingWithdraw } from "./schemas";
import { CreatePendingWithdrawDTO } from "./dto";
import BigNumber from "bignumber.js"
import { JwtUserDto } from "src/auth/dtos";
import { UserService } from "./../user/user.service";
import {CampaignService} from "./../campaigns/campaign.service"
import { CONFIG, pendingWithdrawsErrorMessage } from "src/common/constants";
@Injectable()
export class PendingWithdrawService {
  constructor(private pendingWithdrawRepository: PendingWithdrawRepository,
              private userService:UserService,
              @Inject(forwardRef(() => CampaignService)) private campaignService:CampaignService) {}

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

  async withderawRequest(amount:BigNumber,jwtInput: JwtUserDto){

    
    const user = await this.userService.findUserByWallet(jwtInput.walletAddress);

    const totalBalance = user.data.totalBalance;

    const activeCampaignsCapacity =
    await this.campaignService.getActiveCampaignsTotalCapacityByCreator(jwtInput.walletAddress);

    const notDistributedPendingRewardsForDeactiveCampaigns =
    await this.campaignService.getNotDistributedPendingRewardsCapacityForDeactiveCampaignsByCreator(
      jwtInput.walletAddress
    );

    const totalPendingWithdraw = await this.getPendingWithdrawsCapacity(
      jwtInput.walletAddress
    );

    const remainingBalance = BigNumber(totalBalance).minus(BigNumber(BigNumber(activeCampaignsCapacity).plus(notDistributedPendingRewardsForDeactiveCampaigns).times(CONFIG.TREE_PRICE)).plus(totalPendingWithdraw)) 
    
    if(remainingBalance.isGreaterThanOrEqualTo(amount)){
      
    }else{
      throw new BadRequestException(pendingWithdrawsErrorMessage.INSUFFICIENT_ERROR)
    }

  }


  public async getPendingWithdrawsCapacity(creator: string): Promise<BigNumber> {
    let total = BigNumber(0);
    
    const result =
      await this.getPendingWithdrawsForCreator(creator);

    for (let index = 0; index < result.length; index++) {
      total.plus(result[index].amount);
    }

    return total;
  }
}
