import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RejectedRewardDocument = RejectedReward & Document;

@Schema()
export class RejectedReward extends Document {
  @Prop({ type: String, required: true })
  from;

  @Prop({ type: String, required: true })
  to;

  @Prop({ type: Number, required: true })
  amount;

  @Prop({ type: String, required: true })
  campaignId;

  @Prop({ type: Date, default: new Date(), required: true })
  createdAt;
}

export const RejectedRewardSchema =
  SchemaFactory.createForClass(RejectedReward);
