import { Injectable } from "@nestjs/common";

import { resultHandler } from "src/common/helpers";

import { StackRepository } from "./stack.repository";
import { CreateStackDto } from "./dto";
import { StackResponseDto } from "./dto";
import { Result } from "src/database/interfaces/result.interface";
import { UpdateStackDto } from "./dto";
import { LastStateIds } from "src/common/constants";
import { Types } from "mongoose";

@Injectable()
export class StackService {
  constructor(private stackRepository: StackRepository) {}

  async createStack(input: CreateStackDto): Promise<Result<StackResponseDto>> {
    const createdData = await this.stackRepository.create({
      ...input,
    });
    return resultHandler(200, "stack created", createdData);
  }
  async getStackItemsById(): Promise<Result<string[]>> {
    const data = await this.stackRepository.findOne({
      _id: LastStateIds.STACK_ID,
    });

    const data2 = await this.stackRepository.find({});

    console.log("data", data2, data, LastStateIds.STACK_ID);

    return resultHandler(200, "stack items", data.items);
  }

  async getLastTransaction(): Promise<Result<string>> {
    const data = await this.stackRepository.findOne({
      _id: LastStateIds.STACK_ID,
    });

    return resultHandler(200, "stack items", data.lastTransaction);
  }
  async updateStackDataById(
    data: UpdateStackDto
  ): Promise<Result<StackResponseDto>> {
    const result = await this.stackRepository.updateOne(
      { _id: LastStateIds.STACK_ID },
      data
    );

    return resultHandler(200, "stack updated", data.items);
  }
}
