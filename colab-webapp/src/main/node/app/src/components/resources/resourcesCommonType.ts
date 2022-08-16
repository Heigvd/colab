/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, Resource, ResourceRef } from 'colab-rest-client';

// ---------------------------------------------------------------------------------------------- //

export type AccessLevel = 'READ' | 'WRITE' | 'DENIED' | 'UNKNOWN'; // TODO sandra work in progress, see if UNKNOWN is useful

export function isReadOnly(accessLevel: AccessLevel) {
  return accessLevel !== 'WRITE';
}

// ---------------------------------------------------------------------------------------------- //

export type ResourceOwnership = CardTypeContext | CardOrCardContentContext;

export type CardTypeContext = {
  kind: 'CardType';
  accessLevel: 'READ' | 'WRITE' | 'DENIED'; // TODO remove from here
  cardTypeId: number | null | undefined;
};

export type CardOrCardContentContext = {
  kind: 'CardOrCardContent';
  accessLevel: 'READ' | 'WRITE' | 'DENIED'; // TODO remove from here
  cardId: number | undefined;
  cardContentId: number | null | undefined;
  hasSeveralVariants: boolean;
};

export type ResourceCallContext = CardTypeContext | CardOrCardContentContext;

// ---------------------------------------------------------------------------------------------- //

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

// ---------------------------------------------------------------------------------------------- //

export function getTheRef(resource: ResourceAndRef): ResourceRef | undefined {
  return (
    resource.cardContentResourceRef || resource.cardResourceRef || resource.cardTypeResourceRef
  );
}

export function getTheDirectResource(resource: ResourceAndRef): Resource | ResourceRef {
  return getTheRef(resource) || resource.targetResource;
}

export function isActive(resource: ResourceAndRef): boolean {
  const directResource = getTheDirectResource(resource);

  if (entityIs(directResource, 'ResourceRef')) {
    return isResourceRefActive(directResource);
  } else {
    return isResourceActive(directResource);
  }
}

export function isResourceActive(resource: Resource): boolean {
  return !resource.deprecated;
}

export function isResourceRefActive(resourceRef: ResourceRef): boolean {
  return !resourceRef.refused && !resourceRef.residual;
}

// ---------------------------------------------------------------------------------------------- //
