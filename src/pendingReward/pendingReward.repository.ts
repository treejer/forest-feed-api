import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ConfirmedReward,
  ConfirmedRewardDocument,
  PendingReward,
  PendingRewardDocument,
  RejectedReward,
  RejectedRewardDocument,
} from "./schemas";
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

@Injectable()
export class ConfirmedRewardRepository extends EntityRepository<ConfirmedRewardDocument> {
  constructor(
    @InjectModel(ConfirmedReward.name)
    confirmedRewardModel: Model<ConfirmedRewardDocument>
  ) {
    super(confirmedRewardModel);
  }
}
@Injectable()
export class RejectedRewardRepository extends EntityRepository<RejectedRewardDocument> {
  constructor(
    @InjectModel(RejectedReward.name)
    rejectedRewardModel: Model<RejectedRewardDocument>
  ) {
    super(rejectedRewardModel);
  }
}
