import { ApiResponseProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { PendingRewardResultDTO } from "./pending-reward-result.dto";

export class MyRewardsResultDto {
  @ApiResponseProperty({ type: [PendingRewardResultDTO] })
  @IsArray()
  data: PendingRewardResultDTO[];

  @ApiResponseProperty()
  @IsNumber()
  count: number;
}
