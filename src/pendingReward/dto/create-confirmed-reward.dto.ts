import { IsString, IsNumber, IsDateString } from "class-validator";

export class CreateConfirmedRewardDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  amount: number;

  @IsString()
  campaignId: string;

  @IsDateString()
  createdAt: Date;
}
