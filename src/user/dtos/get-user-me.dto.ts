import { ApiResponseProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";

export class GetUserMeDto {
  @IsString()
  @ApiResponseProperty()
  id?: string;

  @IsString()
  @ApiResponseProperty()
  walletAddress: string;

  @IsNumber()
  @ApiResponseProperty()
  totalBalance: number;

  @IsDate()
  @ApiResponseProperty()
  createdAt: Date;

  @IsDate()
  @ApiResponseProperty()
  updatedAt: Date;
}
