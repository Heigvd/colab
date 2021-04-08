/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Picto from '../../images/picto.svg';

export interface PictoProps {
  className?: string;
}

export default ({ className }: PictoProps) => {
  return <Picto className={className} />;
};
