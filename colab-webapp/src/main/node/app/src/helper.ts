/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { HttpSession, TeamMember, User } from 'colab-rest-client';
import { escapeRegExp } from 'lodash';
import logger from './logger';

// *************************************************************************************************
// String format check through regular expressions

/**
 * Check that the email format is valid
 */
export function assertEmailFormat(data: string) {
  return data.match(emailFormat) != null;
}

const emailFormat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * Check that the username format is valid
 */
export function assertUserNameFormat(data: string) {
  return data.match(userNameFormat) != null;
}

const userNameFormat = /^[a-zA-Z0-9._-]+$/;

/**
 * Filter data of the list to only those matching the regular expressions
 */
export function regexFilter<T>(
  list: T[],
  search: string,
  matchFn: (regex: RegExp, item: T) => boolean,
): T[] {
  if (search.length <= 0) {
    return list;
  }

  const regexes = search.split(/\s+/).map(regex => new RegExp(escapeRegExp(regex), 'i'));

  return list.filter(item => {
    return regexes.reduce<boolean>((acc, regex) => {
      if (acc == false) {
        return false;
      }
      return matchFn(regex, item);
    }, true);
  });
}

// *************************************************************************************************
// sorting

/**
 * Sort strings : null first, then according to language
 */
export function sortSmartly(
  a: string | null | undefined,
  b: string | null | undefined,
  lang: string,
) {
  if (a == null || b == null) {
    return 0;
  }

  if (a == null && b != null) {
    return 1;
  }

  if (a != null && b == null) {
    return -1;
  }

  return a.localeCompare(b, lang, { numeric: true });
}

// *************************************************************************************************
// developpment tools

/**
 * Logs an error and, as it is typed as never, it throws a compilation error if a case is missing.
 */
// Advice : add this comment before when using it // If next line is erroneous, it means a type of xxx is not handled
export function assertUnreachable(x: never): void {
  logger.error(x);
}

// *************************************************************************************************
//

export function getDisplayName(
  user: User | undefined | null,
  teamMember?: TeamMember,
): string | null {
  return (
    (user != null
      ? user.commonname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username
      : '') ||
    teamMember?.displayName ||
    null
  );
}

export function buildLinkWithQueryParam(
  baseUrl: string,
  queryParameters?: { [key: string]: string | null | undefined },
): string {
  if (queryParameters == null) {
    return baseUrl;
  } else {
    return (
      baseUrl +
      '?' +
      Object.entries(queryParameters)
        .map(kv =>
          kv[0] && kv[1] ? encodeURIComponent(kv[0]) + '=' + encodeURIComponent(kv[1]) : null,
        )
        .filter(param => !!param)
        .join('&')
    );
  }
}

export function removeAllItems(array: unknown[], items: unknown[]): void {
  items.forEach(item => {
    const index = array.indexOf(item);
    if (index >= 0) {
      array.splice(index, 1);
    }
  });
}

/**
 * Determine if the session is the current one
 */
export function isMySession(session: HttpSession) {
  return session.userAgent === navigator.userAgent;
}
