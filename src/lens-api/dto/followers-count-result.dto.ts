import { IsString } from "class-validator";

export class FollowersCountResultDto {
  @IsString()
  totalFollowers: string;
}
