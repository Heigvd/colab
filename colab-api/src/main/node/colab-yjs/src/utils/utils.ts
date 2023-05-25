import queryString from 'query-string';
import logger from './logger.js';

interface QueryParams {
  kind?: string;
  ownerId?: string;
  permission?: string;
}

/**
 *
 * @param url URL to extract query params from
 * @returns Params object indexed by string
 */
export function getQueryParams(url: string): QueryParams {
  const urlQuery = queryString.extract(url);
  const queryParams: QueryParams = queryString.parse(urlQuery);

  return queryParams;
}

/**
 *
 * @param url URL to generate doc name from
 * @returns String
 */
export function getDocName(url: string): string {
  const params = getQueryParams(url);
  const docName =
    params.kind === 'DeliverableOfCardContent' ? `${params.ownerId}d` : `${params.ownerId}r`;

  return docName;
}

/**
 *
 * @param err Error to handle
 */
export function onSocketError(err: Error) {
  logger.error(err);
}
