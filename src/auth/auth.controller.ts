import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginResultDto, LoginWithWalletDto, NonceResultDto } from "./dtos";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthErrorMessages, SwaggerErrors } from "src/common/constants";
import { Result } from "src/database/interfaces/result.interface";
import { GetNonceDto } from "./dtos/get-nonce.dto";
import { GetLoginDto } from "./dtos/get-login.dto";
@ApiTags("auth")
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: "get sign message" })
  @ApiResponse({
    status: 200,
    description: "Response including sign message",
    type: NonceResultDto,
  })
  @ApiResponse({
    status: 400,
    description: "Response for invalid wallet address",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: AuthErrorMessages.INVALID_WALLET,
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
  @Get("nonce/:wallet")
  getNonce(@Param("wallet") wallet: string): Promise<Result<GetNonceDto>> {
    return this.authService.getNonce(wallet);
  }

  //------------------------------------------ ************************ ------------------------------------------//
  @ApiOperation({ summary: "login with wallet" })
  @ApiResponse({
    status: 200,
    description: "Response including access_token",
    type: LoginResultDto,
  })
  @ApiResponse({
    status: 400,
    description: "Response for invalid input or wallet address",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: [
            SwaggerErrors.INVALID_INPUT,
            AuthErrorMessages.INVALID_WALLET,
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Response for invalid message signer.",
    content: {
      "text/plain": {
        schema: {
          format: "text/plain",
          example: AuthErrorMessages.INVALID_CREDENTIALS,
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
          example: AuthErrorMessages.USER_NOT_EXIST,
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
  @Post("login/:wallet")
  loginWithWallet(
    @Param("wallet") wallet: string,
    @Body() dto: LoginWithWalletDto
  ): Promise<Result<GetLoginDto>> {
    const signature: string = dto.signature;
    return this.authService.loginWithWallet(wallet, signature);
  }
}
