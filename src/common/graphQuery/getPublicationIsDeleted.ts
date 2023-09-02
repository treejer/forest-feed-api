export const getPublicationIsDeletedQuery = (publication_id) => {
  return `
  query Publication {
    publication(request: {
      publicationId: "${publication_id}"
    }) {
     __typename 
      
      ... on Mirror {
        hidden
      }
    }
  }`;
};
