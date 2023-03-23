/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { WithId } from 'colab-rest-client';

export function compareById(a: WithId, b: WithId): number {
  return (a.id || 0) - (b.id || 0);
}
