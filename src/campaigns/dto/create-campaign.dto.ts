import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  publicationId: string;

  @ApiProperty()
  @IsBoolean()
  isFollowerOnly: boolean;

  @ApiProperty()
  @IsNumber()
  minFollower: number;

  @ApiProperty()
  @IsNumber()
  campaignSize: number;
}
