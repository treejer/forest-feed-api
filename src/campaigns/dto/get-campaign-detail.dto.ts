import { ApiResponseProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { PendingRewardResultDTO } from 'src/pendingReward/dto';

export class GetCampaignDetailDto {
  @ApiResponseProperty()
  @IsString()
  title: string;

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
  @IsString()
  publicationId: string;

  @ApiResponseProperty()
  @IsDate()
  createdAt: Date;

  @ApiResponseProperty()
  @IsDate()
  updatedAt: Date;

  @ApiResponseProperty({ type: [PendingRewardResultDTO] })
  pendingRewards: PendingRewardResultDTO[];
}
