/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import http from 'http';
import queryString from 'query-string';
import logger from './logger.js';

/**
 * Data owned by a card content
 */
// WARNING : DO NOT CHANGE THE KEYWORD. IT IS USED IN PAYARA SERVER AND CLIENT
const CARD_CONTENT_KIND = 'DeliverableOfCardContent';

/**
 * Data owned by a resource
 */
// WARNING : DO NOT CHANGE THE KEYWORD. IT IS USED IN PAYARA SERVER AND CLIENT
const RESOURCE_KIND = 'PartOfResource';

interface QueryParams {
  ownerId?: string;
  kind?: string;
  toDuplicateId?: string;
  toDuplicateKind?: string;
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
 * Retrieve the document name matching the ownerKind and ownerId params in the url
 *
 * @param url URL to generate doc name from
 * @returns String
 */
export function getDocNameFromUrl(url: string): string {
  const params = getQueryParams(url);
  const docName = getDocName(params.kind, params.ownerId);

  return docName;
}

/**
 * Retrieve the document name matching the ownerKind and ownerId
 *
 * @param ownerKind what is the kind of the owner
 * @param ownerId
 * @returns String
 */
export function getDocName(ownerKind: string | undefined, ownerId: string | undefined): string {
  if (ownerKind === CARD_CONTENT_KIND) {
    return `${ownerId}d`;
  }

  if (ownerKind === RESOURCE_KIND) {
    return `${ownerId}r`;
  }

  throw new Error('The ownerKind ' + ownerKind + ' is not handled');
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

  const endpoint = params.kind === CARD_CONTENT_KIND ? 'cardContents' : 'resources';
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
