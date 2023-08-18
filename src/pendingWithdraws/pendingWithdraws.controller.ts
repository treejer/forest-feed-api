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

  //-------------------------------------------------------------------------------
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post("withdraw")
  withdraw(@Body() dto: WithdrawReqDto, @User() user: JwtUserDto) {
    return this.pendingWithdrawService.withderawRequest(
      BigNumber(dto.amount),
      user
    );
  }
}
