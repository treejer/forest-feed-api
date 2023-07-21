export const getFollowersCountQuery = (profile_id) => {
  return `
  query Profile {
      profile(request: { profileId: "${profile_id}" }) {

        stats {
          totalFollowers
          totalFollowing
          
        }
      }
  }`;
};
