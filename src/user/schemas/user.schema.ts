import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/common/constants";
import BigNumber from 'bignumber.js';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ type: String, unique: true, required: true })
  walletAddress;

  @Prop({ type: Number, required: true })
  nonce;

  @Prop({ type: BigNumber, default: 0, required: true })
  totalBalance;

  @Prop({ type: Number, default: Role.USER, required: true })
  userRole;

  @Prop({ type: Date, default: Date.now, required: true })
  createdAt;

  @Prop({ type: Date, default: Date.now, required: true })
  updatedAt;
}

export const UserSchema = SchemaFactory.createForClass(User);
