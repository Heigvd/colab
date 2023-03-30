/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { UserPresence } from 'colab-rest-client';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { InlineAvailabilityStatus } from '../store';
import { useDeepMemo } from './hooks/useDeepMemo';
import { selectCurrentProjectId } from './projectSelector';

export function usePresence(projectId: number): InlineAvailabilityStatus<UserPresence[]> {
  const dispatch = useAppDispatch();

  const result = useAppSelector(state => {
    const presenceState = state.presences.projects[projectId];
    if (presenceState != null) {
      // state exists
      if (presenceState.status === 'READY') {
        const me = state.websockets.sessionId;
        return Object.values(presenceState.presence).filter(p => p.wsSessionId != me);
      } else {
        return presenceState.status;
      }
    }
    return 'NOT_INITIALIZED';
  });

  React.useEffect(() => {
    if (result === 'NOT_INITIALIZED') {
      dispatch(API.getPresenceList(projectId));
    }
  }, [result, projectId, dispatch]);

  return useDeepMemo(result);
}

export function usePresenceOnDocument(documentId?: number): UserPresence[] {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  const result = useAppSelector(state => {
    if (documentId != null && currentProjectId != null) {
      const presenceState = state.presences.projects[currentProjectId];
      if (presenceState != null) {
        const me = state.websockets.sessionId;
        return Object.values(presenceState.presence).filter(
          p => p.wsSessionId != me && p.documentId === documentId,
        );
      }
    }
    return [];
  });

  return useDeepMemo(result);
}
