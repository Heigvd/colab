/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Illustration } from 'colab-rest-client';

export const defaultProjectIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'FONT_AWESOME_SOLID',
  iconKey: 'gamepad' as IconName,
  iconBkgdColor: '#68A8C3'
};
