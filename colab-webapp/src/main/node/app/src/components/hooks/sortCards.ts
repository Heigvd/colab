/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card } from 'colab-rest-client';

/**
 * This function is a virtual click/doubleclick handler.
 * It never trigers the simple click if the double is called.
 * @param subCards - subCards to sort with position
 */
export const useSortSubcardsWithPos = (subCards: Card[] | undefined | null): Card[] | undefined => {
  if (!subCards) {
    return undefined;
  } else {
    return subCards.sort(function (a, b) {
      if (a.y - b.y === 0) {
        return a.x - b.x;
      } else return a.y - b.y;
    });
  }
};
