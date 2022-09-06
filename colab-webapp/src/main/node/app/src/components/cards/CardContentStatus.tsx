/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { CardContentStatus } from 'colab-rest-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArchive,
  faPause,
  faPencilRuler,
  faSkullCrossbones,
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { space_S } from '../styling/style';
import { css } from '@emotion/css';
import useTranslations from '../../i18n/I18nContext';

export interface CardContentStatusProps {
  status: CardContentStatus;
  mode: 'icon' | 'full';
}

export function getStatusIcon(status: CardContentStatus): IconProp {
  switch (status) {
    case 'ACTIVE':
      return faPencilRuler;
    case 'POSTPONED':
      return faPause;
    case 'ARCHIVED':
      return faArchive;
    case 'REJECTED':
      return faSkullCrossbones;
  }
}

export default function CardContentStatusDisplay({
  status,
  mode,
}: CardContentStatusProps): JSX.Element {
  const i18n = useTranslations();

  const tooltip = i18n.modules.card.settings.statusTooltip(status);

  if (mode === 'icon') {
    if (status === 'ACTIVE') {
      return <></>;
    }
    return (
      <FontAwesomeIcon
        className={css({ paddingRight: space_S })}
        icon={getStatusIcon(status)}
        color={'var(--darkGray)'}
        title={tooltip}
      />
    );
  } else {
    return (
      <div title={tooltip}>
        {status != 'ACTIVE' && (
          <FontAwesomeIcon
            className={css({ paddingRight: space_S })}
            icon={getStatusIcon(status)}
            color={'var(--darkGray)'}
          />
        )}
        <span className={css({})}>{status.toLocaleLowerCase()}</span>
      </div>
    );
  }
}
