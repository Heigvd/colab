/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useAndLoadNbResources } from '../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import { lightItalicText } from '../styling/style';
import { ResourceCallContext } from './ResourceCommonType';

export default function ResourceSummary(context: ResourceCallContext): JSX.Element {
  const { nb, status } = useAndLoadNbResources(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <p className={lightItalicText}>
      <FontAwesomeIcon icon={faPaperclip} /> {nb}
    </p>
  );
}
