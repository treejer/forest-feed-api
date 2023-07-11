import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "./../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { AtStrategy, RolesGuard } from "./strategies";
import { UserMobileRepository } from "./auth.repository";
import { UserMobile, UserMobileSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "./../database/database.module";
@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: UserMobile.name, schema: UserMobileSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    UserMobileRepository,
    AuthService,
    ConfigService,
    AtStrategy,
    RolesGuard,
  ],
  exports: [AuthService, AtStrategy, RolesGuard],
})
export class AuthModule {}
