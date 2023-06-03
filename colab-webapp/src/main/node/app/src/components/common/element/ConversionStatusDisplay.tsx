/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { ConversionStatus } from 'colab-rest-client';
import * as React from 'react';
import Icon from '../layout/Icon';

interface ConversionStatusDisplayProps {
  status: ConversionStatus | null | undefined;
}

/**
 * Show an icon corresponding to the conversion status
 */
export default function ConversionStatusDisplay({
  status,
}: ConversionStatusDisplayProps): JSX.Element {
  if (status === 'DONE') {
    return <Icon icon="check" title="conversion is done" />;
  }
  if (status === 'ERROR') {
    return <Icon icon="report" title="conversion is in error" />;
  }
  if (status === 'PAGAN') {
    return <Icon icon="room_service" title="conversion has not begun" />;
  }
  if (status === 'NO_NEED') {
    return <Icon icon="water_lux" title="conversion is not needed" />;
  }

  return <Icon icon="question_mark" title="we do not know what is the conversion status" />;
}
