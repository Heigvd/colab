/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useAndLoadNbActiveResources } from '../../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import { ResourceCallContext } from '../resourcesCommonType';

interface ResourceListSummaryProps {
  context: ResourceCallContext;
}

export default function ResourcesListSummary({ context }: ResourceListSummaryProps): JSX.Element {
  const { nb, status } = useAndLoadNbActiveResources(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <FontAwesomeIcon
        icon={faPaperclip}
        title={
          !nb
            ? 'It does not contain any resource'
            : nb == 1
            ? 'It contains 1 resource'
            : 'It contains ' + nb + ' resources'
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
    return <AvailabilityStatusIndicator status={status} />;
  }

  return <>{nb}</>;
}
