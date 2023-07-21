// send-email.job.ts

import { Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
import { Job } from "bull";

@Processor("emails") // Queue name
export class SendEmailJob {
  @Process("send")
  async sendEmail(job: Job<any>) {
    const data = job.data;

    try {
      console.log(`Sending email to: ${data.email}`);

      console.log("asad", job.attemptsMade);

      throw new InternalServerErrorException();
    } catch (error) {
      if (job.attemptsMade >= 2) {
        job.queue.add(
          "send",
          {
            email: "recipient@example.com",
            subject: "Hello from NestJS Queue",
            content: "This is a test email sent via NestJS queue.",
          },
          { delay: 10000 }
        );
        // Job has reached maximum retries, do something or log the error
        console.error(`Job failed after ${job.attemptsMade} attempts.`);
      } else {
        // Retry the job

        await job.retry();
      }
    }
    // Your email sending logic here
  }
}
