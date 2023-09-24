import { Body, Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LensApiService } from "./lens-api.service";
import {
  getDATransactionsQuery,
  getPublicationOwnerQuery,
} from "src/common/graphQuery";
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

  @ApiOperation({ summary: "get publication owner" })
  @Get("/publication/:publication_id/")
  getPublicationOwner(@Param("publication_id") publication_id: string) {
    return this.lensApiService.getPublicationOwner(publication_id);
  }

  @ApiOperation({ summary: "get publication owner" })
  @Get("/DATransactions/:cursor/:limit")
  getDATransactions(
    @Param("cursor") cursor: string,
    @Param("limit") limit: string
  ) {
    console.log("limit", limit);

    const tempCursor = cursor ? cursor : null;
    return this.lensApiService.getDATransactions(tempCursor, Number(limit));
  }
}
