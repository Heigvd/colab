/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { MaterialIconsType } from '../../styling/IconType';
import { space_sm } from '../../styling/style';
import Badge, { BadgeSizeType } from '../common/element/Badge';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

type StatusType = CardContent['status'];

const badgeStyle = (color: string) => {
  return css({
    border: `1px solid ${color}`,
    color: `${color}`,
  });
};

interface CardContentStatusDisplayProps {
  status: StatusType;
  mode: 'icon' | 'semi' | 'full';
  className?: string;
  size?: BadgeSizeType;
}
type StatusIconAndColorType = {
  icon: MaterialIconsType;
  color: string;
};

function getStatusIconAndColor(status: StatusType): StatusIconAndColorType {
  if (status == null) {
    return { icon: 'remove_from_queue', color: 'var(--gray-300)' };
  }

  switch (status) {
    case 'ACTIVE':
      return { icon: 'edit', color: 'var(--success-main)' };
    case 'VALIDATED':
      return { icon: 'check', color: 'var(--success-main)' };
    case 'TO_VALIDATE':
      return { icon: 'pause', color: 'orange' };
    case 'ARCHIVED':
      return { icon: 'inventory_2', color: '#9C9C9C' };
    case 'REJECTED':
      return { icon: 'close', color: 'var(--error-main)' };
  }

  // should never happen,
  // but whenever there is an unknown value in DB, it does not stupidly crash
  return { icon: 'pest_control_rodent', color: 'var(--gray-300)' };
}

function useTooltip(status: StatusType): string {
  const i18n = useTranslations();

  if (status == null) {
    return i18n.modules.card.settings.noStatus;
  }

  return i18n.modules.card.settings.statusIs + i18n.modules.card.settings.statuses[status];
}

function useLabel(status: StatusType): string {
  const i18n = useTranslations();

  if (status == null) {
    return i18n.modules.card.settings.noStatus;
  }

  return i18n.modules.card.settings.statuses[status];
}

export default function CardContentStatusDisplay({
  status,
  mode,
  size,
  className,
}: CardContentStatusDisplayProps): JSX.Element {
  const statusLabel = useLabel(status);
  const { icon, color } = getStatusIconAndColor(status);
  const tooltip = useTooltip(status);

  if (status == null) {
    return <></>;
  }

  if (mode === 'icon') {
    return (
      <Icon
        className={cx(css({ paddingRight: space_sm }), className)}
        icon={icon}
        color={color}
        title={tooltip}
        opsz={size || 'xs'}
      />
    );
  } else if (mode === 'semi') {
    return (
      // Maybe improve theming of Badge comp for more colors?
      <Badge
        kind="outline"
        title={tooltip}
        icon={icon}
        className={cx(badgeStyle(color), className)}
        size={size}
      >
        {statusLabel}
      </Badge>
    );
  } else {
    return (
      <Flex align="center">
        <Icon icon={icon} opsz="xs" />
        {statusLabel}
      </Flex>
    );
  }
}
