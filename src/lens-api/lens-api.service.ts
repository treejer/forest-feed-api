import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { LensApiErrorMessage } from "src/common/constants";

import {
  getFollowersCountQuery,
  getIsFollowedByProfileQuery,
  getProfileOwnerQuery,
  getPublicationOwnerQuery,
} from "src/common/graphQuery";
import { resultHandler } from "src/common/helpers";
import { Result } from "src/database/interfaces/result.interface";
import { FollowersCountResultDto, FollowingDataResultDto } from "./dto";
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
      throw new InternalServerErrorException(
        LensApiErrorMessage.LENS_URL_NOT_SET
      );
    }

    try {
      const postBody = {
        operationName: "Profile",
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
          totalFollowers: res.data.data.profile.stats.totalFollowers,
        });
      } else {
        throw new InternalServerErrorException(
          LensApiErrorMessage.ERROR_IN_GETTING_RESPONSE
        );
      }
    } catch (error) {
      throw new InternalServerErrorException("Graph failed !!");
    }
  }

  async getProfileAFollowedByProfileB(
    profile_a: string,
    profile_b: string
  ): Promise<Result<FollowingDataResultDto>> {
    if (!this.lensUrl) {
      throw new InternalServerErrorException(
        LensApiErrorMessage.LENS_URL_NOT_SET
      );
    }

    try {
      const postBody = {
        operationName: "Profile",
        query: getIsFollowedByProfileQuery(profile_a, profile_b),
        variables: {},
      };

      const res = await axios.post(this.lensUrl, postBody, {
        timeout: 4000,
        headers: {
          contentType: "application/json",
        },
      });

      if (res.data.data && res.data.data.profile) {
        return resultHandler(200, "get profile a followed by profile b", {
          isFollowing: res.data.data.profile.isFollowing,
        });
      } else {
        throw new InternalServerErrorException(
          LensApiErrorMessage.ERROR_IN_GETTING_RESPONSE
        );
      }
    } catch (error) {
      console.log("error", error);
      throw new InternalServerErrorException("Graph failed !!");
    }
  }

  async getPublicationOwner(publication_id: string): Promise<Result<string>> {
    if (!this.lensUrl) {
      throw new InternalServerErrorException(
        LensApiErrorMessage.LENS_URL_NOT_SET
      );
    }
    console.log("pppp", publication_id);

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
        res.data.data.publication.profile
      ) {
        return resultHandler(
          200,
          "get publication owner",
          res.data.data.publication.profile.ownedBy.toLowerCase()
        );
      } else {
        throw new InternalServerErrorException(
          LensApiErrorMessage.ERROR_IN_GETTING_RESPONSE
        );
      }
    } catch (error) {
      console.log("error", error);
      throw new InternalServerErrorException("Graph failed !!");
    }
  }

  async getProfileOWner(profile: string): Promise<Result<string>> {
    if (!this.lensUrl) {
      throw new InternalServerErrorException(
        LensApiErrorMessage.LENS_URL_NOT_SET
      );
    }

    try {
      const postBody = {
        operationName: "Profile",
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
          res.data.data.profile.ownedBy.toLowerCase()
        );
      } else {
        throw new InternalServerErrorException(
          LensApiErrorMessage.ERROR_IN_GETTING_RESPONSE
        );
      }
    } catch (error) {
      console.log("error", error);
      throw new InternalServerErrorException("Graph failed !!");
    }
  }
}
