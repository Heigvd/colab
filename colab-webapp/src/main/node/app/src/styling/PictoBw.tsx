/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Picto from '../images/picto_bw.svg';

export interface PictoProps {
  className?: string;
}

export default function PictoBw({ className }: PictoProps): JSX.Element {
  return <Picto className={className} />;
}
