import { ApiResponseProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";
import BigNumber from 'bignumber.js';

export class GetUserMeDto {
  @IsString()
  @ApiResponseProperty()
  id?: string;

  @IsString()
  @ApiResponseProperty()
  walletAddress: string;

  @IsNumber()
  @ApiResponseProperty()
  totalBalance: BigNumber;

  @IsDate()
  @ApiResponseProperty()
  createdAt: Date;

  @IsDate()
  @ApiResponseProperty()
  updatedAt: Date;
}
