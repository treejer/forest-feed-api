import { ApiResponseProperty } from "@nestjs/swagger";
import { IResult } from "src/database/interfaces/IResult.interface";
import { GetLoginDto } from "./get-login.dto";

export class LoginResultDto extends IResult {
  @ApiResponseProperty()
  data: GetLoginDto;
}
