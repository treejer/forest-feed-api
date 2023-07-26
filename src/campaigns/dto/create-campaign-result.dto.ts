import { ApiResponseProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IResult } from "src/database/interfaces/IResult.interface";
import { GetCreateCampaignDto } from "./get-create-campaign.dto";

export class CreateCampaignResultDto extends IResult {
  @ApiResponseProperty()
  @IsString()
  data: GetCreateCampaignDto;
}
