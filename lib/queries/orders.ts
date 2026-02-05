export const GET_ORDERS_FOR_PRODUCT = `
  query GetOrdersForProduct($query: String!, $first: Int!, $cursor: String) {
    orders(first: $first, after: $cursor, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 50) {
            edges {
              node {
                id
                title
                quantity
                product {
                  id
                }
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                discountedUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_ORDERS_BY_DATE_RANGE = `
  query GetOrdersByDateRange($first: Int!, $cursor: String, $query: String!) {
    orders(first: $first, after: $cursor, query: $query, sortKey: CREATED_AT) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 100) {
            edges {
              node {
                id
                quantity
                product {
                  id
                }
                originalUnitPriceSet {
                  shopMoney {
                    amount
                  }
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export interface ShopifyOrder {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus?: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title?: string;
        quantity: number;
        product?: {
          id: string;
        };
        originalUnitPriceSet: {
          shopMoney: {
            amount: string;
            currencyCode?: string;
          };
        };
        discountedUnitPriceSet?: {
          shopMoney: {
            amount: string;
            currencyCode?: string;
          };
        };
      };
    }>;
  };
}

export interface GetOrdersResponse {
  orders: {
    edges: Array<{
      node: ShopifyOrder;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage?: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  };
}
