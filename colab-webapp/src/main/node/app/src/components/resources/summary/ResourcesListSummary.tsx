/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadNbActiveResources } from '../../../selectors/resourceSelector';
import { ResourceCallContext } from '../resourcesCommonType';

interface ResourceListSummaryProps {
  context: ResourceCallContext;
}

export default function ResourcesListSummary({ context }: ResourceListSummaryProps): JSX.Element {
  const i18n = useTranslations();
  const { nb, status } = useAndLoadNbActiveResources(context);

  if (status !== 'READY') {
    return <></>;
  }

  return (
    <>
      <FontAwesomeIcon
        icon={faPaperclip}
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
interface ResourceListNbProps {
  context: ResourceCallContext;
}

export function ResourceListNb({ context }: ResourceListNbProps): JSX.Element {
  const { nb, status } = useAndLoadNbActiveResources(context);

  if (status !== 'READY') {
    return <></>;
  }

  return <>{nb}</>;
}
