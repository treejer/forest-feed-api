// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { EventService } from "./event.service";

@Controller()
export class EventController {
  constructor(private eventService: EventService) {}

  @Get("event")
  async sendEmail() {
    return await this.eventService.handleMirror("0x8d9a", "0x05", "0x8996");
  }
}
