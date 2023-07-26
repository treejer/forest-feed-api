import { ApiResponseProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { PendingRewardResultDTO } from "./pending-reward-result.dto";

export class GetMyRewardsDto {
  @ApiResponseProperty({ type: [PendingRewardResultDTO] })
  @IsArray()
  pendingRewardList: PendingRewardResultDTO[];

  @ApiResponseProperty()
  @IsNumber()
  count: number;
}
