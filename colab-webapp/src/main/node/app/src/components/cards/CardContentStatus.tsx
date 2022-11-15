/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArchive, faCheck, faPause, faPen, faPencilRuler, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardContentStatus } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { borderRadius, errorColor, space_S, successColor } from '../styling/style';

const badgeStyle = (color: string) => {
  return css({
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${color}`,
    color: `${color}`,
    borderRadius: borderRadius,
    margin: '0 2px',
    padding: '3px',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    gap: space_S,
  });
};

export interface CardContentStatusProps {
  status: CardContentStatus;
  mode: 'icon' | 'semi' | 'full';
  className?: string;
}
type StatusIconAndColorType = {
  icon: IconProp;
  color: string;
};

export function getStatusIconAndColor(status: CardContentStatus): StatusIconAndColorType {
  switch (status) {
    case 'ACTIVE':
      return { icon: faPencilRuler, color: successColor };
    case 'POSTPONED':
      return { icon: faPause, color: 'orange' };
    case 'ARCHIVED':
      return { icon: faArchive, color: '#9C9C9C' };
    case 'REJECTED':
      return { icon: faTimes, color: errorColor };
    case 'PREPARATION':
      return { icon: faPen, color: '#B54BB2' };
    case 'VALIDATED':
      return { icon: faCheck, color: successColor };
  }
}

export default function CardContentStatusDisplay({
  status,
  mode,
  className,
}: CardContentStatusProps): JSX.Element {
  const i18n = useTranslations();

  const tooltip = i18n.modules.card.settings.statusTooltip(status);

  if (mode === 'icon') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
      <FontAwesomeIcon
        className={cx(css({ paddingRight: space_S }), className)}
        icon={getStatusIconAndColor(status).icon}
        color={getStatusIconAndColor(status).color}
        title={tooltip}
      />
    );
  } else if (mode === 'semi') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
      <div className={cx(badgeStyle(getStatusIconAndColor(status).color), className)}>
        <FontAwesomeIcon
          icon={getStatusIconAndColor(status).icon}
          size={'sm'}
          title={tooltip}
        />
        {i18n.modules.card.settings.statuses[status]}
      </div>
    );
  } else {
    return (
      <div title={tooltip}>
        {status != 'ACTIVE' && (
          <FontAwesomeIcon
            className={css({ paddingRight: space_S })}
            icon={getStatusIconAndColor(status).icon}
            color={getStatusIconAndColor(status).color}
          />
        )}
        <span>{i18n.modules.card.settings.statuses[status]}</span>
      </div>
    );
  }
}
