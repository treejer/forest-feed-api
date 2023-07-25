import { Module } from "@nestjs/common";

import { Web3Module } from "src/web3/web3.module";
import { LastState, LastStateSchema } from "./schemas";
import { LastStateRepository } from "./lastState.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { Listener } from "./listener/listener.event";
import { EventService } from "./event.service";



@Module({
  imports: [
    Web3Module,
    MongooseModule.forFeature([
      { name: LastState.name, schema: LastStateSchema },
    ]),
  ],
  controllers: [],
  providers: [
    Listener,
    EventService,
    LastStateRepository,
  ],
  exports: [],
})
export class EventModule {}
