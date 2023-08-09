import { IsBoolean, IsString } from "class-validator";

export class FollowingDataResultDto {
  @IsBoolean()
  isFollowing: boolean;
}
