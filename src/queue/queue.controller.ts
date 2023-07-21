// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Controller()
export class AppController {
  constructor(@InjectQueue("emails") private readonly emailQueue: Queue) {}

  @Get("send-email")
  async sendEmail() {
    const emailData = {
      email: "recipient@example.com",
      subject: "Hello from NestJS Queue",
      content: "This is a test email sent via NestJS queue.",
    };

    // await this.emailQueue.empty();
    await this.emailQueue.add("send", emailData); // 'send' is the job type
    return { message: "Email sent to the queue." };
  }
}
