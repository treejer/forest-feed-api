import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { CampaignService } from "./campaign.service";
import { AuthGuard } from "@nestjs/passport";
import { JwtUserDto } from "src/auth/dtos";
import { User } from "src/user/decorators";
import { CreateCampaignResultDto, CreateCampaignDto } from "./dto";
import { Campaign } from "./schemas";
import { MyCampaignResultDto } from "./dto/my-campaign-result.dto";
import { CampaignDetailResultDto } from "./dto/campaign-detail-result.dto";
import { IResult } from "src/database/interfaces/IResult.interface";
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
    type: IResult,
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
            CampaignErrorMessage.INVALID_CAMPAIGN_STATUS,
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
  @Patch("campaign/:id/activate")
  activateCampaign(@Param("id") id: string, @User() user: JwtUserDto) {
    return this.campaignService.activateCampaign(id, user);
  }

  //-------------------------------------------------------------------------------
  @ApiOperation({ summary: "deactivate campaign" })
  @ApiResponse({
    status: 201,
    description: "campaign deactivated successfully",
    type: IResult,
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
            CampaignErrorMessage.INVALID_CAMPAIGN_STATUS,
            CampaignErrorMessage.CALLER_IS_NOT_CAMPAIGN_CREATOR,
          ],
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
  @Patch("campaign/:id/deactivate")
  deactivateCampaign(
    @Param("id") campaignId: string,
    @User() user: JwtUserDto
  ) {
    return this.campaignService.deactivateCampaign(campaignId, user);
  }
  //-------------------------------------------------------------------------------
  @ApiBearerAuth()
  @ApiOperation({ summary: "get campaigns for user" })
  @ApiResponse({
    status: 200,
    description: "get campaigns of user",
    type: MyCampaignResultDto,
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
  @ApiQuery({ name: "filters", required: false, type: String })
  @ApiQuery({ name: "sort", required: false, type: String })
  @UseGuards(AuthGuard("jwt"))
  @Get("campaign/my-campaign")
  getMyCampaigns(
    @User() user: JwtUserDto,
    @Query("skip") skip: number,
    @Query("limit") limit: number,
    @Query("filters") filters?: string,
    @Query("sort") sort?: string
  ) {
    if (!filters || filters.length === 0) filters = "{}";
    if (!sort || sort.length === 0) sort = "{}";

    try {
      filters = JSON.parse(decodeURIComponent(filters));
    } catch (error) {
      filters = JSON.parse(decodeURIComponent("{}"));
    }

    try {
      sort = JSON.parse(decodeURIComponent(sort));
    } catch (error) {
      sort = JSON.parse(decodeURIComponent("{}"));
    }

    return this.campaignService.getMyCampaigns(
      user,
      filters,
      skip,
      limit,
      sort
    );
  }

  //-------------------------------------------------------------------------------
  @ApiOperation({ summary: "get campaign detail" })
  @ApiResponse({
    status: 200,
    description: "get campaign detail",
    type: CampaignDetailResultDto,
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
    description: "Response for Invalid access.",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: CampaignErrorMessage.INVALID_ACCESS,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: SwaggerErrors.NOT_FOUND_DESCRIPTION,
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: CampaignErrorMessage.NOT_FOUND,
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
  @Get("campaign/:id/detail")
  getCampaignDetail(@Param("id") campaignId: string, @User() user: JwtUserDto) {
    return this.campaignService.getCampaignDetails(campaignId, user);
  }
}
