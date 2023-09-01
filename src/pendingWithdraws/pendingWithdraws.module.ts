import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PendingWithdrawService } from "./pendingWithdraws.service";
import { PendingWithdraw, PendingWithdrawSchema } from "./schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "../database/database.module";
import { PendingWithdrawRepository } from "./pendingWithdraws.repository";
import { UserModule } from "src/user/user.module";
import { CampaignModule } from "src/campaigns/campaign.module";
import { QueueModule } from "src/queue/queue.module";
import { PendingWithdrawController } from "./pendingWithdraws.controller";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingWithdraw.name, schema: PendingWithdrawSchema },
    ]),
    DatabaseModule,
    UserModule,
    forwardRef(() => QueueModule),
    forwardRef(() => CampaignModule),
  ],
  controllers: [PendingWithdrawController],
  providers: [PendingWithdrawService, PendingWithdrawRepository],
  exports: [PendingWithdrawService],
})
export class PendingWithdrawModule {}
