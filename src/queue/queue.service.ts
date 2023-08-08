// send-email.job.ts

import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
import { Job, Queue } from "bull";
import { responseHandler } from "src/common/helpers";
import { IResult } from "src/database/interfaces/IResult.interface";

@Processor("rewards") // Queue name
export class QueueService {
  constructor(@InjectQueue("rewards") private readonly rewardsQueue: Queue) {}

  async emptyQueue(): Promise<IResult> {
    try {
      await this.rewardsQueue.removeJobs("");
    } catch (error) {
      console.log("errrrrr", error);
    }

    return responseHandler(200, "added to queue");
  }
  async addRewardToQueue(
    pendingRewardId: string,
    delay?: number
  ): Promise<IResult> {
    try {
      await this.rewardsQueue.add("distribute", pendingRewardId, { delay: 0 });
      // await this.rewardsQueue.empty();
      // .then((res) => {
      //   // console.log("err", err);
      //   console.log("res", res);
      // });
    } catch (error) {
      console.log("errrrrr", error);
    }

    return responseHandler(200, "added to queue");
  }
  @Process("distribute")
  async distributeReward(job: Job<any>) {
    await this.sleep(700);

    let failed = true;
    let retryCount = 0;

    const data = job.data;
    while (failed && retryCount < 2) {
      try {
        console.log("job", data);

        if (data == "2") {
          throw new InternalServerErrorException("");
        }
        failed = false;
      } catch (error) {
        retryCount++;
        if (retryCount == 2) {
          console.log("aaaa");

          await job.retry();
        } else {
          await this.sleep(200);
        }
      }
    }

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

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
