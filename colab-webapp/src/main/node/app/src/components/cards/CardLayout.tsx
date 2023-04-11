/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { cardStyle } from '../../styling/style';

interface CardLayoutProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  children: React.ReactNode;
  className?: string;
}

export default function CardLayout({ card, children, className }: CardLayoutProps): JSX.Element {
  const i18n = useTranslations();

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <div
        className={cx(
          cardStyle,
          css({
            backgroundColor: 'var(--bg-primary)',
            flexDirection: 'column',
            justifyContent: 'space-between',
            display: 'flex',
            overflow: 'auto',
          }),
          className,
        )}
      >
        {children}
      </div>
    );
  }
}
