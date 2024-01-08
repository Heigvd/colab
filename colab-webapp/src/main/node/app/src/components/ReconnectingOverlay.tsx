/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../i18n/I18nContext';
import InlineLoading from './common/element/InlineLoading';
import Overlay from './common/layout/Overlay';

export default function ReconnectingOverlay(): JSX.Element {
  const i18n = useTranslations();

  return (
    <Overlay
      backgroundStyle={css({
        backgroundColor: 'var(--blackWhite-700)',
        userSelect: 'none',
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        })}
      >
        <InlineLoading />
        <span>{i18n.authentication.info.reconnecting}</span>
      </div>
    </Overlay>
  );
}
