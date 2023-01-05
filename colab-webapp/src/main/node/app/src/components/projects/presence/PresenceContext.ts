/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { TouchUserPresence } from 'colab-rest-client';
import { throttle } from 'lodash';
import * as API from '../../../API/api';
import { getLogger } from '../../../logger';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

type ShortTouchUserPresence = Omit<TouchUserPresence, 'wsSessionId' | 'projectId'>;

type TouchFnParam =
  | ShortTouchUserPresence
  | ((current: ShortTouchUserPresence) => ShortTouchUserPresence);

type TouchFn = (presence: TouchFnParam) => void;

interface PresenceContext {
  touch: TouchFn;
}

export const defaultContext: PresenceContext = {
  touch: () => {},
};

export const PresenceContext = React.createContext<PresenceContext>(defaultContext);

const logger = getLogger('presence');

export function usePresenceContext(): PresenceContext {
  const dispatch = useAppDispatch();

  const { project } = useProjectBeingEdited();
  const projectId = project?.id;
  const wsSessionId = useAppSelector(state => state.websockets.sessionId);

  const presenceRef = React.useRef<ShortTouchUserPresence>({});

  const touch: (presence: ShortTouchUserPresence) => void = React.useMemo(() => {
    if (projectId != null && wsSessionId != null) {
      logger.debug('Rebuild Presence Throttle');
      return throttle((presence: ShortTouchUserPresence) => {
        dispatch(
          API.makePresenceKnown({ ...presence, projectId: projectId, wsSessionId: wsSessionId }),
        );
        logger.info('Log touch', presence);
      }, 1000);
    } else {
      return () => {};
    }
  }, [dispatch, projectId, wsSessionId]);

  const touchCb = React.useCallback(
    (presence: TouchFnParam) => {
      if (typeof presence === 'function') {
        presenceRef.current = presence(presenceRef.current);
      } else {
        presenceRef.current = presence;
      }
      touch(presenceRef.current);
    },
    [touch],
  );

  return {
    touch: touchCb,
  };
}
