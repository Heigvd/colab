/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { faConciergeBell, faKiwiBird, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { AvailabilityStatus } from '../../store/store';
import InlineLoading from './InlineLoading';

interface AvailabilityStatusIndicatorProps {
  status: AvailabilityStatus;
}

// TODO Audrey what should be done for each status

export default function AvailabilityStatusIndicator({
  status,
}: AvailabilityStatusIndicatorProps): JSX.Element {
  switch (status) {
    case 'NOT_INITIALIZED':
      return <FontAwesomeIcon icon={faConciergeBell} />;
    case 'LOADING':
      return <InlineLoading />;
    case 'ERROR':
      return <FontAwesomeIcon icon={faSkullCrossbones} />;
    case 'READY':
      return <FontAwesomeIcon icon={faKiwiBird} />;
  }
}
