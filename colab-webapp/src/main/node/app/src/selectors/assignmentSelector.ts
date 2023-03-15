/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { AccessControl, Card } from 'colab-rest-client';
import * as API from '../API/api';
import { useAppSelector, useFetchListWithArg, useLoadDataWithArg } from '../store/hooks';
import { AvailabilityStatus, ColabState } from '../store/store';
import { useAllProjectCardsSorted } from './cardSelector';
import { selectCurrentProjectId } from './projectSelector';
import { useCurrentTeamMemberId } from './teamMemberSelector';

interface AclsAndStatus {
  status: AvailabilityStatus;
  acls: AccessControl[];
}

interface AclAndStatus {
  status: AvailabilityStatus;
  acl: AccessControl | null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

// for now, no need to sort

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusAclsForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.acl.statusAclsForCurrentProject;
}

function selectStatusAclsForCardId(
  state: ColabState,
  cardId: number | undefined | null,
): AvailabilityStatus {
  if (cardId == null) {
    return 'ERROR';
  }

  const statusForProject = selectStatusAclsForCurrentProject(state);

  if (statusForProject === 'READY') {
    return 'READY';
  }

  const dataInStore = state.acl.acls[cardId];

  if (dataInStore == null) {
    return 'NOT_INITIALIZED';
  }

  return dataInStore.status;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for one card
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectAclsForCard(state: ColabState, cardId: number | null | undefined): AccessControl[] {
  if (cardId) {
    return Object.values(state.acl.acls[cardId]?.acl || []);
  }

  return [];
}

export function useAclsForCard(cardId: number | null | undefined): AclsAndStatus {
  const { status, data } = useFetchListWithArg(
    (state: ColabState) => selectStatusAclsForCardId(state, cardId),
    (state: ColabState) => selectAclsForCard(state, cardId),
    API.getACLsForCard,
    cardId,
  );

  return { status, acls: data || [] };
}

export function useAclForCardAndMember(
  cardId: number | null | undefined,
  memberId: number | null | undefined,
): AclAndStatus {
  const { status, acls: aclsForCard } = useAclsForCard(cardId);

  if (!memberId) {
    return { status: 'ERROR', acl: null };
  }

  if (status != 'READY') {
    return { status: status, acl: null };
  }

  const acls = aclsForCard.filter(a => a.memberId === memberId);

  if (acls.length === 1) {
    return { status: 'READY', acl: acls[0] || null };
  }

  if (acls.length === 0) {
    return { status: 'READY', acl: null };
  }

  return { status: 'ERROR', acl: null };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current user
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectMyAcls(
  state: ColabState,
  cards: Card[],
  currentMemberId: number | null | undefined,
): AccessControl[] {
  if (currentMemberId == null) {
    return [];
  }

  const acls: AccessControl[] = [];

  cards.forEach(card => {
    const cardAcls = selectAclsForCard(state, card.id);

    cardAcls.forEach(acl => {
      if (acl.memberId === currentMemberId) {
        acls.push(acl);
      }
    });
  });

  return acls;
}

export function useMyAcls(): AclsAndStatus {
  const currentMemberId = useCurrentTeamMemberId();
  const cards = useAllProjectCardsSorted().map(s => s.card); // TODO status // TODO see if ids is enough

  const statusAcls = useLoadAcls();

  const myAcls = useAppSelector(state => selectMyAcls(state, cards, currentMemberId));

  if (currentMemberId == null) {
    return { status: 'ERROR', acls: [] };
  }

  // if (cardStatus !== 'READY') {
  //   return {status: cardStatus, acls: []}
  // }

  if (statusAcls !== 'READY') {
    return { status: statusAcls, acls: [] };
  }

  return { status: 'READY', acls: myAcls };
}

export function useMyAclsForCard(cardId: number | null | undefined): AclsAndStatus {
  const currentMemberId = useCurrentTeamMemberId();

  const { status: aclsForCardStatus, acls: aclsForCard } = useAclsForCard(cardId);

  if (currentMemberId == null) {
    return { status: 'ERROR', acls: [] };
  }

  if (aclsForCardStatus !== 'READY') {
    return { status: aclsForCardStatus, acls: [] };
  }

  const myAcls = aclsForCard.filter(acl => acl.memberId === currentMemberId);

  return { status: aclsForCardStatus, acls: myAcls };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useLoadAcls(): AvailabilityStatus {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useLoadDataWithArg(
    selectStatusAclsForCurrentProject,
    API.getAclsForProject,
    currentProjectId,
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
