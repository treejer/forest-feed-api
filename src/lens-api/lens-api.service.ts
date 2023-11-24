import { ForbiddenException, HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { LensApiErrorMessage } from "src/common/constants";

import {
  getDATransactionsQuery,
  getFollowersCountQuery,
  getIsFollowedByProfileQuery,
  getProfileOwnerQuery,
  getPublicationIsDeletedQuery,
  getPublicationOwnerQuery,
  getPublicationWithDetailQuery,
} from "src/common/graphQuery";
import { resultHandler } from "src/common/helpers";
import { Result } from "src/database/interfaces/result.interface";
import {
  FollowersCountResultDto,
  FollowingDataResultDto,
  MirroredPublicationWithDetailResultDto,
} from "./dto";
import { number } from "yargs";
@Injectable()
export class LensApiService {
  private readonly lensUrl;

  constructor(private config: ConfigService) {
    this.lensUrl = this.config.get<string>("LENS_URL");
  }

  async getFollowersCount(
    profileId: string
  ): Promise<Result<FollowersCountResultDto>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "profile",
        query: getFollowersCountQuery(profileId),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (
        res.data.data &&
        res.data.data.profile &&
        res.data.data.profile.stats
      ) {
        return resultHandler(200, "get followers count", {
          totalFollowers: res.data.data.profile.stats.followers,
        });
      } else {
        return resultHandler(404, "not found", {
          totalFollowers: "",
        });
      }
    } catch (error) {
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getProfileAFollowingProfileB(
    profile_a: string,
    profile_b: string
  ): Promise<Result<FollowingDataResultDto>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "followStatusBulk",
        query: getIsFollowedByProfileQuery(profile_a, profile_b),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (
        res.data.data &&
        res.data.data.followStatusBulk &&
        res.data.data.followStatusBulk[0]
      ) {
        return resultHandler(200, "get profile a following profile b", {
          isFollowing: res.data.data.followStatusBulk[0].status.value,
        });
      } else {
        return resultHandler(404, "not found", {
          isFollowing: "",
        });
      }
    } catch (error) {
      console.log("error", error);
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getPublicationOwner(publication_id: string): Promise<Result<string>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "Publication",
        query: getPublicationOwnerQuery(publication_id),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (
        res.data.data &&
        res.data.data.publication &&
        res.data.data.publication.by
      ) {
        return resultHandler(
          200,
          "get publication owner",
          res.data.data.publication.by.ownedBy.address.toLowerCase()
        );
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getProfileOWner(profile: string): Promise<Result<string>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "profile",
        query: getProfileOwnerQuery(profile),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (res.data.data && res.data.data.profile) {
        return resultHandler(
          200,
          "get profile owner",
          res.data.data.profile.ownedBy.address.toLowerCase()
        );
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getMirroredPublicationDetail(
    publicationId: string
  ): Promise<Result<MirroredPublicationWithDetailResultDto>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "Publication",
        query: getPublicationWithDetailQuery(publicationId),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (res.data.data && res.data.data.publication) {
        return resultHandler(200, "get publication detail", {
          from: res.data.data.publication.mirrorOn.by.ownedBy.address,
          fromProfileId: res.data.data.publication.mirrorOn.by.id,
          toProfileId: res.data.data.publication.by.id,
          to: res.data.data.publication.by.ownedBy.address,
          deleted: res.data.data.publication.isHidden,
        });
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getMirroredPublicationStatus(
    publicationId: string
  ): Promise<Result<boolean>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }

    try {
      const postBody = {
        operationName: "Publication",
        query: getPublicationIsDeletedQuery(publicationId),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (res.data.data && res.data.data.publication) {
        return resultHandler(
          200,
          "get publication detail",
          res.data.data.publication.isHidden
        );
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new HttpException("Graph failed !!", 499);
    }
  }

  async getDATransactions(cursor: any, limit: string) {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
    }
    if (!["Ten", "TwentyFive", "Fifty"].includes(limit)) {
      throw new ForbiddenException(LensApiErrorMessage.INVALID_LIMIT);
    }

    try {
      const postBody = {
        operationName: "momokaTransactions",
        query: getDATransactionsQuery(limit, cursor),
        variables: {},
      };
      console.log("post", postBody);

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 30000,
        headers: {
          contentType: "application/json",
        },
      });
      console.log("res.data.data", res.data.data);

      if (res.data.data && res.data.data.momokaTransactions) {
        return resultHandler(200, "get publication detail", {
          items: res.data.data.momokaTransactions.items,
          pageInfo: res.data.data.momokaTransactions.pageInfo,
        });
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new HttpException("Graph failed !!", 499);
    }
  }
}
