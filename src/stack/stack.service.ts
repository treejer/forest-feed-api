import { Injectable } from "@nestjs/common";

import { responseHandler, resultHandler } from "src/common/helpers";

import { StackRepository } from "./stack.repository";
import { CreateStackDto } from "./dto";

import { StackResponseDto } from "./dto";
import { Result } from "src/database/interfaces/result.interface";
import { UpdateStackDto } from "./dto";

@Injectable()
export class StackService {
  constructor(private stackRepository: StackRepository) {}

  async createStack(input: CreateStackDto): Promise<Result<StackResponseDto>> {
    const createdData = await this.stackRepository.create({
      ...input,
    });
    return resultHandler(200, "stack created", createdData);
  }
  async getStackItemsById(stackId: string): Promise<Result<StackResponseDto>> {
    const data = await this.stackRepository.findOne({ _id: stackId });

    return resultHandler(200, "stack items", data.items);
  }
  async updateStackDataById(
    stackId: string,
    data: UpdateStackDto
  ): Promise<Result<StackResponseDto>> {
    const result = await this.stackRepository.updateOne({ _id: stackId }, data);

    return resultHandler(200, "stack updated", data.items);
  }
}
