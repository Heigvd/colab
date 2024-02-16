/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { DeletionStatus, WithId } from 'colab-rest-client';

export function compareById(a: WithId, b: WithId): number {
  return (a.id || 0) - (b.id || 0);
}

/**
 * Convert a deletion status to comparable numbers
 */
export function deletionStatusOrder(status: DeletionStatus | null | undefined) {
  if (status == null) {
    return 1;
  }
  switch (status) {
    case 'BIN':
      return 2;
    case 'TO_DELETE':
      return 3;
    default:
      return 4;
  }
}
