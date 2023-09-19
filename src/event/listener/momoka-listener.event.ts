import { Injectable } from "@nestjs/common";

@Injectable()
export class MomokaListener {
  constructor() {}

  async runMomokaListener() {
    while (true) {
      let requestParam = ""; // null or head of stack

      let lastCheckedTransactionId = "0x"; //get this from database (the last transaction we checked)

      // request to get 50 transactions of momoka with requestParam
      let requests = []; // req(requestParam)

      let finishRequest = "";

      if (requests.find(lastCheckedTransactionId)) {
        ///
        //
        requests.splice(lastCheckedTransactionId);

        requests = requests.reverse();
        requests.forEach((req) => {
          /// check req
          //---------------------------------------------->
          /// update last transaction we checked
        });
        stack.length > 0 ? stack.pop() : undefined;

        if (stack.length == 0) {
          break;
        }
      } else if (finishRequest == lastCheckedTransactionId) {
        requests = requests.reverse();
        requests.forEach((req) => {
          /// check req
          //---------------------------------------------->
          /// update last transaction we checked
        });
        stack.length > 0 ? stack.pop() : undefined;

        if (stack.length == 0) {
          break;
        }
      } else {
        // update stack and add to head (next)
      }
    }
  }
}
