export class Transaction {
  to: string;
  value: string;
  gasLimit: number;
  gasPrice: string;
  data?: string;
  nonce: number;
}
