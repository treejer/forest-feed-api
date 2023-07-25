import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LastStateRepository } from "./lastState.repository";
import { CreateResult, EditResult } from "./interfaces";

@Injectable()
export class EventService {
  constructor(
    private lastStateRepository: LastStateRepository
  ) {}

  async saveLastState(
    id:string,
    lastBlockNumber: number
  ): Promise<EditResult> {
    let lastState = await this.lastStateRepository.findOne({id}, { _id: 1 });
    let result;


    result = await this.lastStateRepository.updateOne(
      { _id: lastState._id },
      { lastBlockNumber }
    );

    return { acknowledged: result.acknowledged };
  }

  async loadLastState(id:string): Promise<number> {
    let result = await this.lastStateRepository.findOne(
      {_id:id},
      { lastBlockNumber: 1, _id: 0 }
    );

    return result ? result.lastBlockNumber : 1;
  }
}
