export class CreatePendingRewardDTO {
  from: string;
  to: string;
  amount: number;
  inList: boolean;
  order: number;
  campaignId: string;
  status: number;
}
