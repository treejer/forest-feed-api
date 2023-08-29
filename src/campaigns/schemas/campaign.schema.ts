import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CampaignStatus } from "../enum";

export type CampaignDocument = Campaign & Document;

@Schema()
export class Campaign extends Document {
  @Prop({ type: String, required: true })
  title;

  @Prop({ type: String, required: true })
  publicationId;

  @Prop({ type: String, required: true })
  creator;

  @Prop({
    type: Number,
    required: true,
    default: CampaignStatus.ACTIVE,
    enum: CampaignStatus,
  })
  status;

  @Prop({ type: Boolean, default: false, required: true })
  isFollowerOnly;

  @Prop({ type: Number, default: 0, required: true })
  minFollower;

  @Prop({ type: Number, default: 0, required: true })
  awardedCount;

  @Prop({ type: Number, required: true })
  campaignSize;

  @Prop({ type: Date, default: () => new Date(), required: true })
  createdAt;

  @Prop({ type: Date, default: () => new Date(), required: true })
  updatedAt;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
