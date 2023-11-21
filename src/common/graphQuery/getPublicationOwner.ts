export const getPublicationOwnerQuery = (publication_id) => {
  return `
  query Publication {
    publication(request: {
      forId: "${publication_id}"}) {
        ... on Post {
          by {
            id
            ownedBy {
              address
            }
          }
        }
      }
    }`;
};
