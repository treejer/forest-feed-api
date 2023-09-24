import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type StackDocument = Stack & Document;

@Schema()
export class Stack extends Document {
  @Prop({ type: String })
  lastTransaction: string;

  @Prop({ type: [String], default: [] })
  items: string[];
}

export const StackSchema = SchemaFactory.createForClass(Stack);
