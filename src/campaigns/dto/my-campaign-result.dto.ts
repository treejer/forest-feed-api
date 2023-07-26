import { ApiResponseProperty } from "@nestjs/swagger";
import { GetCampaignDto } from "./get-campaign.dto";
import { IResult } from "src/database/interfaces/IResult.interface";
import { GetMyCampaignDto } from "./get-my-campaign.dto";

export class MyCampaignResultDto extends IResult {
  @ApiResponseProperty()
  data: GetMyCampaignDto;
}
