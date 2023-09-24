export const getDATransactionsQuery = (limit, cursor) => {
  return `
    query DATransactions {
        dataAvailabilityTransactions(request:{limit:"${limit}",cursor:${cursor}}) {
          items {
            __typename
               ... on DataAvailabilityPost {
              ...DAPostFields
            }
            ... on DataAvailabilityComment {
              ...DACommentFields
            }
            ... on DataAvailabilityMirror {
              ...DAMirrorFields
            }
          
          }
          pageInfo {
            __typename
            next
            prev
          }
        
          
        }
      }
      
      fragment DAPostFields on DataAvailabilityPost {
        transactionId
        publicationId
      
      }
      
       fragment DACommentFields on DataAvailabilityComment {
        transactionId
        publicationId
      }
      
      fragment DAMirrorFields on DataAvailabilityMirror {
          transactionId
          submitter
          publicationId
          mirrorOfPublicationId
          verificationStatus {
            ... on DataAvailabilityVerificationStatusSuccess {
              verified
            }
            ... on DataAvailabilityVerificationStatusFailure {
              status
            }
          }
        }`;
};
