import { Injectable } from "@nestjs/common";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { PendingWithdraw } from "./schemas";
import { CreatePendingWithdrawDTO } from "./dto";

@Injectable()
export class PendingWithdrawService {
  constructor(private pendingWithdrawRepository: PendingWithdrawRepository) {}

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
}
