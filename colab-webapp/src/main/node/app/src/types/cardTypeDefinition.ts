/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardType, CardTypeRef } from 'colab-rest-client';
import { AvailabilityStatus } from '../store/store';

export interface CardTypeOnOneSOwn {
  kind: 'own';

  ownId: CardType['id'];
  id: CardType['id'];
  cardTypeId: CardType['id'];

  deprecated: CardType['deprecated'];
  published: CardType['published'];

  title: CardType['title'];
  purposeId: CardType['purposeId'];
  tags: CardType['tags'];

  trackingDataCT: CardType['trackingData'];

  projectId: CardType['projectId'];
}

export interface CardTypeWithRef {
  kind: 'referenced'; // | 'global'

  ownId: CardTypeRef['id'];
  id: CardTypeRef['id'];
  cardTypeId: CardType['id'];

  refChain: CardTypeRef[];

  deprecated: CardTypeRef['deprecated'];
  deprecatedCT: CardType['deprecated'];

  published: CardTypeRef['published'];
  publishedCT: CardType['published'];

  title: CardType['title'];
  purposeId: CardType['purposeId'];
  tags: CardType['tags'];

  trackingDataCTRef: CardTypeRef['trackingData'];
  trackingDataCT: CardType['trackingData'];

  projectId: CardTypeRef['projectId'];
  projectIdCT: CardType['projectId'];
}

export type CardTypeAllInOne = CardTypeOnOneSOwn | CardTypeWithRef;

export type CardTypeAndStatus = {
  cardType: CardTypeAllInOne | undefined;
  status: AvailabilityStatus;
};
