/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppSelector } from '../hooks';
import { ColabState } from '../store';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectSessionId(state: ColabState) {
  return state.websockets.sessionId;
}

export function useSessionId() {
  return useAppSelector(selectSessionId);
}
