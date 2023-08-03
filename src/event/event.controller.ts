// app.controller.ts

import { Controller, Get, Inject } from "@nestjs/common";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";
import { EventService } from "./event.service";

@Controller()
export class EventController {
  constructor(private eventService:EventService) {}

  @Get("event")
  async sendEmail() {
      return await this.eventService.handleMirror("1", "1", "1", "1")
      
  }
}
