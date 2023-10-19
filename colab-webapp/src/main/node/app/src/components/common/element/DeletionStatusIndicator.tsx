/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { DeletionStatus } from 'colab-rest-client';
import Icon, { IconSize } from '../layout/Icon';
import Badge from './Badge';
import { isInBinDefaultIcon } from '../../../styling/IconDefault';

interface DeletionStatusIndicatorProps {
  status: DeletionStatus | null | undefined;
  size: keyof typeof IconSize;
}

export default function DeletionStatusIndicator({
  status,
  size,
}: DeletionStatusIndicatorProps): JSX.Element {
  if (status != null) {
    return (
      <Badge kind="solid" theme="error">
        <Icon icon={isInBinDefaultIcon} opsz={size} />
      </Badge>
    );
  } else {
    return <></>;
  }
}
