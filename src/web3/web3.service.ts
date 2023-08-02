import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Wallet, ethers } from "ethers";
import { resultHandler } from "src/common/helpers";
import { Numbers, web3Errors } from "src/common/constants";
const Web3 = require("web3");
const Contract = require("./../../abi/Contract.json");

@Injectable()
export class Web3Service {
  private web3Instance;
  private web3SInstance;
  private connectionStatus;
  private ethereumEvents;
  private readonly signer;
  private readonly provider;

  constructor(private configService: ConfigService) {
    this.web3Instance = new Web3(
      configService.get<string>("NODE_ENV") === "test"
        ? configService.get<string>("WEB3_PROVIDER_TEST")
        : configService.get<string>("WEB3_PROVIDER")
    );

    this.web3Instance.eth.net
      .isListening()
      .then(() => console.log("web3Instance : is connected"))
      .catch((e) =>
        console.error("web3Instance : Something went wrong : " + e)
      );

    const web3Provider = this.configService.get<string>("WEB3_PROVIDER");

    this.provider = new ethers.providers.JsonRpcProvider(web3Provider);
    const privateKey = this.configService.get<string>("SCRIPT_PK");

    this.signer = new Wallet(privateKey, this.provider);
  }

  async distributeReward(from: string, to: string, count: number) {
    try {
      const contractAddress = this.configService.get<string>(
        "FORESTFEED_CONTRACT_ADDRESS"
      );

      const contractABI = Contract.abi;
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.signer
      );

      let gasPrice = await this.provider.getGasPrice();

      if (Number(gasPrice) > Numbers.MAX_GAS_PRICE) {
        throw new ForbiddenException(web3Errors.HIGH_GAS_PRICE);
      }

      let transaction = await contract.reward(from, to, count);
      let transactionResponse = await transaction.wait();

      const transactionHash = transactionResponse.transactionHash;

      return resultHandler(200, "reward distributed", transactionHash);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getWeb3Instance() {
    return this.web3Instance;
  }

  createWeb3SInstance(url, func) {
    if (this.web3SInstance) {
      this.web3SInstance.currentProvider.disconnect();
    }

    this.web3SInstance = new Web3(
      url
        ? url
        : this.configService.get<string>("NODE_ENV") === "test"
        ? this.configService.get<string>("WEB3S_PROVIDER_TEST")
        : this.configService.get<string>("WEB3S_PROVIDER")
    );

    const provider = this.web3SInstance.currentProvider;

    provider.on("connect", async () => {
      console.log("web3SInstance: reconnected");
      this.connectionStatus = true;

      if (this.ethereumEvents) {
        this.ethereumEvents.stop();
      }

      this.ethereumEvents = await func(this.web3SInstance);
    });

    provider.on("close", () => {
      console.log("web3SInstance: connection closed");
      this.connectionStatus = false;
      setTimeout(() => {
        if (!this.connectionStatus) {
          console.log("closed getWeb3SInstance");

          if (this.ethereumEvents) {
            this.ethereumEvents.stop();
          }

          // this.bugsnag.notify("closed getWeb3SInstance");

          this.createWeb3SInstance(url, func);
        }
      }, 10000);
    });

    this.web3SInstance.eth.net
      .isListening()
      .then(() => console.log("web3SInstance : is connected"))
      .catch((e) => {
        console.error("web3SInstance : Something went wrong : " + e);
      });
  }
}
