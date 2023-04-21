/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { MaterialIconsType } from '../../styling/IconType';
import { space_xs } from '../../styling/style';
import Badge, { BadgeSizeType } from '../common/element/Badge';
import Icon from '../common/layout/Icon';

// -------------------------------------------------------------------------------------------------
// types

type StatusType = CardContent['status'];

// -------------------------------------------------------------------------------------------------
// main component

interface CardContentStatusDisplayProps {
  status: StatusType;
  kind: 'icon_only' | 'outlined' | 'solid';
  size?: BadgeSizeType;
  className?: string;
}

export default function CardContentStatusDisplay({
  status,
  kind,
  size,
  className,
}: CardContentStatusDisplayProps): JSX.Element {
  const text = useText(status);
  const { icon, color } = getIconAndColor(status);
  const tooltip = useTooltip(status);

  if (status == null) {
    return <></>;
  }

  if (kind === 'icon_only') {
    return (
      <Badge kind="outline" title={tooltip} className={className} size={size} color={color}>
        <Icon icon={icon} opsz="xs" />
      </Badge>
    );
  }

  if (kind === 'outlined') {
    return (
      <Badge kind="outline" title={tooltip} className={className} size={size} color={color}>
        <Icon icon={icon} opsz="xs" className={css('padding: 0 ' + space_xs + ' 0 0')} />
        {text}
        <Icon icon={icon} opsz="xs" className={css('padding: 0 0 0 ' + space_xs)} />
      </Badge>
    );
  }

  return (
    <Badge kind="solid" title={tooltip} className={className} size={size} color={color}>
      <Icon icon={icon} opsz="xs" className={css('padding: 0 ' + space_xs + ' 0 0')} />
      {text}
      <Icon icon={icon} opsz="xs" className={css('padding: 0 0 0 ' + space_xs)} />
    </Badge>
  );
}

// -------------------------------------------------------------------------------------------------
// react sub components

type StatusIconAndColorType = {
  icon: MaterialIconsType;
  color: string;
};

function getIconAndColor(status: StatusType): StatusIconAndColorType {
  if (status == null) {
    return { icon: 'remove_from_queue', color: 'var(--gray-300)' };
  }

  switch (status) {
    case 'ACTIVE':
      return { icon: 'play_arrow', color: 'var(--blue-600)' };
    case 'TO_VALIDATE':
      return { icon: 'rate_review', color: 'var(--orange-500)' };
    case 'VALIDATED':
      return { icon: 'check', color: 'var(--green-500)' };
    case 'REJECTED':
      return { icon: 'close', color: 'var(--red-600)' };
    case 'ARCHIVED':
      return { icon: 'archive', color: '#9C9C9C' };
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

function useText(status: StatusType): string {
  const i18n = useTranslations();

  if (status == null) {
    return i18n.modules.card.settings.noStatus;
  }

  return i18n.modules.card.settings.statuses[status];
}
