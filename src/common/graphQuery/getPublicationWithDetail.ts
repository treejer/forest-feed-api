export const getPublicationWithDetailQuery = (publication_id) => {
  return `
      query Publication {
          publication(request: {
            publicationId: "${publication_id}"
          }) {
           __typename 
            
            ... on Mirror {
              ...MirrorFields
            }
          }
        }
        
        
        fragment ProfileFields on Profile {
          id
          ownedBy
        }
        
        fragment PostFields on Post {
          id
          profile {
            ...ProfileFields
          }
          appId
          hidden
        }
        
        fragment MirrorBaseFields on Mirror {
          id
          profile {
            ...ProfileFields
          }
          appId
          hidden
        }
        
        fragment MirrorFields on Mirror {
          ...MirrorBaseFields
          mirrorOf {
           ... on Post {
              ...PostFields          
           }
          }
        }`;
};
