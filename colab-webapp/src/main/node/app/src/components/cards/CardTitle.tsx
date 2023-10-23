/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';

export function CardTitle({ card }: { card: Card }): JSX.Element {
  const i18n = useTranslations();

  return <>{card.title ?? i18n.modules.card.untitled}</>;
}
