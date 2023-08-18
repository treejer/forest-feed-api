import { IsBoolean, IsString } from "class-validator";

export class MirroredPublicationWithDetailResultDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsBoolean()
  deleted: boolean;
}
