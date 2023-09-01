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
  pendingWithdrawsErrorMessage,
} from "src/common/constants";

import { PendingWithdrawService } from "./pendingWithdraws.service";
import { WithdrawReqDto } from "./dto/withdraw-req.dto";
import { JwtUserDto } from "src/auth/dtos";
import { User } from "src/user/decorators";
import BigNumber from "bignumber.js";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("withdraw")
@Controller()
export class PendingWithdrawController {
  constructor(private pendingWithdrawService: PendingWithdrawService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "get rewards for login user" })
  @ApiResponse({
    status: 200,
    description: "request successfully add to pending list",
  })
  @ApiResponse({
    status: 400,
    description:
      "Response for Invalid input: Amount must be > 0 or sufficient balance ",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: [
            pendingWithdrawsErrorMessage.INSUFFICIENT_ERROR,
            pendingWithdrawsErrorMessage.AMOUNT_IS_NOT_TRUE,
          ],
        },
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
  @Post("withdraw")
  withdraw(@Body() dto: WithdrawReqDto, @User() user: JwtUserDto) {
    return this.pendingWithdrawService.withderawRequest(
      BigNumber(dto.amount),
      user
    );
  }
}
