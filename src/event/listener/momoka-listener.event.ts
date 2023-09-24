import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { Command, Option } from "nestjs-command";
import { sleep } from "src/common/helpers";
import { LensApiService } from "src/lens-api/lens-api.service";
import { StackClass } from "src/stack/stack";
import { StackService } from "src/stack/stack.service";
import { CronJob } from "cron";
import { EventService } from "../event.service";
@Injectable()
export class MomokaListener {
  private stackClass;

  constructor(
    private stackService: StackService,
    private lensApiService: LensApiService,
    private eventService: EventService
  ) {
    this.stackClass = new StackClass<string>();
  }

  @Command({
    command: "cronJob:run",
    describe: "cron job run",
  })
  async run() {
    console.log("cronJob run !!");

    let listener = this.listener.bind(this);

    let jobRunnig = false;

    var job = new CronJob(
      "0 */1 * * * *",
      async function () {
        if (jobRunnig) {
          return;
        }
        jobRunnig = true;
        console.log("before", new Date());
        console.log("You will see this message every second");
        await new Promise((resolve) => listener(resolve));
        console.log("finish");
        jobRunnig = false;
      },
      null,
      true
    );
    job.start();
  }

  async listener(resolve) {
    while (true) {
      /* ------------------------- initial data ------------------------- */

      try {
        this.stackClass.set((await this.stackService.getStackItemsById()).data);

        let requestParam = this.stackClass.peek(); // null or head of stack

        let lastCheckedTransactionId = (
          await this.stackService.getLastTransaction()
        ).data;

        let lensRequestErrorCount = 0;

        let lensResponce;

        console.log("requestParam", requestParam);

        while (true) {
          try {
            if (lensRequestErrorCount == 20) {
              break;
            }
            lensResponce = (
              await this.lensApiService.getDATransactions(
                requestParam ? JSON.stringify(requestParam) : null,
                50
              )
            ).data;
            lensRequestErrorCount = 0;
            break;
          } catch {
            lensRequestErrorCount = lensRequestErrorCount + 1;
            await sleep(4000);
          }
        }

        if (lensRequestErrorCount == 20) {
          break;
        }

        let requests = lensResponce.items;
        let next = lensResponce.pageInfo.next;
        lensRequestErrorCount = 0;

        let findIndex = requests.findIndex(
          (treansaction) =>
            treansaction.transactionId === lastCheckedTransactionId
        );

        //-------------------------------------------> try to get 51 transactions

        while (true) {
          try {
            if (lensRequestErrorCount == 20) {
              break;
            }
            lensResponce = (
              await this.lensApiService.getDATransactions(
                JSON.stringify(next),
                1
              )
            ).data;
            lensRequestErrorCount = 0;
            break;
          } catch {
            lensRequestErrorCount = lensRequestErrorCount + 1;
            await sleep(4000);
          }
        }

        if (lensRequestErrorCount == 20) {
          break;
        }

        let finishRequest = lensResponce.items[0];

        console.log("findIndex", findIndex);

        if (findIndex != -1) {
          console.log("--------------------------------------------Section1");

          requests.length = findIndex;

          console.log("requests", requests);

          if (requests.length == 0) {
            break;
          }

          requests = requests.reverse();

          await this.processArray(requests, this.stackService);

          this.stackClass.pop();

          await this.stackService.updateStackDataById({
            items: this.stackClass.get(),
            lastTransaction: requests[requests.length - 1].transactionId,
          });
        } else if (finishRequest.transactionId == lastCheckedTransactionId) {
          console.log("--------------------------------------------Section2");
          requests = requests.reverse();

          await this.processArray(requests, this.stackService);

          this.stackClass.pop();

          await this.stackService.updateStackDataById({
            items: this.stackClass.get(),
            lastTransaction: requests[requests.length - 1].transactionId,
          });
        } else {
          console.log("--------------------------------------------Section3");
          this.stackClass.push(next);
          console.log("this.stackClass.get()", requests, this.stackClass.get());
          await this.stackService.updateStackDataById({
            items: this.stackClass.get(),
          });
        }
      } catch (e) {
        console.log("e", e);
        break;
      }
    }
    resolve();
  }

  private async processArray(requests, stackService) {
    for (const req of requests) {
      if (req.__typename == "DataAvailabilityMirror") {
        console.log("req", req);

        try {
          await this.eventService.handleMirror(
            req.publicationId,
            "",
            req.mirrorOfPublicationId,
            "",
            true
          );
        } catch (error) {
          if (
            error &&
            error.response &&
            (error.response.statusCode == 409 ||
              error.response.statusCode == 404 ||
              error.response.statusCode == 403)
          ) {
            console.log("error.response", error.response);
            console.log("Mirror error", error);
          } else {
            console.log("error.response", error.response);
            throw new Error("error");
          }
        }
      }
    }
  }
}
