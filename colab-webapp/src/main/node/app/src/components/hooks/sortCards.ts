/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card } from 'colab-rest-client';
import { compareById } from '../../selectors/selectorHelper';

/**
 * This function is a virtual click/doubleclick handler.
 * It never trigers the simple click if the double is called.
 * @param subCards - subCards to sort with position
 */
export const useSortSubcardsWithPos = (subCards: Card[] | undefined | null): Card[] | undefined => {
  if (!subCards) {
    return undefined;
  } else {
    return subCards.sort(compareCards);
  }
};

function compareCards(a: Card, b: Card): number {
  // sort by position
  const byY = a.y - b.y;
  if (byY != 0) {
    return byY;
  }

  const byX = a.x - b.x;
  if (byX != 0) {
    return byX;
  }

  // then by id to be deterministic
  return compareById(a, b);
}
