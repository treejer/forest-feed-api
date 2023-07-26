import { ApiResponseProperty } from "@nestjs/swagger";
import { IResult } from "src/database/interfaces/IResult.interface";
import { GetMyRewardsDto } from "./get-my-rewards.dto";

export class MyRewardsResultDto extends IResult {
  @ApiResponseProperty()
  data: GetMyRewardsDto;
}
