export const getIsFollowedByProfileQuery = (profile_a, profile_b) => {
  return `
  query Profile {
      profile(request: { profileId: "${profile_a}" }) {
        isFollowing(who:"${profile_b}")
        ownedBy
      }
  }`;
};
