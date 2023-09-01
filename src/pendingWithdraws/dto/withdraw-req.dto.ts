import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";
import BigNumber from "bignumber.js";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class WithdrawReqDto {
  @IsString()
  @ApiProperty()
  amount: string;
}
