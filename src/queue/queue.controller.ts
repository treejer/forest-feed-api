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
    await this.queueService.addRewardToQueue("64d120cf6da7854c81b823f1", 1000);
    // for (let index = 0; index < 5; index++) {
    //   await this.queueService.addRewardToQueue(index.toString(), 1000);
    // }
  }
  @Get("empty")
  async empty() {
    await this.queueService.emptyQueue();
  }
}
