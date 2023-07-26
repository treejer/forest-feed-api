import { ApiResponseProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { GetCampaignWithPaginateDto } from "./get-campaign-with-paginate.dto";

export class GetMyCampaignDto {
  @ApiResponseProperty({ type: [GetCampaignWithPaginateDto] })
  @IsArray()
  campaignList: GetCampaignWithPaginateDto[];

  @ApiResponseProperty()
  @IsNumber()
  count: number;
}
