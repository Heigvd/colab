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

interface AssignmentsAndStatus {
  status: AvailabilityStatus;
  assignments: AccessControl[];
}

interface AssignmentAndStatus {
  status: AvailabilityStatus;
  assignment: AccessControl | null;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

// for now, no need to sort

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusAssignmentsForCurrentProject(state: ColabState): AvailabilityStatus {
  return state.assignments.statusAssignmentsForCurrentProject;
}

function selectStatusAssignmentsForCardId(
  state: ColabState,
  cardId: number | undefined | null,
): AvailabilityStatus {
  if (cardId == null) {
    return 'ERROR';
  }

  const statusForProject = selectStatusAssignmentsForCurrentProject(state);

  if (statusForProject === 'READY') {
    return 'READY';
  }

  const dataInStore = state.assignments.assignments[cardId];

  if (dataInStore == null) {
    return 'NOT_INITIALIZED';
  }

  return dataInStore.status;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for one card
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectAssignmentsForCard(
  state: ColabState,
  cardId: number | null | undefined,
): AccessControl[] {
  if (cardId) {
    return Object.values(state.assignments.assignments[cardId]?.assignment || []);
  }

  return [];
}

export function useAssignmentsForCard(cardId: number | null | undefined): AssignmentsAndStatus {
  const { status, data } = useFetchListWithArg(
    (state: ColabState) => selectStatusAssignmentsForCardId(state, cardId),
    (state: ColabState) => selectAssignmentsForCard(state, cardId),
    API.getAssignmentsForCard,
    cardId,
  );

  return { status, assignments: data || [] };
}

export function useAssignmentForCardAndMember(
  cardId: number | null | undefined,
  memberId: number | null | undefined,
): AssignmentAndStatus {
  const { status, assignments: assignmentsForCard } = useAssignmentsForCard(cardId);

  if (!memberId) {
    return { status: 'ERROR', assignment: null };
  }

  if (status != 'READY') {
    return { status: status, assignment: null };
  }

  const assignments = assignmentsForCard.filter(a => a.memberId === memberId);

  if (assignments.length === 1) {
    return { status: 'READY', assignment: assignments[0] || null };
  }

  if (assignments.length === 0) {
    return { status: 'READY', assignment: null };
  }

  return { status: 'ERROR', assignment: null };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current user
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectMyAssignments(
  state: ColabState,
  cards: Card[],
  currentMemberId: number | null | undefined,
): AccessControl[] {
  if (currentMemberId == null) {
    return [];
  }

  const assignments: AccessControl[] = [];

  cards.forEach(card => {
    const cardAssignments = selectAssignmentsForCard(state, card.id);

    cardAssignments.forEach(assignment => {
      if (assignment.memberId === currentMemberId) {
        assignments.push(assignment);
      }
    });
  });

  return assignments;
}

export function useMyAssignments(): AssignmentsAndStatus {
  const currentMemberId = useCurrentTeamMemberId();
  const cards = useAllProjectCardsSorted().map(s => s.card); // TODO status // TODO see if ids is enough

  const statusAssignments = useLoadAssignments();

  const myAssignments = useAppSelector(state => selectMyAssignments(state, cards, currentMemberId));

  if (currentMemberId == null) {
    return { status: 'ERROR', assignments: [] };
  }

  // if (cardStatus !== 'READY') {
  //   return {status: cardStatus, assignments: []}
  // }

  if (statusAssignments !== 'READY') {
    return { status: statusAssignments, assignments: [] };
  }

  return { status: 'READY', assignments: myAssignments };
}

export function useMyAssignmentsForCard(cardId: number | null | undefined): AssignmentsAndStatus {
  const currentMemberId = useCurrentTeamMemberId();

  const { status: assignmentsForCardStatus, assignments: assignmentsForCard } =
    useAssignmentsForCard(cardId);

  if (currentMemberId == null) {
    return { status: 'ERROR', assignments: [] };
  }

  if (assignmentsForCardStatus !== 'READY') {
    return { status: assignmentsForCardStatus, assignments: [] };
  }

  const myAssignments = assignmentsForCard.filter(
    assignment => assignment.memberId === currentMemberId,
  );

  return { status: assignmentsForCardStatus, assignments: myAssignments };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useLoadAssignments(): AvailabilityStatus {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useLoadDataWithArg(
    selectStatusAssignmentsForCurrentProject,
    API.getAssignmentsForProject,
    currentProjectId,
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
