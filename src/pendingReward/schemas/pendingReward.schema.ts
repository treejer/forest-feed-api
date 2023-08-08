import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PendingRewardDocument = PendingReward & Document;

@Schema()
export class PendingReward extends Document {
  @Prop({ type: String, required: true })
  from;

  @Prop({ type: String, required: true })
  to;

  @Prop({ type: Number, required: true })
  amount;

  @Prop({ type: String, required: true })
  campaignId;

  @Prop({ type: Boolean, default: false, required: true })
  isDistributed;

  @Prop({ type: Boolean, required: true })
  inList;

  @Prop({ type: Number, required: true })
  order;

  @Prop({ type: Number, required: true })
  status;

  @Prop({ type: Date, default: new Date(), required: true })
  createdAt;

  @Prop({ type: Date, default: new Date(), required: true })
  updatedAt;
}

export const PendingRewardSchema = SchemaFactory.createForClass(PendingReward);
