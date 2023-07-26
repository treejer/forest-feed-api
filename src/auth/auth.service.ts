import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { UserService } from "./../user/user.service";
import { JwtService } from "@nestjs/jwt";

import { AuthErrorMessages, Messages } from "./../common/constants";
import {
  getRandomNonce,
  checkPublicKey,
  recoverPublicAddressfromSignature,
  responseHandler,
  resultHandler,
} from "./../common/helpers";
import { LoginResultDto, NonceResultDto } from "./dtos";
import { Result } from "src/database/interfaces/result.interface";
import { GetNonceDto } from "./dtos/get-nonce.dto";
import { GetLoginDto } from "./dtos/get-login.dto";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async getNonce(wallet: string): Promise<Result<GetNonceDto>> {
    const userWallet = wallet.toLowerCase();

    if (!checkPublicKey(userWallet))
      throw new BadRequestException(AuthErrorMessages.INVALID_WALLET);

    let user = await this.userService.findUserByWallet(userWallet);

    const nonce = getRandomNonce();

    if (user.statusCode == 200) {
      return resultHandler(200, "nonce generated", {
        message: Messages.SIGN_MESSAGE + user.data.nonce.toString(),
        userId: user.data._id,
      });
    }

    const result = await this.userService.create({
      nonce,
      walletAddress: userWallet,
      plantingNonce: 1,
    });

    return resultHandler(200, "nonce generated", {
      message: Messages.SIGN_MESSAGE + result.data.nonce.toString(),
      userId: result.data._id,
    });
  }
  async loginWithWallet(
    walletAddress: string,
    signature: string
  ): Promise<Result<GetLoginDto>> {
    const userWallet = walletAddress.toLowerCase();
    if (!checkPublicKey(userWallet))
      throw new BadRequestException(AuthErrorMessages.INVALID_WALLET);

    const user = await this.userService.findUserByWallet(userWallet, {
      _id: 1,
      nonce: 1,
    });

    if (user.statusCode != 200)
      throw new NotFoundException(AuthErrorMessages.USER_NOT_EXIST);

    const message = Messages.SIGN_MESSAGE + user.data.nonce.toString();

    const msg = `0x${Buffer.from(message, "utf8").toString("hex")}`;
    const recoveredAddress: string = recoverPublicAddressfromSignature(
      signature,
      msg
    );

    if (recoveredAddress.toLowerCase() !== userWallet)
      throw new ForbiddenException(AuthErrorMessages.INVALID_CREDENTIALS);

    const nonce: number = getRandomNonce();

    await this.userService.updateUserById(user.data._id, { nonce });

    return resultHandler(200, "successful login", {
      access_token: await this.getAccessToken(user.data._id, userWallet),
    });
  }

  private async getAccessToken(
    userId: string,
    walletAddress: string
  ): Promise<string> {
    const payload = { userId, walletAddress };
    try {
      return this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 30,
        secret: this.configService.get<string>("JWT_SECRET"),
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
