import { Module } from "@nestjs/common";
import { LensApiController } from "./lens-api.controller";
import { LensApiService } from "./lens-api.service";

@Module({
  imports: [],
  controllers: [LensApiController],
  providers: [LensApiService],
  exports: [LensApiService],
})
export class LensApiModule {}
