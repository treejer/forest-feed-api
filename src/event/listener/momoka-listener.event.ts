import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { StackClass } from "src/stack/stack";
import { StackService } from "src/stack/stack.service";

@Injectable()
export class MomokaListener {
  private stackClass;

  constructor(private stackService: StackService) {
    this.stackClass = new StackClass<string>();
  }

  async runMomokaListener() {
    // while (true) {
    this.stackClass.set((await this.stackService.getStackItemsById()).data);

    let requestParam = this.stackClass.peek(); // null or head of stack

    let lastCheckedTransactionId = (
      await this.stackService.getLastTransaction()
    ).data; //get this from database (the last transaction we checked)

    let finishRequest = "";

    let findIndex = requests.findIndex(
      (treansaction) => treansaction.id === lastCheckedTransactionId
    );

    if (findIndex != -1) {
      requests.length = findIndex;

      requests = requests.reverse();

      requests.forEach((req) => {
        /// check req
        //---------------------------------------------->
        /// update last transaction we checked
      });

      this.stackClass.pop();

      await this.stackService.updateStackDataById({
        items: this.stackClass.get(),
      });

      if (this.stackClass.size() == 0) {
        // break;
      }
    } else if (finishRequest == lastCheckedTransactionId) {
      requests = requests.reverse();
      requests.forEach((req) => {
        /// check req
        //---------------------------------------------->
        /// update last transaction we checked
      });

      this.stackClass.pop();

      await this.stackService.updateStackDataById({
        items: this.stackClass.get(),
      });

      if (this.stackClass.size() == 0) {
        // break;
      }
    } else {
      // update stack and add to head (next)
    }
  }
}
