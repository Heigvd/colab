/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadNbActiveResources } from '../../../selectors/resourceSelector';
import Icon from '../../common/layout/Icon';
import { ResourceOwnership } from '../resourcesCommonType';

interface ResourcesListSummaryProps {
  resourcesOwnership: ResourceOwnership;
}

export default function ResourcesListSummary({
  resourcesOwnership,
}: ResourcesListSummaryProps): JSX.Element {
  const i18n = useTranslations();

  const { nb, status } = useAndLoadNbActiveResources(resourcesOwnership);

  if (status !== 'READY') {
    return <></>;
  }

  return (
    <>
      <Icon
        icon={'attach_file'}
        title={
          !nb
            ? i18n.modules.resource.noResource
            : nb == 1
            ? i18n.modules.resource.oneResource
            : i18n.modules.resource.xResources(nb)
        }
      />
      &nbsp;{nb}
    </>
  );
}

interface ResourcesListNbProps {
  resourcesOwnership: ResourceOwnership;
}

export function ResourcesListNb({ resourcesOwnership }: ResourcesListNbProps): JSX.Element {
  const { nb, status } = useAndLoadNbActiveResources(resourcesOwnership);

  if (status !== 'READY') {
    return <></>;
  }

  if (nb === 0) {
    return <></>;
  }

  return <> ({nb})</>;
}
