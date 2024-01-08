/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';

export default function AccessDenied(): JSX.Element {
  const i18n = useTranslations();

  return <i>{i18n.common.error.accessDenied}</i>;
}
