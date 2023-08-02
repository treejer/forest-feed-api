import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Wallet, ethers } from "ethers";
import { resultHandler } from "src/common/helpers";
import { Numbers, web3Errors } from "src/common/constants";

const Contract = require("./../../abi/Contract.json");

@Injectable()
export class Web3Service {
  private readonly signer;
  private readonly provider;

  constructor(private configService: ConfigService) {
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
}
