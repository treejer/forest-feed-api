import { ApiResponseProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";
import { PendingRewardResultDTO } from "src/pendingReward/dto";
import { PendingReward } from "src/pendingReward/schemas";

export class CampaignDetailResultDto {
  @ApiResponseProperty()
  @IsNumber()
  campaignSize: number;

  @ApiResponseProperty()
  @IsNumber()
  awardedCount: number;

  @ApiResponseProperty()
  @IsBoolean()
  isFollowerOnly: boolean;

  @ApiResponseProperty()
  @IsNumber()
  minimumFollower: number;

  @ApiResponseProperty()
  @IsNumber()
  status: number;

  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty()
  @IsDate()
  updatedAt: Date;
  @ApiResponseProperty({ type: [PendingRewardResultDTO] })
  pendingRewards: PendingRewardResultDTO[];
}
