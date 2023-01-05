/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document } from 'colab-rest-client';

/** a document is owned either by a deliverable of a card content or by a resource */
export type DocumentOwnership = {
  kind: 'DeliverableOfCardContent' | 'PartOfResource';
  ownerId: number;
};

export type DocumentKind = Document['@class'];
