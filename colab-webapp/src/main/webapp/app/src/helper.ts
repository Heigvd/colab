import { User, WithId } from 'colab-rest-client';

/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

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
