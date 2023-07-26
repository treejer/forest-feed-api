import { ApiResponseProperty } from "@nestjs/swagger";
import { GetCampaignDetailDto } from "./get-campaign-detail.dto";
import { IResult } from "src/database/interfaces/IResult.interface";

export class CampaignDetailResultDto extends IResult {
  @ApiResponseProperty()
  data: GetCampaignDetailDto;
}
