import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
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
import { CampaignService } from "./campaign.service";
import { AuthGuard } from "@nestjs/passport";
import { JwtUserDto } from "src/auth/dtos";
import { User } from "src/user/decorators";
import { CreateCampaignResultDto, CreateCampaignDto } from "./dto";
@ApiTags("campaign")
@Controller()
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  //------------------------------------------ ************************ ------------------------------------------//
  @ApiOperation({ summary: "create campaign" })
  @ApiResponse({
    status: 201,
    description: "campaign successfully created",
    type: CreateCampaignResultDto,
  })
  @ApiResponse({
    status: 400,
    description: SwaggerErrors.INVALID_INPUT_DESCRIPTION,
    content: {
      "text/plain": {
        schema: { format: "text/plain", example: SwaggerErrors.INVALID_INPUT },
      },
    },
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
    status: 403,
    description: "Response for Invalid access or capacity error.",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: [
            CampaignErrorMessage.CREATOR_IS_NOT_OWNER,
            CampaignErrorMessage.CAMPAIGNS_SIZE_IS_MORE_THAN_YOUR_CAPACITY,
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "active publication exists",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: CampaignErrorMessage.PUBLICATION_HAS_ACTIVE_CAMPAIGN,
        },
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post("campaign")
  createCampaign(@Body() dto: CreateCampaignDto, @User() user: JwtUserDto) {
    return this.campaignService.createCampaign(dto, user);
  }
  //-------------------------------------------------------------------------------
  @ApiOperation({ summary: "activate campaign" })
  @ApiResponse({
    status: 201,
    description: "campaign activated successfully",
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
    status: 403,
    description: "Response for Invalid access or capacity error.",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: [
            CampaignErrorMessage.CALLER_IS_NOT_CAMPAIGN_CREATOR,
            CampaignErrorMessage.CAMPAIGNS_SIZE_IS_MORE_THAN_YOUR_CAPACITY,
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "active publication exists",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: CampaignErrorMessage.PUBLICATION_HAS_ACTIVE_CAMPAIGN,
        },
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post("campaign/:id/activate")
  activateCampaign(@Param() id: string, @User() user: JwtUserDto) {
    return this.campaignService.activateCampaign(id, user);
  }

  //-------------------------------------------------------------------------------
  @ApiOperation({ summary: "deactivate campaign" })
  @ApiResponse({
    status: 201,
    description: "campaign deactivated successfully",
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
    status: 403,
    description: "Response for Invalid access or capacity error.",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: [CampaignErrorMessage.CALLER_IS_NOT_CAMPAIGN_CREATOR],
        },
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post("campaign/:id/deactivate")
  deactivateCampaign(
    @Param("id") campaignId: string,
    @User() user: JwtUserDto
  ) {
    return this.campaignService.deactivateCampaign(campaignId, user);
  }
}
