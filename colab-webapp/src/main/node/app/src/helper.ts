/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardContent, User, WithId } from 'colab-rest-client';
import logger from './logger';

export const emailFormat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export const getDisplayName = (user: User): string => {
  return (
    user.commonname || `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username
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

/**
 * Convert CardContent status to comparable numbers
 */
function statusOrder(c: CardContent) {
  switch (c.status) {
    case 'ACTIVE':
      return 1;
    case 'POSTPONED':
      return 2;
    case 'ARCHIVED':
      return 3;
    case 'REJECTED':
    default:
      return 4;
  }
}

export function sortCardContents(contents: CardContent[]): CardContent[] {
  return contents.sort((a, b) => {
    const aStatus = statusOrder(a);
    const bStatus = statusOrder(b);

    if (aStatus === bStatus) {
      return (a.title || '').localeCompare(b.title || '', 'en', { numeric: true });
    } else {
      return aStatus - bStatus;
    }
  });
}
