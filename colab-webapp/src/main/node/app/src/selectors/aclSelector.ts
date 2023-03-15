/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useMyAclsForCard } from './assignmentSelector';
import { useCurrentTeamMember } from './teamMemberSelector';
import { useCurrentUser } from './userSelector';

interface canReadWrite {
  canRead: boolean;
  canWrite: boolean;
}

export function useCardACLForCurrentUser(cardId: number | null | undefined): canReadWrite {
  const { status: statusUser, currentUser } = useCurrentUser();
  const { status: statusTeamMember, member: currentTeamMember } = useCurrentTeamMember();

  const { status: statusAssignments, acls } = useMyAclsForCard(cardId);

  if (statusUser !== 'AUTHENTICATED' || currentUser == null) {
    return { canRead: false, canWrite: false };
  }

  if (currentUser.admin) {
    return { canRead: true, canWrite: true };
  }

  if (statusTeamMember !== 'READY' || currentTeamMember == null) {
    return { canRead: false, canWrite: false };
  }

  if (statusAssignments !== 'READY') {
    return { canRead: false, canWrite: false };
  }

  const canWriteByDefaultOnProject =
    currentTeamMember.position != null && currentTeamMember.position !== 'GUEST';

  const canWriteOnThisCard = acls.length > 0;

  return { canRead: true, canWrite: canWriteByDefaultOnProject || canWriteOnThisCard };
}
