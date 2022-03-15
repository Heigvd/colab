/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Resource, ResourceRef } from 'colab-rest-client';

export enum CreationScopeKind {
  CardType,
  Card,
  CardContent,
}

export type CreationCardTypeScope = {
  kind: CreationScopeKind.CardType;
  cardTypeId: number;
};

export type CreationCardScope = {
  kind: CreationScopeKind.Card;
  cardId: number;
};

export type CreationCardContentScope = {
  kind: CreationScopeKind.CardContent;
  cardContentId: number;
};

export type CreationScope = CreationCardTypeScope | CreationCardScope | CreationCardContentScope;

// Context for resource creation
// it is a temporary proposition until
// this structure is planned to be used either at a card type level or at a card + card content level

export type CardTypeContext = {
  kind: 'CardType';
  accessLevel: 'READ' | 'WRITE' | 'DENIED';
  cardTypeId: number | null | undefined;
};

export type CardOrCardContentContext = {
  kind: 'CardOrCardContent';
  accessLevel: 'READ' | 'WRITE' | 'DENIED';
  // TODO see if cardTypeId could be usefull
  cardId: number | undefined;
  cardContentId: number | null | undefined;
};

export type ResourceCallContext = CardTypeContext | CardOrCardContentContext;

/**
 * contains the resource and an eventual chain of references to it
 */
export interface ResourceAndRef {
  targetResource: Resource;
  isDirectResource: boolean;
  cardTypeResourceRef?: ResourceRef;
  cardResourceRef?: ResourceRef;
  cardContentResourceRef?: ResourceRef;
}

/**
 * @param resourceAndRef The resource and reference
 * @returns A key to identify each resource and reference within an iteration
 */
export function getKey(resourceAndRef: ResourceAndRef): React.Key {
  return (
    resourceAndRef.targetResource.id +
    ' with ref act ' +
    resourceAndRef.cardTypeResourceRef?.id +
    ' with ref c ' +
    resourceAndRef.cardResourceRef?.id +
    ' with ref cc ' +
    resourceAndRef.cardContentResourceRef?.id
  );
}
