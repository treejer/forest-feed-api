export const getProfileOwnerQuery = (profile) => {
  return `
  query profile {
    profile(request: {forProfileId:"${profile}"}) {
    ownedBy{
      address
    }
    }
  }
  `;
};
