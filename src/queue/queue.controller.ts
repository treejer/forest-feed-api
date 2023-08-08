// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { QueueService } from "./queue.service";
import { log } from "console";

@Controller()
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get("send-email")
  async sendEmail() {
    for (let index = 0; index < 5; index++) {
      await this.queueService.addRewardToQueue(index.toString(), 1000);
    }
  }
  @Get("empty")
  async empty() {
    await this.queueService.emptyQueue();
  }
}
