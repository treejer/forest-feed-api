import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { ErrorFilter } from "./error.filter";
import { BugsnagService } from "./bugsnag/bugsnag.service";
import { ConfigService } from "@nestjs/config";

const basicAuth = require("express-basic-auth");

function shouldAuthenticate(req) {
  if (req.originalUrl == "/queues") {
    return true;
  } else {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useStaticAssets(join(__dirname, "..", "public"));
  const bugsnagService = app.get(BugsnagService);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(
    new ErrorFilter(bugsnagService.getBugsnag(), configService)
  );

  let serverUrl = configService.get("SERVER_URL");

  const config = new DocumentBuilder()
    .setTitle("ForestFeed API")
    .setDescription("API for forestfeed")
    .setVersion("0.1.0")
    .addTag("Forestfees")
    .setContact("ForestFeed", "https://treejer.com/contact", "")
    .addBearerAuth()
    .addServer(serverUrl)
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup("api", app, document);

  const basicAuthMiddleware = basicAuth({
    challenge: true,
    users: {
      [configService.get("USER_NAME")]: configService.get("PASSWORD"),
    },
  });

  app.use((req, res, next) =>
    shouldAuthenticate(req) ? basicAuthMiddleware(req, res, next) : next()
  );

  app.enableCors();

  await app.listen(configService.get<number>("PORT"));
}

bootstrap();
