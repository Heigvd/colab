/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useParams } from 'react-router-dom';
import Token from './Token';

/**
 * To read parameters from URL
 */
export function TokenRouting() {
  const { tokenId, plainToken } = useParams<'tokenId' | 'plainToken'>();

  return <Token tokenId={tokenId} plainToken={plainToken} />;
}
