/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useAndLoadNbResources } from '../../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../../common/AvailabilityStatusIndicator';
import { ResourceCallContext } from '../ResourceCommonType';

export default function ResourcesListSummary(context: ResourceCallContext): JSX.Element {
  const { nb, status } = useAndLoadNbResources(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <FontAwesomeIcon icon={faPaperclip} title={
        !nb
          ? 'It does not contain any resource'
          : nb == 1
          ? 'It contains 1 resource'
          : 'It contains ' + nb + ' resources'
      } /> {nb}
    </>
  );
}
