import { Module } from "@nestjs/common";
import { StackService } from "./stack.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Stack, StackSchema } from "./schemas";
import { StackRepository } from "./stack.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stack.name, schema: StackSchema }]),
  ],
  providers: [StackService, StackRepository],
  exports: [StackService],
})
export class StackModule {}
