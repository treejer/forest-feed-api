export const AuthErrorMessages = {
  INVALID_WALLET: "invalid wallet",
  USER_NOT_EXIST: "user not exist",
  INVALID_CREDENTIALS: "invalid credentials",
  INVALID_ROLE: "invalid role",
  UNAUTHORIZED: "Unauthorized",
};

export const StatusErrorMessage = {
  BAD_REQUEST: "Bad Request",
  NOT_FOUND: "Not Found",
};

export const SignatureError = {
  INVALID_SIGNATURE_LENTGH: "Invalid signature length",
};

export const LensApiErrorMessage = {
  LENS_URL_NOT_SET: "LENS SOURCE URL NOT SET",
  ERROR_IN_GETTING_RESPONSE: "Error in getting response from lens",
};

export const CampaignErrorMessage = {
  PUBLICATION_HAS_ACTIVE_CAMPAIGN:
    "there is active campaign for this publication.",
  CREATOR_IS_NOT_OWNER: "campaign creator is not publication owner",
  CAMPAIGNS_SIZE_IS_MORE_THAN_YOUR_CAPACITY:
    "campaigns size is more than your capacity",
  CALLER_IS_NOT_CAMPAIGN_CREATOR:
    "Invalid access! caller is not campaign creator",
  PENDING_REWARD_FOR_CAMPAIGN: "there is pending reward for this campaign",
  INVALID_CAMPAIGN_STATUS: "invalid campaign status",
  INVALID_ACCESS: "invalid access",
  NOT_FOUND: "campaign not found",
};

export const UserApiErrorMessage = {
  USER_NOT_FOUND: "user not found",
  TRANSACTION_DUPLICATED: "Transaction Duplicated.",
};

export const web3Errors = {
  HIGH_GAS_PRICE: "gas price is high",
};

export const pendingWithdrawsErrorMessage = {
  INSUFFICIENT_ERROR: "Insufficient error",
};

export const EventHandlerErrors = {
  CAMPAIGN_NOT_FOUND: "campaign not found!",
  CANT_GET_FROM: "can't get from address",
  CANT_GET_TO: "can't get to address",
  ALREADY_MIRRORED: "already mirrored",
  CANT_GET_FOLLOWED_DATA: "can't get followed data",
  IS_FOLLOWING: "can't get is following data",
  NOT_FOLLOWING_POST_OWNER: "not following post owner",
  MIN_FOLLOWER_NOT_SATISFIED: "min follower not satisfied",
  MIRROR_POST_DELETED: "mirrored post deleted",
  PENDING_REWARD_NOT_FOUND: "pending reward not found",
  PUBLICATION_NOT_FOUND: "publication not found",
};
