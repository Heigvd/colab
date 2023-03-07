/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Illustration } from 'colab-rest-client';
import { projectColors } from '../styling/theme';

export const defaultProjectIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'MATERIAL_SYMBOLS_OUTLINED',
  iconKey: 'stadia_controller',
  iconBkgdColor: projectColors.blue,
};

export const noModelIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'MATERIAL_SYMBOLS_OUTLINED',
  iconKey: 'draft',
  iconBkgdColor: projectColors.blue,
};
