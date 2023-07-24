import { ApiResponseProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class CampaignResultDto {
  @ApiResponseProperty()
  @IsString()
  _id: string;

  @ApiResponseProperty()
  @IsString()
  publicationId: string;

  @ApiResponseProperty()
  @IsString()
  creator: string;

  @ApiResponseProperty()
  @IsNumber()
  status: number;

  @ApiResponseProperty()
  @IsBoolean()
  isFollowerOnly: boolean;
  @ApiResponseProperty()
  @IsNumber()
  minFollower: number;
  @ApiResponseProperty()
  @IsNumber()
  awardedCount: number;
  @ApiResponseProperty()
  @IsNumber()
  campaignSize: number;
  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty()
  @IsDate()
  updatedAt: Date;
}
