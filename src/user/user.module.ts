import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { BalanceTransaction, BalanceTransactionSchema, User, UserSchema } from "./schemas";
import { UserRepository } from "./user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { DatabaseModule } from "src/database/database.module";
import { BalanceTransactionRepository } from "./balanceTransaction.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: BalanceTransaction.name, schema: BalanceTransactionSchema }]),
    DatabaseModule,
  ],
  controllers: [UserController],
  providers: [UserService,UserRepository,BalanceTransactionRepository],
  exports: [UserService],
})
export class UserModule {}
