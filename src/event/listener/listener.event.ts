import { Injectable } from "@nestjs/common";

import * as LensEvents from "./contracts/LensEvents.json";
import * as ForestFeedEvents from "./contracts/ForestFeedEvents.json";

import { ConfigService } from "@nestjs/config";
import { Web3Service } from "src/web3/web3.service";
import { ForestFeedEventName, LastStateIds, LensEventName } from "src/common/constants";
import { Command, Option } from "nestjs-command";
import { BugsnagService } from "src/bugsnag/bugsnag.service";
import { EventService } from "../event.service";

const EthereumEvents = require("ethereum-events");


export const ListenerConfig = {
  POLL_INTERVAL:13000,
  CONFIRMATIONS:12,
  CHUNK_SIZE:1,
  CONCURRENCY:10,
  BACK_OFF:1000,
}

export const ListenerType =  {
  balance:"runForestFeedEventListener",
  mirror:"runLensEventListener",
}

@Injectable()
export class Listener {

  constructor(
    private web3Service: Web3Service,
    private configService: ConfigService,
    private eventService:EventService
    // private bugsnag: BugsnagService,
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
    type: string = "mirror",
  ) {
    console.log("Web3 Instance Created !!",type);

    this.web3Service.createWeb3SInstance("",this[ListenerType[type]].bind(this));
  }

  async runLensEventListener(web3){

    const contracts = [
      {
        name: this.configService.get<string>("LENS_CONTRACT"),
        address: this.configService.get<string>("LENS_CONTRACT_ADDRESS"),
        abi: LensEvents.abi,
        events: [LensEventName.Mirror_CREATED],
      },
    ];

    let ethereumEvents = new EthereumEvents(web3, contracts,{
      pollInterval:ListenerConfig.POLL_INTERVAL,
      confirmations:ListenerConfig.CONFIRMATIONS,
      chunkSize:ListenerConfig.CHUNK_SIZE,
      concurrency:ListenerConfig.CONCURRENCY,
      backoff:ListenerConfig.BACK_OFF,
    });
    

    ethereumEvents.start(
      await this.eventService.loadLastState(LastStateIds.MIRROR)
    );

    let lastErrorTime = new Date();


    ethereumEvents.on(
      "block.confirmed",
      async (blockNumber, events, done) => {
        
        console.log("block.confirmed", blockNumber, events);

        // lastErrorTime = new Date();

        // await new Promise(async (resolve, reject) => {
        //   if (events.length > 0) {
        //     for (let event of events) {
        //       if (event.name === EventName.TREE_ASSIGNED) {
        //         try {
        //           await this.plantVerificationService.verifyAssignedTree(
        //             Number(event.values.treeId),
        //           );
        //         } catch (error) {
        //           console.log("TREE_ASSIGNED error", error);
        //         }
        //       } else if (event.name === EventName.TREE_PLANT) {
        //         try {
        //           await this.plantVerificationService.verifyPlant(
        //             event.values.planter,
        //             Number(event.values.nonce),
        //           );
        //         } catch (error) {
        //           console.log("TREE_PLANT error", error);
        //         }
        //       } else if (event.name === EventName.TREE_UPDATE) {
        //         try {
        //           await this.plantVerificationService.verifyUpdate(
        //             Number(event.values.treeId),
        //           );
        //         } catch (error) {
        //           console.log("TREE_UPDATE error", error);
        //         }
        //       }
        //     }
        //   }

        //   await this.plantVerificationService.saveLastState(blockNumber);

        //   resolve("done");
        // });
        
        done();
      },
    );

    ethereumEvents.on('error', err => {
      const currentTime = new Date();
      const minutesToCheck = 1;

      const diffMinutes = Math.round(
        (currentTime.getTime() - lastErrorTime.getTime()) / (1000 * 60)
      );

      console.log("not time",diffMinutes)
      
      if (diffMinutes >= minutesToCheck) {

        lastErrorTime = currentTime;

        // this.bugsnag.notify("it's timeeeeeeeeeeeeeeeeee    " + err);

        console.log("it's timeeeeeeeeeeeeeeeeee")
      
        this.web3Service.createWeb3SInstance('',this.runLensEventListener.bind(this));  
      }
  
    });

    return ethereumEvents;
      
  }


  
  async runForestFeedEventListener(web3) {
    const contracts = [
      {
        name: this.configService.get<string>(
          "FOREST_FEED_LISTENER_CONTRACT_NAME"
        ),
        address: this.configService.get<string>(
          "FOREST_FEED_LISTENER_CONTRACT_ADDRESS"
        ),
        abi: ForestFeedEvents.abi,
        events: [ForestFeedEventName.DEPOSITED],
      },
    ];

    let ethereumEvents = new EthereumEvents(web3, contracts,{
      pollInterval:ListenerConfig.POLL_INTERVAL,
      confirmations:ListenerConfig.CONFIRMATIONS,
      chunkSize:ListenerConfig.CHUNK_SIZE,
      concurrency:ListenerConfig.CONCURRENCY,
      backoff:ListenerConfig.BACK_OFF,
    });

    ethereumEvents.start(await this.eventService.loadLastState(LastStateIds.BALANCE));

    let lastErrorTime = new Date();

    ethereumEvents.on("block.confirmed", async (blockNumber, events, done) => {
      console.log("block.confirmed", blockNumber);

      lastErrorTime = new Date();

      done();
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

        // this.bugsnag.notify("it's timeeeeeeeeeeeeeeeeee    " + err);

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