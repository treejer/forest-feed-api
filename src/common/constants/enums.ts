export enum CollectionNames {
  USER = "users",
  LAST_STATE = "laststates",
  PENDING_REWARDS = "pendingrewards",
  CAMPAIGN = "campaigns",
}

export enum Role {
  USER = 1,
  SCRIPT = 2,
  ADMIN = 3,
}

export enum UserStatus {
  NOT_VERIFIED = 1,
  PENDING = 2,
  VERIFIED = 3,
}

export enum LensEventName {
  Mirror_CREATED = "MirrorCreated",
}

export enum ForestFeedEventName {
  DEPOSITED = "Deposited",
}

export enum LastStateIds {
  BALANCE = "42414c414e43450000000000",
  MIRROR = "4d4952524f52000000000000",
}

export const CONFIG = {
  TREE_PRICE: "10000000000000000000",
};
export enum RewardStatus {
  PENDING = 1,
  CONFIRMED = 2,
  REJECTED = 3,
}
