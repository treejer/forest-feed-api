export const getIsFollowedByProfileQuery = (profile_a, profile_b) => {
  return `
  query followStatusBulk {
    followStatusBulk(request:
      {followInfos:{follower:"${profile_a}",profileId:"${profile_b}"}}) {
      follower
      profileId
      status {
        value
        isFinalisedOnchain
      }
    }
  }`;
};
