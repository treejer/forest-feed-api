import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PendingWithdrawService } from "./pendingWithdraws.service";
import { PendingWithdraw, PendingWithdrawSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingWithdraw.name, schema: PendingWithdrawSchema },
    ]),
    DatabaseModule,
  ],
  controllers: [],
  providers: [PendingWithdrawService, ConfigService, PendingWithdrawRepository],
  exports: [PendingWithdrawService],
})
export class PendingWithdrawModule {}
