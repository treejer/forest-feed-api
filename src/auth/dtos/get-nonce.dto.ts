import { ApiResponseProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetNonceDto {
  @ApiResponseProperty()
  @IsString()
  message: string;

  @ApiResponseProperty()
  @IsString()
  userId: string;
}
