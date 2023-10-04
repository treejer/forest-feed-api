import { Injectable } from "@nestjs/common";

import * as ForestFeedEvents from "./contracts/ForestFeedEvents.json";
import * as LensEvents from "./contracts/LensEvents.json";

import { ConfigService } from "@nestjs/config";
import { Command, Option } from "nestjs-command";
import { BugsnagService } from "src/bugsnag/bugsnag.service";
import {
  ForestFeedEventName,
  LastStateIds,
  LensEventName,
} from "src/common/constants";
import { Web3Service } from "src/web3/web3.service";
import { EventService } from "../event.service";
import { UserService } from "src/user/user.service";
import BigNumber from "bignumber.js";

const EthereumEvents = require("ethereum-events");

export const ListenerConfig = {
  POLL_INTERVAL: 13000,
  CONFIRMATIONS: 12,
  CHUNK_SIZE: 10000,
  CONCURRENCY: 1,
  BACK_OFF: 300000,
};

export const ListenerType = {
  balance: "runForestFeedEventListener",
  mirror: "runLensEventListener",
};

@Injectable()
export class Listener {
  constructor(
    private web3Service: Web3Service,
    private configService: ConfigService,
    private eventService: EventService,
    private bugSnag: BugsnagService,
    private userService: UserService
  ) {}

  @Command({
    command: "listener:run",
    describe: "Mirrored && Get Balance listener run",
  })
  async createWeb3S(
    @Option({
      name: "type",
      describe: "select witch listenr do you want to run",
      type: "string",
      required: false,
    })
    type: string = "mirror"
  ) {
    console.log("Web3 Instance Created !!", type);

    this.web3Service.createWeb3SInstance(
      "",
      this[ListenerType[type]].bind(this)
    );
  }

  //------------------------> lens listener

  async runLensEventListener(web3) {
    const contracts = [
      {
        name: this.configService.get<string>("LENS_CONTRACT_NAME"),
        address: this.configService.get<string>("LENS_CONTRACT_ADDRESS"),
        abi: LensEvents.abi,
        events: [LensEventName.Mirror_CREATED],
      },
    ];

    let ethereumEvents = new EthereumEvents(web3, contracts, {
      pollInterval: ListenerConfig.POLL_INTERVAL,
      confirmations: ListenerConfig.CONFIRMATIONS,
      chunkSize: ListenerConfig.CHUNK_SIZE,
      concurrency: ListenerConfig.CONCURRENCY,
      backoff: ListenerConfig.BACK_OFF,
    });

    ethereumEvents.start(
      await this.eventService.loadLastState(LastStateIds.MIRROR)
    );

    let lastErrorTime = new Date();

    const block = await web3.eth.getBlock(40244481, true);

    console.log("const transactions = block.transactions",block.transactions)
    

    ethereumEvents.on("block.confirmed", async (blockNumber, events, done) => {
      console.log("block.confirmed", blockNumber);

      let res = await new Promise(async (resolve, reject) => {
        if (events.length > 0) {
          for (let event of events) {
            if (event.name === LensEventName.Mirror_CREATED) {
              try {
                ///-------------------> lens service
                await this.eventService.handleMirror(
                  event.values.pubId,
                  event.values.profileId,
                  event.values.pubIdPointed,
                  event.values.profileIdPointed,
                  false
                );
              } catch (error) {
                if (
                  error &&
                  error.response &&
                  (error.response.statusCode == 409 ||
                    error.response.statusCode == 404 ||
                    error.response.statusCode == 403)
                ) {
                  console.log("error.response", error.response);
                  console.log("Mirror error", error);
                } else {
                  console.log("error.response", error.response);
                  reject("error");
                }
              }
            }
          }
        }
        resolve("done");
      }).catch((e) => {
        this.bugSnag.notify(
          "Mirror event listener (service side) error :  " + e
        );
        done("err");
      });

      if (res) {
        try {
          await this.eventService.saveLastState(
            LastStateIds.MIRROR,
            blockNumber
          );
        } catch (e) {}

        done();
      }
    });

    ethereumEvents.on("error", (err) => {
      const currentTime = new Date();
      const minutesToCheck = 1;

      const diffMinutes = Math.round(
        (currentTime.getTime() - lastErrorTime.getTime()) / (1000 * 60)
      );

      console.log("errerrerrerrerr", diffMinutes , err);

      if (diffMinutes >= minutesToCheck) {
        lastErrorTime = currentTime;

        this.bugSnag.notify("Mirror event listener error : " + err);

        console.log("it's timeeeeeeeeeeeeeeeeee");

        this.web3Service.createWeb3SInstance(
          "",
          this.runLensEventListener.bind(this)
        );
      }
    });

    return ethereumEvents;
  }

  //------------------------> get balance listener

  async runForestFeedEventListener(web3) {
    const contracts = [
      {
        name: this.configService.get<string>("FORESTFEED_CONTRACT_NAME"),
        address: this.configService.get<string>("FORESTFEED_CONTRACT_ADDRESS"),
        abi: ForestFeedEvents.abi,
        events: [ForestFeedEventName.DEPOSITED],
      },
    ];

    let ethereumEvents = new EthereumEvents(web3, contracts, {
      pollInterval: ListenerConfig.POLL_INTERVAL,
      confirmations: ListenerConfig.CONFIRMATIONS,
      chunkSize: ListenerConfig.CHUNK_SIZE,
      concurrency: ListenerConfig.CONCURRENCY,
      backoff: ListenerConfig.BACK_OFF,
    });

    ethereumEvents.start(
      await this.eventService.loadLastState(LastStateIds.BALANCE)
    );

    let lastErrorTime = new Date();

    ethereumEvents.on("block.confirmed", async (blockNumber, events, done) => {
      console.log("block.confirmed", blockNumber, events);

      lastErrorTime = new Date();

      let res = await new Promise(async (resolve, reject) => {
        if (events.length > 0) {
          for (let event of events) {
            if (event.name === ForestFeedEventName.DEPOSITED) {
              try {
                await this.userService.updateUserBalance(
                  event.values.creator.toLowerCase(),
                  BigNumber(event.values.amount),
                  event.transactionHash
                );
              } catch (error) {
                if (
                  error &&
                  error.response &&
                  (error.response.statusCode == 409 ||
                    error.response.statusCode == 404)
                ) {
                  console.log("error.response", error.response);
                  console.log("DEPOSITED error", error);
                } else {
                  console.log("error.response", error.response);
                  reject("error");
                }
              }
            }
          }
        }
        resolve("done");
      }).catch((e) => {
        this.bugSnag.notify(
          "Balance event listener (service side) error : " + e
        );
        done("err");
      });

      if (res) {
        try {
          await this.eventService.saveLastState(
            LastStateIds.BALANCE,
            blockNumber
          );
        } catch (e) {}
        done();
      }
    });

    ethereumEvents.on("error", (err) => {
      const currentTime = new Date();
      const minutesToCheck = 1;

      const diffMinutes = Math.round(
        (currentTime.getTime() - lastErrorTime.getTime()) / (1000 * 60)
      );

      console.log("not time", err);

      if (diffMinutes >= minutesToCheck) {
        lastErrorTime = currentTime;

        this.bugSnag.notify("Balance event listener error : " + err);

        console.log("it's timeeeeeeeeeeeeeeeeee");

        this.web3Service.createWeb3SInstance(
          "",
          this.runForestFeedEventListener.bind(this)
        );
      }
    });

    return ethereumEvents;
  }
}
