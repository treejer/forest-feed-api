import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PendingRewardDocument = PendingReward & Document;

@Schema()
export class PendingReward extends Document {
  @Prop({ type: String, required: true })
  campaignId;

  @Prop({ type: String, required: true })
  from;

  @Prop({ type: String, required: true })
  to;

  @Prop({ type: Number, required: true })
  count;

  @Prop({ type: Boolean, default: false, required: true })
  isDistributed;

  @Prop({ type: Date, default: new Date(), required: true })
  createdAt;
}

export const PendingRewardSchema = SchemaFactory.createForClass(PendingReward);
