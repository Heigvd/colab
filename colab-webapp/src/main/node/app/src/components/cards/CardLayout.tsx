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

const progressBarContainer = css({
  height: '8px',
  backgroundColor: 'var(--bg-secondary)',
  width: '100%',
});

export const progressBarStyle = (width: number) =>
  css({
    width: `${width}%`,
    height: 'inherit',
    backgroundColor: 'var(--green-200)',
  });

export function ProgressBar({ variant }: { variant: CardContent | undefined }): JSX.Element {
  const percent = variant != null ? variant.completionLevel : 0;
  return (
    <div className={progressBarContainer}>
      <div className={progressBarStyle(percent)}> </div>
    </div>
  );
}

interface CardLayoutProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  children: React.ReactNode;
  extraTools?: React.ReactNode;
  className?: string;
}

export default function CardLayout({
  card,
  // variant,
  children,
  extraTools,
  className,
}: CardLayoutProps): JSX.Element {
  //const navigate = useNavigate();
  //const location = useLocation();
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
        {extraTools}
        {children}
      </div>
    );
  }
}
