/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import LogoSvg from '../../images/logo.svg';

export interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps): JSX.Element {
  return <LogoSvg className={className} />;
}
