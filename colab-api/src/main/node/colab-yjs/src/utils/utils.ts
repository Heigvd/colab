import http from 'http';
import queryString from 'query-string';
import logger from './logger.js';

interface QueryParams {
  ownerId?: string;
  kind?: string;
  duplicateId?: string;
  duplicateKind?: string;
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
 * @param request incoming request
 * @param payaraHost payara host url
 * @returns boolean, request accept or not
 */
export async function authorizeWithPayara(request: http.IncomingMessage, payaraHost: string) {
  if (request.url == undefined) return false;

  const params = getQueryParams(request.url);
  const cookie = request.headers.cookie;

  if (!cookie) return false;
  if (!cookie || !params?.kind || !params?.ownerId) return false;

  const endpoint = params.kind === 'DeliverableOfCardContent' ? 'cardContents' : 'resources';
  const url = `${payaraHost}api/${endpoint}/${params.ownerId}/assertReadWrite`;

  try {
    const authRes = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
    });
    return authRes.status < 400;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

/**
 *
 * @param err Error to handle
 */
export function onSocketError(err: Error) {
  logger.error(err);
}
