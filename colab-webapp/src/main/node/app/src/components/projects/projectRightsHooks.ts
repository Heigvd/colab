/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useProjectACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useCurrentProject } from '../../store/selectors/projectSelector';
import { isAlive } from '../../store/storeHelper';

/*
 * All card and card content rights access
 */

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useIsProjectReadOnly(): boolean {
  const { project } = useCurrentProject();
  const { canWrite } = useProjectACLForCurrentUser();

  return !canWrite || !isAlive(project!);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useCanProjectDeletionStatusBeChanged(): boolean {
  const { canWrite } = useProjectACLForCurrentUser();
  return canWrite;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
