import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CampaignService } from "./campaign.service";
import { Campaign, CampaignSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { CampaignRepository } from "./campaign.repository";
import { LensApiModule } from "src/lens-api/lens-api.module";
import { UserModule } from "src/user/user.module";
import { PendingWithdrawModule } from "src/pendingWithdraws/pendingWithdraws.module";
import { PendingRewardModule } from "src/pendingReward/pendingReward.module";
import { CampaignController } from "./campaign.controller";



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    DatabaseModule,
    LensApiModule,
    UserModule,
    PendingRewardModule,
    forwardRef(() => PendingWithdrawModule)
  ],
  controllers: [CampaignController],
  providers: [CampaignService, ConfigService, CampaignRepository],
  exports: [CampaignService],
})
export class CampaignModule {}
