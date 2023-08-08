import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PendingWithdrawService } from "./pendingWithdraws.service";
import { PendingWithdraw, PendingWithdrawSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { UserModule } from "src/user/user.module";
import { CampaignModule } from "src/campaigns/campaign.module";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingWithdraw.name, schema: PendingWithdrawSchema },
    ]),
    DatabaseModule,
    UserModule,
    forwardRef(() => CampaignModule)
  ],
  controllers: [],
  providers: [PendingWithdrawService, ConfigService, PendingWithdrawRepository],
  exports: [PendingWithdrawService],
})
export class PendingWithdrawModule {}
