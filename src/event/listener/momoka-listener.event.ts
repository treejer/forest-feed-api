import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { sleep } from "src/common/helpers";
import { LensApiService } from "src/lens-api/lens-api.service";
import { StackClass } from "src/stack/stack";
import { StackService } from "src/stack/stack.service";

@Injectable()
export class MomokaListener {
  private stackClass;

  constructor(
    private stackService: StackService,
    private lensApiService: LensApiService
  ) {
    this.stackClass = new StackClass<string>();
  }

  async runMomokaListener() {
    while (true) {
      /* ------------------------- initial data ------------------------- */

      try {
        this.stackClass.set((await this.stackService.getStackItemsById()).data);

        let requestParam = this.stackClass.peek(); // null or head of stack

        let lastCheckedTransactionId = (
          await this.stackService.getLastTransaction()
        ).data; //get this from database (the last transaction we checked)

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
                2
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

          if (this.stackClass.size() == 0) {
            break;
          }
        } else if (finishRequest.transactionId == lastCheckedTransactionId) {
          console.log("--------------------------------------------Section2");
          requests = requests.reverse();

          await this.processArray(requests, this.stackService);

          this.stackClass.pop();

          await this.stackService.updateStackDataById({
            items: this.stackClass.get(),
            lastTransaction: requests[requests.length - 1].transactionId,
          });

          if (this.stackClass.size() == 0) {
            break;
          }
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
  }

  private async processArray(requests, stackService) {
    for (const req of requests) {
      console.log("req", req);

      //-----------> check req
    }
  }
}
