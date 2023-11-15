/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Resource } from 'colab-rest-client';
import * as React from 'react';
import useTranslations, { ColabTranslations } from '../../i18n/I18nContext';

export function ResourceTitle({ resource }: { resource: Resource }): JSX.Element {
  const i18n = useTranslations();

  return <>{getResourceTitle({ resource, i18n })}</>;
}

export function getResourceTitle({
  resource,
  i18n,
}: {
  resource: Resource;
  i18n: ColabTranslations;
}): string {
  return resource.title || i18n.modules.resource.untitled;
}
