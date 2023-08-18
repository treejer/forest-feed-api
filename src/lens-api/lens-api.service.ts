import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { LensApiErrorMessage } from "src/common/constants";

import {
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
        return resultHandler(404, "not found", {
          totalFollowers: "",
        });
      }
    } catch (error) {
      throw new ForbiddenException("Graph failed !!");
    }
  }

  async getProfileAFollowedByProfileB(
    profile_a: string,
    profile_b: string
  ): Promise<Result<FollowingDataResultDto>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
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
        return resultHandler(404, "not found", {
          isFollowing: "",
        });
      }
    } catch (error) {
      console.log("error", error);
      throw new ForbiddenException("Graph failed !!");
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
        res.data.data.publication.profile
      ) {
        return resultHandler(
          200,
          "get publication owner",
          res.data.data.publication.profile.ownedBy.toLowerCase()
        );
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new ForbiddenException("Graph failed !!");
    }
  }

  async getProfileOWner(profile: string): Promise<Result<string>> {
    if (!this.lensUrl) {
      throw new ForbiddenException(LensApiErrorMessage.LENS_URL_NOT_SET);
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
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new ForbiddenException("Graph failed !!");
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
      console.log("ressssss", res.data.data);

      if (res.data.data && res.data.data.publication) {
        return resultHandler(200, "get publication detail", {
          from: res.data.data.publication.mirrorOf.profile.ownedBy,
          to: res.data.data.publication.profile.ownedBy,
          deleted: res.data.data.publication.hidden,
        });
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new ForbiddenException("Graph failed !!");
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
          res.data.data.publication.hidden
        );
      } else {
        return resultHandler(404, "not found", "");
      }
    } catch (error) {
      console.log("error", error);
      throw new ForbiddenException("Graph failed !!");
    }
  }
}
