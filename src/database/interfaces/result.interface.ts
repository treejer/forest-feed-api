import { ApiResponseProperty } from "@nestjs/swagger";
import { IResult } from "./IResult.interface";

export class Result<T> extends IResult {
  @ApiResponseProperty()
  data: T;
}
