export const getFollowersCountQuery = `
  query Profile {
      profile(request: { profileId: "0x01" }) {
        id
        name
        bio
        ownedBy
        stats {
          totalFollowers
          totalFollowing
          
        }
        isFollowing(who:"0x02")
      }
  }`;
