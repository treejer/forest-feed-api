import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AuthErrorMessages,
  CampaignErrorMessage,
  SwaggerErrors,
} from "src/common/constants";
import { AuthGuard } from "@nestjs/passport";
import { JwtUserDto } from "src/auth/dtos";
import { User } from "src/user/decorators";

import { PendingRewardService } from "./pendingReward.service";
import { MyRewardsResultDto } from "./dto";
@ApiTags("reward")
@Controller()
export class PendingRewardController {
  constructor(private pendingRewardService: PendingRewardService) {}

  //-------------------------------------------------------------------------------
  @ApiBearerAuth()
  @ApiOperation({ summary: "get rewards for login user" })
  @ApiResponse({
    status: 200,
    description: "get rewards of user",
    type: MyRewardsResultDto,
  })
  @ApiResponse({
    status: 401,
    description: SwaggerErrors.UNAUTHORIZED_DESCRIPTION,
    content: {
      "text/plain": {
        schema: { format: "text/plain", example: SwaggerErrors.UNAUTHORIZED },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: SwaggerErrors.INTERNAL_SERVER_ERROR_DESCRIPTION,
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: SwaggerErrors.INTERNAL_SERVER_ERROR,
        },
      },
    },
  })
  @UseGuards(AuthGuard("jwt"))
  @Get("reward/my-reward")
  getMyCampaigns(
    @User() user: JwtUserDto,
    @Query("skip") skip: number,
    @Query("limit") limit: number
  ) {
    return this.pendingRewardService.getMyRewards(user, skip, limit);
  }

  @Get("reward/ali")
  getAli() {
    return this.pendingRewardService.getFirstPendingRewardToReward();
  }
}
