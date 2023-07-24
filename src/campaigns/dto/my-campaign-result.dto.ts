import { ApiResponseProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { CampaignResultDto } from "./campaign-result.dto";

export class MyCampaignResultDto {
  @ApiResponseProperty({ type: [CampaignResultDto] })
  @IsArray()
  data: CampaignResultDto[];

  @ApiResponseProperty()
  @IsNumber()
  count: number;
}
