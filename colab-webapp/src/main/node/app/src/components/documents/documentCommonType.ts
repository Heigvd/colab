/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

/** a document is owned either by a deliverable of a card content or by a resource */
export type DocumentOwnership = {
  kind: 'DeliverableOfCardContent' | 'PartOfResource';
  ownerId: number;
};

export type DocumentKind = 'TextDataBlock' | 'ExternalLink' | 'DocumentFile';
