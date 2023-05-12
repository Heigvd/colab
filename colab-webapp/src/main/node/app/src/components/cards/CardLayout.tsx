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
import { cardColors } from '../../styling/theme';
import { ProgressBar } from './ProgressBar';

interface CardLayoutProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  children: React.ReactNode;
  showProgressBar?: boolean;
  coveringColor?: boolean;
  className?: string;
}

export default function CardLayout({
  card,
  variant,
  children,
  className,
  showProgressBar = true,
  coveringColor = true,
}: CardLayoutProps): JSX.Element {
  const i18n = useTranslations();

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <div
        className={cx(
          cardStyle,
          coveringColor
            ? css({
                backgroundColor: `${card.color || cardColors.white}`,
              })
            : undefined,
          css({
            flexDirection: 'column',
            justifyContent: 'space-between',
            display: 'flex',
            overflow: 'hidden', // Note : it was auto, but it made a problem of scrolling in activity flow view
          }),
          className,
        )}
      >
        {children}
        {showProgressBar ? <ProgressBar card={card} variant={variant} /> : null}
      </div>
    );
  }
}
