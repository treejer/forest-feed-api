// app.controller.ts

import { Controller } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller()
export class QueueController {
  constructor(private queueService: QueueService) {}

  // @Get("send-email")
  // async sendEmail() {
  //   await this.queueService.addRewardToQueue("64d120cf6da7854c81b823f1", 1000);
  // }
  // @Get("empty")
  // async empty() {}
}
