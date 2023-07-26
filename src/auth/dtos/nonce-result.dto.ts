import { ApiResponseProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IResult } from "src/database/interfaces/IResult.interface";
import { GetNonceDto } from "./get-nonce.dto";

export class NonceResultDto extends IResult {
  @ApiResponseProperty()
  data: GetNonceDto;
}
