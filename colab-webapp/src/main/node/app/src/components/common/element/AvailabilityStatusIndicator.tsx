/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { AvailabilityStatus } from '../../../store/store';
import Icon from '../layout/Icon';
import Loading from '../layout/Loading';

interface AvailabilityStatusIndicatorProps {
  status: AvailabilityStatus;
}

export default function AvailabilityStatusIndicator({
  status,
}: AvailabilityStatusIndicatorProps): JSX.Element {
  switch (status) {
    case 'NOT_INITIALIZED':
      return <Icon icon={'notifications'} />;
    case 'LOADING':
      return <Loading />;
    case 'ERROR':
      return <Icon icon={'skull'} />;
    case 'READY':
      return <Icon icon={'room_service'} />;
  }
}
