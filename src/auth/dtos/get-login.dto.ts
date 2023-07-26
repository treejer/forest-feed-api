import { ApiResponseProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetLoginDto {
  @ApiResponseProperty()
  @IsString()
  access_token: string;
}
