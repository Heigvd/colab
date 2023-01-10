/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import PictoSvg from '../../images/picto.svg';

export interface PictoProps {
  className?: string;
}

export default function Picto({ className }: PictoProps): JSX.Element {
  return <PictoSvg className={className} />;
}
