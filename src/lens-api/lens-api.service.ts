import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { LensApiErrorMessage } from "src/common/constants";

import { getFollowersCountQuery } from "src/common/graphQuery/getFollowersCount";
@Injectable()
export class LensApiService {
  constructor(private config: ConfigService) {}

  async getFollowersCount(profileId: string) {
    const lensUrl = this.config.get<string>("LENS_URL");
    console.log("lesn", lensUrl);

    if (!lensUrl) {
      throw new InternalServerErrorException(
        LensApiErrorMessage.LENS_URL_NOT_SET
      );
    }

    try {
      const postBody = {
        operationName: "Profile",
        query: getFollowersCountQuery.replace(
          /PROFILE_ID/g,
          profileId.toLowerCase()
        ),
        variables: {},
      };
      console.log("post", postBody);

      const res = await axios.post(lensUrl, postBody, {
        headers: {
          contentType: "application/json",
        },
      });
      console.log("res", res.data.data);
    } catch (error) {
      console.log("error", error);
      throw new InternalServerErrorException("Graph failed !!");
    }
  }
}
