import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BalanceTransaction, BalanceTransactionDocument } from "./schemas";
import { Model } from "mongoose";
import { EntityRepository } from "src/database/database.repository";

@Injectable()
export class BalanceTransactionRepository extends EntityRepository<BalanceTransactionDocument> {
  constructor(@InjectModel(BalanceTransaction.name) balanceTransactionModel: Model<BalanceTransactionDocument>) {
    super(balanceTransactionModel);
  }
}
