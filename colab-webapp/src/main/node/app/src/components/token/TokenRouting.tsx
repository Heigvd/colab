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
 * To read parameters from hash
 */
export function TokenWrapper() {
  const { id, token } = useParams<'id' | 'token'>();

  return <Token tokenId={id} token={token} />;
}
