/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { HttpSession, TeamMember, User, WithId } from 'colab-rest-client';
import { escapeRegExp } from 'lodash';
import logger from './logger';

export const emailFormat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

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

export const getDisplayName = (
  user: User | undefined | null,
  teamMember?: TeamMember,
): string | null => {
  return (
    (user != null
      ? user.commonname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username
      : '') ||
    teamMember?.displayName ||
    null
  );
};

export const mapById = <T extends WithId>(entities: T[]): { [id: number]: T } => {
  const map: { [id: number]: T } = {};
  entities.forEach(entity => {
    if (entity.id != null) {
      map[entity.id] = entity;
    }
  });
  return map;
};

export const updateById = <T extends WithId>(entities: T[], entity: T): void => {
  const index = entities.findIndex(item => entity.id === item.id);
  if (index >= 0) {
    // entity exists in array:replace it
    entities.splice(index, 1, entity);
  } else {
    // entity not found, add it
    entities.push(entity);
  }
};

export const buildLinkWithQueryParam = (
  baseUrl: string,
  queryParameters?: { [key: string]: string | null | undefined },
): string => {
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
};

export const removeAllItems = (array: unknown[], items: unknown[]): void => {
  items.forEach(item => {
    const index = array.indexOf(item);
    if (index >= 0) {
      array.splice(index, 1);
    }
  });
};

export function checkUnreachable(x: never): void {
  logger.error(x);
}

export function regexFilter<T>(
  list: T[],
  search: string,
  matchFn: (regex: RegExp, item: T) => boolean,
): T[] {
  if (search.length <= 0) {
    return list;
  }

  const regexes = search.split(/\s+/).map(token => new RegExp(escapeRegExp(token), 'i'));

  return list.filter(item => {
    return regexes.reduce<boolean>((acc, regex) => {
      if (acc == false) {
        return false;
      }
      return matchFn(regex, item);
    }, true);
  });
}

/**
 * Determine if the session is the current one
 */
export function isMySession(session: HttpSession) {
  return session.userAgent === navigator.userAgent;
}
