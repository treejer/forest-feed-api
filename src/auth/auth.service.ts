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
} from "./../common/helpers";
import { LoginResultDto, NonceResultDto } from "./dtos";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async getNonce(wallet: string): Promise<NonceResultDto> {
    const userWallet = wallet.toLowerCase();

    if (!checkPublicKey(userWallet))
      throw new BadRequestException(AuthErrorMessages.INVALID_WALLET);

    let user = await this.userService.findUserByWallet(userWallet);

    const nonce = getRandomNonce();

    if (user) {
      return {
        message: Messages.SIGN_MESSAGE + user.nonce.toString(),
        userId: user._id,
      };
    }

    const newUser = await this.userService.create({
      nonce,
      walletAddress: userWallet,
      plantingNonce: 1,
    });

    return {
      message: Messages.SIGN_MESSAGE + newUser.nonce.toString(),
      userId: newUser._id,
    };
  }
  async loginWithWallet(
    walletAddress: string,
    signature: string
  ): Promise<LoginResultDto> {
    const userWallet = walletAddress.toLowerCase();
    if (!checkPublicKey(userWallet))
      throw new BadRequestException(AuthErrorMessages.INVALID_WALLET);

    const user = await this.userService.findUserByWallet(userWallet, {
      _id: 1,
      nonce: 1,
    });

    if (!user) throw new NotFoundException(AuthErrorMessages.USER_NOT_EXIST);

    const message = Messages.SIGN_MESSAGE + user.nonce.toString();

    const msg = `0x${Buffer.from(message, "utf8").toString("hex")}`;
    const recoveredAddress: string = recoverPublicAddressfromSignature(
      signature,
      msg
    );

    if (recoveredAddress.toLowerCase() !== userWallet)
      throw new ForbiddenException(AuthErrorMessages.INVALID_CREDENTIALS);

    const nonce: number = getRandomNonce();

    await this.userService.updateUserById(user._id, { nonce });

    return {
      access_token: await this.getAccessToken(user._id, userWallet),
    };
  }

  async getAccessToken(userId: string, walletAddress: string): Promise<string> {
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
