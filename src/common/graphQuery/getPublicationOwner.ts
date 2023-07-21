export const getPublicationOwnerQuery = (publication_id) => {
  return `
  query Publication {
    publication(request: {
      publicationId: "${publication_id}"
    }) {
     __typename 
      ... on Post {
        ...PostFields
      }
     
    }
  }
  fragment ProfileFields on Profile {
    ownedBy
  }
  
  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
  }`;
};
