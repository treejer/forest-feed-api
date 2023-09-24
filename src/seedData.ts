// src/seed-data.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import * as mongoose from "mongoose";
import { ConfigService } from "@nestjs/config";
import { CollectionNames, LastStateIds } from "./common/constants";

async function seedData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);

    // Connect to MongoDB
    let mongoConnection = (
      await mongoose.connect(
        configService.get<string>("NODE_ENV") == "test"
          ? configService.get<string>("MONGO_TEST_CONNECTION")
          : configService.get<string>("MONGO_CONNECTION")
      )
    ).connection;

    // Data to seed
    const initialLastSateData = [
      {
        _id: new mongoose.Types.ObjectId(LastStateIds.BALANCE),
        lastBlockNumber: 38250456,
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(LastStateIds.MIRROR),
        lastBlockNumber: 38232611,
        updatedAt: new Date(),
      },
    ];

    await mongoConnection.db
      .collection(CollectionNames.LAST_STATE)
      .insertMany(initialLastSateData);

    const initialStackData = [
      {
        _id: new mongoose.Types.ObjectId(LastStateIds.STACK_ID),
        items: [],
        lastTransaction: "",
      },
    ];

    await mongoConnection.db
      .collection(CollectionNames.Stack)
      .insertMany(initialStackData);
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    await app.close();
    await mongoose.disconnect();
  }
}

seedData()
  .then(() => {
    console.log("initialData completed!");
  })
  .catch((e) => {
    console.log("e", e);
  });
