/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent } from 'colab-rest-client';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { isAlive } from '../../store/storeHelper';

/*
 * All card and card content rights access
 */

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useIsCardReadOnly({
  card,
  cardContent,
}: {
  card: Card;
  cardContent?: CardContent;
}): boolean {
  const { canWrite } = useCardACLForCurrentUser(card.id);
  return (
    !canWrite ||
    cardContent?.frozen ||
    !isAlive(card) ||
    (cardContent != null && !isAlive(cardContent))
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useCanCardContentBeUnlocked({ card }: { card: Card }): boolean {
  const { canWrite } = useCardACLForCurrentUser(card.id);
  return canWrite && isAlive(card);
}

export function useCanCardDeletionStatusBeChanged({ card }: { card: Card }): boolean {
  const { canWrite } = useCardACLForCurrentUser(card.id);
  return canWrite;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
