export const getPublicationWithDetailQuery = (publication_id) => {
  return `
  query Publication {publication(request: {forId: "${publication_id}"}) {
    ... on Mirror {
      id
      by {
        id
        ownedBy {
          address
        }
      }
      isHidden
      mirrorOn{
        __typename
        ... on Post {
          id
          by {
            id
            ownedBy {
              address
            }
          }
          isHidden
        }
      }
    }
  }
}
`;
};
