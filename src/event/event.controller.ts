// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { EventService } from "./event.service";
import { Web3Service } from "src/web3/web3.service";

@Controller()
export class EventController {
  constructor(
    private eventService: EventService,
    private web3Service: Web3Service
  ) {}

  @Get("event")
  async sendEmail() {
    // await this.web3Service.distributeReward("0xF324C19D8f93E01bBd5679623b43E35b38912e8A","",1)
    return await this.eventService.handleMirror("2", "36250", "6", "35222");
  }
}
