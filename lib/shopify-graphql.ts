import { getShopifyClient } from './shopify';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * Execute a GraphQL query against the Shopify Admin API.
 */
export async function executeGraphQL<T>(
  shop: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = await getShopifyClient(shop);

  const response = await client.request<T>(query, { variables });

  if ('errors' in response && response.errors) {
    const errorMessages = (response.errors as Array<{ message: string }>)
      .map((e) => e.message)
      .join(', ');
    throw new Error(`GraphQL errors: ${errorMessages}`);
  }

  return response.data as T;
}

/**
 * Paginate through all results of a GraphQL query.
 * Handles cursor-based pagination automatically.
 */
export async function paginateGraphQL<T, N>(
  shop: string,
  query: string,
  variables: Record<string, unknown>,
  getNodes: (data: T) => N[],
  getPageInfo: (data: T) => PageInfo,
  maxPages: number = 100
): Promise<N[]> {
  const allNodes: N[] = [];
  let cursor: string | undefined;
  let pageCount = 0;

  do {
    const data = await executeGraphQL<T>(shop, query, {
      ...variables,
      cursor,
    });

    const nodes = getNodes(data);
    allNodes.push(...nodes);

    const pageInfo = getPageInfo(data);
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : undefined;
    pageCount++;
  } while (cursor && pageCount < maxPages);

  return allNodes;
}
