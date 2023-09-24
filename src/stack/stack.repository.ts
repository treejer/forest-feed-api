import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Stack, StackDocument } from "./schemas";
import { Model } from "mongoose";
import { EntityRepository } from "src/database/database.repository";

@Injectable()
export class StackRepository extends EntityRepository<StackDocument> {
  constructor(
    @InjectModel(Stack.name)
    stackModel: Model<StackDocument>
  ) {
    super(stackModel);
  }
}
