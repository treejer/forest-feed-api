// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { QueueService } from "./queue.service";

@Controller()
export class QueueController {
  constructor(private queueService:QueueService) {}

  @Get("send-email")
  async sendEmail() {

return await this.queueService.addRewardToQueue("1",1000)
  }
}
