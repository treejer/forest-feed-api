import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PendingReward, PendingRewardDocument } from "./schemas";
import { Model } from "mongoose";
import { EntityRepository } from "../database/database.repository";
@Injectable()
export class PendingRewardRepository extends EntityRepository<PendingRewardDocument> {
  constructor(
    @InjectModel(PendingReward.name)
    pendingRewardModel: Model<PendingRewardDocument>
  ) {
    super(pendingRewardModel);
  }
}
