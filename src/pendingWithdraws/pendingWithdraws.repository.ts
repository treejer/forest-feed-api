import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PendingWithdraw, PendingWithdrawDocument } from "./schemas";
import { Model } from "mongoose";
import { EntityRepository } from "../database/database.repository";
@Injectable()
export class PendingWithdrawRepository extends EntityRepository<PendingWithdrawDocument> {
  constructor(
    @InjectModel(PendingWithdraw.name)
    pendingWithdrawModel: Model<PendingWithdrawDocument>
  ) {
    super(pendingWithdrawModel);
  }
}
