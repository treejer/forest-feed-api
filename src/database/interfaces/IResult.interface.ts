import { ApiResponseProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class IResult {
  @ApiResponseProperty()
  @IsNumber()
  statusCode: number;

  @ApiResponseProperty()
  @IsString()
  message: string;
}
