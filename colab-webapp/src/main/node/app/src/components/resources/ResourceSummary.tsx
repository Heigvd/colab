/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { WIPContainer } from '../common/Tips';
import { lightItalicText } from '../styling/style';

export default function ResourceSummary(/*context: ResourceCallContext*/): JSX.Element {
  // const { nb: nbResources, status } = useAndLoadNbResources(context);

  // if (status !== 'READY') {
  //   return <AvailabilityStatusIndicator status={status} />;
  // }

  return (
    <WIPContainer>
      <p className={lightItalicText}>
        <FontAwesomeIcon icon={faFileAlt} /> nb resources {/* : {nbResources} */}
      </p>
    </WIPContainer>
  );
}
