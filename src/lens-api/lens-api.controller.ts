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
}
