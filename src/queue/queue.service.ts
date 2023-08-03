// send-email.job.ts

import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
import { Job, Queue } from "bull";
import { responseHandler } from "src/common/helpers";
import { IResult } from "src/database/interfaces/IResult.interface";

@Processor("rewards") // Queue name
export class QueueService {
  constructor(@InjectQueue("rewards") private readonly rewardsQueue: Queue) {}
  async addRewardToQueue(pendingRewardId: string,delay?:number): Promise<IResult> {
    await this.rewardsQueue.add("distribute", pendingRewardId,{delay}); // 'send' is the job type
    return responseHandler(200, "added to queue");
  }
  @Process("distribute")
  async distributeReward(job: Job<any>) {
    const data = job.data;
    console.log("job", data);

    // try {
    //   console.log(`Sending email to: ${data.email}`);

    //   console.log("asad", job.attemptsMade);

    //   throw new InternalServerErrorException();
    // } catch (error) {
    //   if (job.attemptsMade >= 2) {
    //     job.queue.add(
    //       "send",
    //       {
    //         email: "recipient@example.com",
    //         subject: "Hello from NestJS Queue",
    //         content: "This is a test email sent via NestJS queue.",
    //       },
    //       { delay: 10000 }
    //     );
    //     // Job has reached maximum retries, do something or log the error
    //     console.error(`Job failed after ${job.attemptsMade} attempts.`);
    //   } else {
    //     // Retry the job

    //     await job.retry();
    //   }
    // }
    // Your email sending logic here
  }
}
