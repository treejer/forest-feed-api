import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import BigNumber from "bignumber.js";
import { Document } from "mongoose";

export type PendingWithdrawDocument = PendingWithdraw & Document;

@Schema()
export class PendingWithdraw extends Document {
  @Prop({ type: String, required: true })
  recipient;

  @Prop({ type: BigNumber, required: true })
  amount;

  @Prop({ type: Boolean, default: false, required: true })
  isDistributed;

  @Prop({ type: Date, default: new Date(), required: true })
  createdAt;

  @Prop({ type: Date, default: new Date(), required: true })
  updatedAt;
}

export const PendingWithdrawSchema =
  SchemaFactory.createForClass(PendingWithdraw);
