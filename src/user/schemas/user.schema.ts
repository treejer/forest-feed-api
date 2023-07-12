import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role, UserStatus } from "src/common/constants";

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ type: String, unique: true, required: true })
  walletAddress;

  @Prop({ type: Number, required: true })
  nonce;

  @Prop({ type: Date, default: Date.now, required: true })
  createdAt;

  @Prop({ type: Number, default: Role.USER, required: true })
  userRole;

  @Prop({ type: Date, default: Date.now, required: true })
  updatedAt;

  @Prop({ type: String })
  firstName;

  @Prop({ type: String })
  lastName;
}

export const UserSchema = SchemaFactory.createForClass(User);
