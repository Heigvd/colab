/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, Resource, ResourceRef } from 'colab-rest-client';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useCardContent } from '../../store/selectors/cardSelector';
import { useAndLoadCardType } from '../../store/selectors/cardTypeSelector';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { useCurrentTeamMember } from '../../store/selectors/teamMemberSelector';

// ---------------------------------------------------------------------------------------------- //

export type AccessLevel = 'READ' | 'WRITE' | 'DENIED' | 'UNKNOWN'; // TODO sandra work in progress, see if UNKNOWN is useful

export function isReadOnly(accessLevel: AccessLevel) {
  return accessLevel !== 'WRITE';
}

// ---------------------------------------------------------------------------------------------- //

export type CardTypeContext = {
  kind: 'CardType';
  cardTypeId: number | null | undefined;
};

export type CardOrCardContentContext = {
  kind: 'CardOrCardContent';
  cardId: number | undefined;
  cardContentId: number | null | undefined;
  hasSeveralVariants: boolean;
};

export type ResourceCallContext = CardTypeContext | CardOrCardContentContext;

export type ResourceOwnership = CardTypeContext | CardOrCardContentContext;

export const defaultResourceOwnerShip: ResourceOwnership = {
  kind: 'CardOrCardContent',
  cardId: undefined,
  cardContentId: null,
  hasSeveralVariants: false,
};

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

export function isActive1(resource: ResourceAndRef): boolean {
  const directResource = getTheDirectResource(resource);

  return isActive2(directResource);
}

export function isDead1(resource: ResourceAndRef): boolean {
  const directResource = getTheDirectResource(resource);

  return isDead2(directResource);
}

export function isActive2(resource: Resource | ResourceRef): boolean {
  if (entityIs(resource, 'ResourceRef')) {
    return isResourceRefActive(resource);
  } else {
    return isResourceActive(resource);
  }
}

export function isDead2(resource: Resource | ResourceRef): boolean {
  if (entityIs(resource, 'ResourceRef')) {
    return isResourceRefDead(resource);
  } else {
    return false;
  }
}

export function isResourceActive(resource: Resource): boolean {
  return !resource.deprecated;
}

export function isResourceRefActive(resourceRef: ResourceRef): boolean {
  return !resourceRef.refused && !resourceRef.residual;
}

export function isResourceRefDead(resourceRef: ResourceRef): boolean {
  return resourceRef.residual;
}

/**
 * Get access level the current user has on the given resource
 */
export function useResourceAccessLevelForCurrentUser(resource: Resource): AccessLevel {
  const currentProjectId = useCurrentProjectId();

  const { member } = useCurrentTeamMember();

  const cardContent = useCardContent(resource.cardContentId);

  const cardId = entityIs(cardContent, 'CardContent') ? cardContent.cardId : resource.cardId;
  //const card = useCard(cardId);

  const { canRead, canWrite } = useCardACLForCurrentUser(cardId);

  const { cardType } = useAndLoadCardType(resource.abstractCardTypeId);

  if (cardId != null && canRead != null && canWrite != null) {
    // resource belongs to a card (possibly through a CardContent)
    // and ACL is known
    if (canWrite) {
      return 'WRITE';
    } else if (canRead) {
      return 'READ';
    } else {
      return 'DENIED';
    }
  } else if (cardType != null) {
    // resource belongs to a cardType
    if (cardType.projectId != null && cardType.projectId === currentProjectId) {
      // cardType belongs to this very project
      // acces is based on user position
      if (member) {
        switch (member.position) {
          case 'GUEST':
            return 'READ';
          default:
            return 'WRITE';
        }
      }
    } else {
      // cardType is either global or belongs to an external project
      return 'READ';
    }
  }

  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------------------------- //
