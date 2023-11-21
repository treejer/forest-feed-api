export const getDATransactionsQuery = (limit, cursor) => {
  return `
  query momokaTransactions {
    momokaTransactions(request: {limit:${limit},cursor:${cursor}}) {
      items {
        __typename
        ... on MomokaPostTransaction {
          transactionId
          publication {
            id  
        }
        }
        ... on MomokaCommentTransaction {
          transactionId
          publication {
            id
          }
        }
        ... on MomokaMirrorTransaction {
          transactionId
          submitter
          publication {
            id
          }
          mirrorOn {
            __typename
            ... on Post {
              id          }
            ... on Comment {
              id
            }
            ... on Quote {
              id
            }
          }
        }
         ... on MomokaQuoteTransaction {
          transactionId
          submitter
          publication {
            id
          }
          quoteOn{
            __typename
            ... on Post {
              id
            }
            ... on Comment {
              id
            }
            ... on Quote {
              id
            }
          
          }
        }
      }
      pageInfo {
        prev
        next
      }
    }
  }`;
};
