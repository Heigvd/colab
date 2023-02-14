/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { ConfirmIconButton } from './element/ConfirmIconButton';

// soon not used anymore

export interface DestroyerProps {
  title?: string;
  icon?: string;
  onDelete: () => void;
}
export function Destroyer({ onDelete, title, icon = 'delete' }: DestroyerProps): JSX.Element {
  const i18n = useTranslations();
  return <ConfirmIconButton icon={icon} title={title || i18n.common.delete} onConfirm={onDelete} />;
}
