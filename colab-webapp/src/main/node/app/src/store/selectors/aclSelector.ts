/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useMyAssignmentsForCard } from './assignmentSelector';
import { useCurrentTeamMember } from './teamMemberSelector';
import { useCurrentUser } from './userSelector';

interface canReadWrite {
  canRead: boolean;
  canWrite: boolean;
}

/**
 * @returns Can current user read / write the current project
 */
export function useProjectACLForCurrentUser(): canReadWrite {
  const { status: statusUser, currentUser } = useCurrentUser();
  const { status: statusTeamMember, member: currentTeamMember } = useCurrentTeamMember();

  if (statusUser !== 'AUTHENTICATED' || currentUser == null) {
    return { canRead: false, canWrite: false };
  }

  if (currentUser.admin) {
    return { canRead: true, canWrite: true };
  }

  if (statusTeamMember !== 'READY' || currentTeamMember == null) {
    return { canRead: false, canWrite: false };
  }

  const canWriteOnProject =
    currentTeamMember.position != null && currentTeamMember.position !== 'GUEST';

  return { canRead: true, canWrite: canWriteOnProject };
}

/**
 * @param cardId Wanted card id
 * @returns Can current user read / write the given card (in the current project)
 */
export function useCardACLForCurrentUser(cardId: number | null | undefined): canReadWrite {
  const { status: statusUser, currentUser } = useCurrentUser();

  const { canRead: canGenerallyReadOnCurrentProject, canWrite: canGenerallyWriteOnCurrentProject } =
    useProjectACLForCurrentUser();

  const { status: statusAssignments, assignments } = useMyAssignmentsForCard(cardId);

  if (statusUser !== 'AUTHENTICATED' || currentUser == null) {
    return { canRead: false, canWrite: false };
  }

  if (currentUser.admin) {
    return { canRead: true, canWrite: true };
  }

  if (!canGenerallyReadOnCurrentProject) {
    return { canRead: false, canWrite: false };
  }

  if (statusAssignments !== 'READY') {
    return { canRead: false, canWrite: false };
  }

  const canWriteOnThisCard = assignments.length > 0;

  return { canRead: true, canWrite: canGenerallyWriteOnCurrentProject || canWriteOnThisCard };
}
