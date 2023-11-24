export const getPublicationIsDeletedQuery = (publication_id) => {
  return `
  query Publication {
    publication(request: {forId: "${publication_id}"}) {
      ... on Mirror {
        isHidden
      }
    }
  }`;
};
