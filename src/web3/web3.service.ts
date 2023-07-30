import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SignedTransaction, Transaction, TransactionParams } from "./dto";

const Web3 = require("web3");

const Contract = require("./../../abi/Contract.json");

@Injectable()
export class Web3Service {
  
  private web3Instance;
  private web3SInstance;
  private connectionStatus;
  private ethereumEvents;

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

  async distributeReward(
    from: string,
    to: string,
    count: number,
    pendingRewardsAddress: string
  ) {
    try {
      const contractAddress = this.config.get<string>("CONTRACT_ADDRESS");

      const instance = new this.web3Instance.eth.Contract(
        Contract.abi,
        contractAddress
      );

      const tx = instance.methods.reward(
        from,
        to,
        count,
        pendingRewardsAddress
      );

      const sender = this.config.get<string>("SCRIPT_PUBLIC_KEY");

      const gasPrice: string = await this.web3Instance.eth.getGasPrice();
      const increasedGasPrice = parseInt(
        (parseInt(gasPrice) + parseInt(gasPrice) * 2).toString()
      );

      const data = tx.encodeABI();

      const transaction = await this.constructTransaction({
        from: sender,
        gasLimit: increasedGasPrice,
        gasPrice,
        to: contractAddress,
        value: "0x00",
        data,
      });

      const signedTransaction = await this.signTransaction(transaction);

      const recipientHash = await this.broadcastTransaction(signedTransaction);
      return recipientHash;
    } catch (error) {
      // console.log("error in func : ", error);

      throw new InternalServerErrorException(error.message);
    }
  }

  getWeb3Instance() {
    return this.web3Instance;
  }

  createWeb3SInstance(url,func) {

    if(this.web3SInstance){
      this.web3SInstance.currentProvider.disconnect();
    }

    this.web3SInstance = new Web3(
      url
        ? url
        : this.config.get<string>("NODE_ENV") === "test"
        ? this.config.get<string>("WEB3S_PROVIDER_TEST")
        : this.config.get<string>("WEB3S_PROVIDER")
    );

    const provider = this.web3SInstance.currentProvider;

    provider.on("connect", async () => {
      console.log("web3SInstance: reconnected");
      this.connectionStatus = true;

      if(this.ethereumEvents){
        this.ethereumEvents.stop()
      }
      
      this.ethereumEvents = await func(this.web3SInstance)
    });

    

    provider.on("close", () => {
      console.log("web3SInstance: connection closed");
      this.connectionStatus = false;
      setTimeout(() => {
        if (!this.connectionStatus) {
          console.log("closed getWeb3SInstance");

          if(this.ethereumEvents){
            this.ethereumEvents.stop()
          }

          // this.bugsnag.notify("closed getWeb3SInstance");

          this.createWeb3SInstance(url,func)
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

  private async constructTransaction(
    transactionParams: TransactionParams
  ): Promise<Transaction> {
    const transaction = {
      to: transactionParams.to,
      value: transactionParams.value,
      gasLimit: transactionParams.gasLimit,
      gasPrice: transactionParams.gasPrice,
      data: transactionParams.data,
      nonce: await this.web3Instance.getNonce(transactionParams.from),
    };
    return transaction;
  }

  private async signTransaction(
    transaction: Transaction
  ): Promise<SignedTransaction> {
    const privateKey = this.config.get("PRIVATE_KEY");
    const signedTransaction = await this.web3Instance.signTransaction(
      transaction,
      privateKey
    );

    return signedTransaction;
  }

  private async broadcastTransaction(
    signedTransaction: SignedTransaction
  ): Promise<string> {
    const transactionHash = await this.web3Instance.sendTransaction(
      signedTransaction
    );

    return transactionHash;
  }
}
