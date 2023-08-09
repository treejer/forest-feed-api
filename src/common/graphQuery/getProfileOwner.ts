export const getProfileOwnerQuery = (profile) => {
  return `
    query Profile {
        profile(request: { profileId: "${profile}" }) {
          ownedBy
        }
    }`;
};
