/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export type DocumentContext = {
  kind: 'DeliverableOfCardContent' | 'PartOfResource';
  ownerId: number;
};

export type DocumentKind = 'TextDataBlock' | 'ExternalLink' | 'DocumentFile';
