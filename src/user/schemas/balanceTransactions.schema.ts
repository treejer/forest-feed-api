import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BalanceTransactionDocument = BalanceTransaction & Document;

@Schema()
export class BalanceTransaction extends Document {
  @Prop({ type: String, required: true })
  userId;

  @Prop({ type: String,unique:true,required:true })
  transactionHash;
}

export const BalanceTransactionSchema = SchemaFactory.createForClass(BalanceTransaction);
