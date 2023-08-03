export class CreatePendingRewardDTO {
  from: string;
  to: string;
  amount: number;
  inList: boolean;
  order: number;
  campaignId: string;
  profileId: string;
  pubId: string;
  profileIdPointed: string;
  pubIdPointed: string;
  createdAt: Date;
  updatedAt: Date;
}
