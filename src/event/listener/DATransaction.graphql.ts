export const DataAvailabilityTransaction = (request) => {
  return `
      query DataAvailabilityTransaction {
        dataAvailabilityTransaction(request: "${request}") {
          ... on DataAvailabilityMirror {
            ...DAMirrorFields
          }
        }
      }
      
      fragment DAMirrorFields on DataAvailabilityMirror {
        transactionId
        submitter
        createdAt
        appId
        profile {
            ...ProfileFields
            __typename
        }
        publicationId
        mirrorOfProfile {
            ...ProfileFields
            __typename
        }
        mirrorOfPublicationId
        __typename
      }`;
};
