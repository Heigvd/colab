/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { ColabEntity, WithId } from 'colab-rest-client';

/**
 * Return a map of entities where key is their id and value is the entity
 */
export const mapById = <T extends WithId>(entities: T[]): { [id: number]: T } => {
  const map: { [id: number]: T } = {};
  entities.forEach(entity => {
    if (entity.id != null) {
      map[entity.id] = entity;
    }
  });
  return map;
};

export function isAlive(colabEntity: ColabEntity): boolean {
  return colabEntity.deletionStatus == null;
}

// export const updateById = <T extends WithId>(entities: T[], entity: T): void => {
//   const index = entities.findIndex(item => entity.id === item.id);
//   if (index >= 0) {
//     // entity exists in array:replace it
//     entities.splice(index, 1, entity);
//   } else {
//     // entity not found, add it
//     entities.push(entity);
//   }
// };
