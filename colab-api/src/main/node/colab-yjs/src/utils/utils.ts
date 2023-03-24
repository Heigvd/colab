import queryString from "query-string";
import logger from "./logger.js";

interface QueryParams {
  docId?: string;
  permission?: string;
}

/**
 *
 * @param url URL to extract query params from
 * @returns Params object index by string
 */
export function getQueryParams(url: string): QueryParams {
  const urlQuery = queryString.extract(url);
  const queryParams: QueryParams = queryString.parse(urlQuery);

  return queryParams;
}

/**
 *
 * @param err Error to handle
 */
export function onSocketError(err: Error) {
  logger.error(err);
}
