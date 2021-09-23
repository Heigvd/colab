/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';

export interface Props {
  direction?: 'row' | 'column';
}

export default function Flex({
  children,
  direction = 'row',
}: React.PropsWithChildren<Props>): JSX.Element {
  return <div className={css({ display: 'flex', flexDirection: direction })}>{children}</div>;
}
