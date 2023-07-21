import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Campaign, CampaignDocument } from "./schemas";
import { Model } from "mongoose";
import { EntityRepository } from "../database/database.repository";
@Injectable()
export class CampaignRepository extends EntityRepository<CampaignDocument> {
  constructor(
    @InjectModel(Campaign.name)
    campaignModel: Model<CampaignDocument>
  ) {
    super(campaignModel);
  }
}
