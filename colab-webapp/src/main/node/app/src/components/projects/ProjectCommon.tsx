/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Illustration } from 'colab-rest-client';
import { MaterialIconsType } from '../../styling/IconType';
import { projectColors } from '../../styling/theme';

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

export const projectIcons: MaterialIconsType[] = [
  'gamepad',
  'casino',
  'extension',
  'bug_report',
  'robot',
  'school',
  'music_note',
  'smart_toy',
  'stadia_controller',
  'clear_day',
  'menu_book',
  'water_drop',
  'history_edu',
  'bolt',
  'language',
  'recycling',
  'public',
  'forest',
  'coronavirus',
  'medication',
  'skeleton',
  'nutrition',
  'stethoscope',
  'accessible_forward',
  'palette',
  'landscape',
  'savings',
  'domain',
  'trolley',
  'fire_truck',
];
