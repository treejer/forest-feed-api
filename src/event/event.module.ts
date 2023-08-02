import { Module } from "@nestjs/common";

import { MongooseModule } from "@nestjs/mongoose";
import { BugsnagModule } from "src/bugsnag/bugsnag.module";
import { Web3Module } from "src/web3/web3.module";
import { EventService } from "./event.service";
import { LastStateRepository } from "./lastState.repository";
import { Listener } from "./listener/listener.event";
import { LastState, LastStateSchema } from "./schemas";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    Web3Module,
    UserModule,
    MongooseModule.forFeature([
      { name: LastState.name, schema: LastStateSchema },
    ]),
    BugsnagModule,
  ],
  controllers: [],
  providers: [Listener, EventService, LastStateRepository],
  exports: [],
})
export class EventModule {}
