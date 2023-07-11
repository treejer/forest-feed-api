import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const Web3 = require("web3");

const Contract = require("./../../abi/Contract.json");

@Injectable()
export class Web3Service {
  private web3Instance;
  constructor(private config: ConfigService) {
    this.web3Instance = new Web3(
      config.get<string>("NODE_ENV") === "test"
        ? config.get<string>("WEB3_PROVIDER_TEST")
        : config.get<string>("WEB3_PROVIDER")
    );

    this.web3Instance.eth.net
      .isListening()
      .then(() => console.log("web3Instance : is connected"))
      .catch((e) =>
        console.error("web3Instance : Something went wrong : " + e)
      );
  }

  async callMethod() {
    try {
      const instance = new this.web3Instance.eth.Contract(
        Contract.abi,
        this.config.get<string>("CONTRACT_ADDRESS")
      );

      await instance.methods.methodName();
    } catch (error) {
      console.log("error in func : ", error);

      throw new InternalServerErrorException(error.message);
    }
  }

  getWeb3Instance() {
    return this.web3Instance;
  }

  getWeb3SInstance(url?: string) {
    let web3SInstance = new Web3(
      url
        ? url
        : this.config.get<string>("NODE_ENV") === "test"
        ? this.config.get<string>("WEB3S_PROVIDER_TEST")
        : this.config.get<string>("WEB3S_PROVIDER")
    );

    web3SInstance.eth.net
      .isListening()
      .then(() => console.log("web3SInstance : is connected"))
      .catch((e) => {
        console.error("web3SInstance : Something went wrong : " + e);
        throw new InternalServerErrorException(e.message);
      });

    return web3SInstance;
  }
}
