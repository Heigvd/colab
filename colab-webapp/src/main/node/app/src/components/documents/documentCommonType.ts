/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export type DeliverableOfCardContentContext = {
  kind: 'DeliverableOfCardContent';
  ownerId: number;
};

export type PartOfResourceContext = {
  kind: 'PartOfResource';
  ownerId: number;
};

export type DocumentContext = DeliverableOfCardContentContext | PartOfResourceContext;

export type DocumentType = 'TextDataBlock' | 'ExternalLink' | 'DocumentFile';
