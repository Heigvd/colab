/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Illustration } from 'colab-rest-client';
import { projectColors } from '../styling/theme';

export const defaultProjectIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'FONT_AWESOME_SOLID',
  iconKey: 'gamepad' as IconName,
  iconBkgdColor: projectColors.blue,
};

export const noModelIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'FONT_AWESOME_REGULAR',
  iconKey: 'file',
  iconBkgdColor: projectColors.blue,
};
