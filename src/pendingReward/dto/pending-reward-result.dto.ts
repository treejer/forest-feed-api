import { ApiResponseProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class PendingRewardResultDTO {
  @ApiResponseProperty()
  @IsString()
  _id: string;
  @ApiResponseProperty()
  @IsString()
  from: string;
  @ApiResponseProperty()
  @IsString()
  to: string;
  @ApiResponseProperty()
  @IsNumber()
  amount: number;
  @ApiResponseProperty()
  @IsString()
  campaignId: string;
  @ApiResponseProperty()
  @IsBoolean()
  isDistributed: boolean;
  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty()
  @IsDate()
  updatedAt: Date;
}
