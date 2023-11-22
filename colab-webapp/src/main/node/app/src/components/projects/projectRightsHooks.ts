/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useProjectACLForCurrentUser } from '../../store/selectors/aclSelector';
import { isProjectAlive, useCurrentProject } from '../../store/selectors/projectSelector';

/*
 * All card and card content rights access
 */

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useIsProjectReadOnly(): boolean {
  const { project } = useCurrentProject();
  const { canWrite } = useProjectACLForCurrentUser();

  return !canWrite || !isProjectAlive(project!);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useCanProjectDeletionStatusBeChanged(): boolean {
  const { canWrite } = useProjectACLForCurrentUser();
  return canWrite;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
