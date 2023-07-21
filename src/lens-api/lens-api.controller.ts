import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LensApiService } from "./lens-api.service";
@ApiTags("lens-api")
@Controller("lens-api")
export class LensApiController {
  constructor(private lensApiService: LensApiService) {}

  @ApiOperation({ summary: "get profile data" })
  @Get("/profile/:id/count")
  getProfile(@Param("id") id: string) {
    return this.lensApiService.getFollowersCount(id);
  }

  @ApiOperation({ summary: "get is profile_a followed by profile_b" })
  @Get("/profile/:profile_a/followed-by/:profile_b")
  getProfileAFollowedByProfileB(
    @Param("profile_a") profile_a: string,
    @Param("profile_b") profile_b: string
  ) {
    return this.lensApiService.getProfileAFollowedByProfileB(
      profile_a,
      profile_b
    );
  }
}
