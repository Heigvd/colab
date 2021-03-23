/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Logo from '../../images/logo.svg';

export interface LogoProps {
  className?: string;
}

export default ({ className }: LogoProps) => {
  return <Logo className={className} />;
};

