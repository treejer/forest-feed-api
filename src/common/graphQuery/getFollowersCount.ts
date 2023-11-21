export const getFollowersCountQuery = (profile_id) => {
  return `
  query profile {
    profile(request: {forProfileId:"${profile_id}"}) {
      stats {
        followers
        following
      }
    }
  }`;
};
