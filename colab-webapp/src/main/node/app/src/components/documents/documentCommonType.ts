/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export type DeliverableOfCardContentContext = {
  kind: 'DeliverableOfCardContent';
  cardContentId: number;
};

export type PartOfResourceContext = {
  kind: 'PartOfResource';
  resourceId: number;
};

export type DocumentContext = DeliverableOfCardContentContext | PartOfResourceContext;

export type DocumentType = 'TextDataBlock' | 'ExternalLink' | 'DocumentFile';
