/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSingleAndDoubleClick } from '../../store/hooks';
import { cardShadow, cardStyle } from '../styling/style';

const progressBarContainer = css({
  height: '5px',
  backgroundColor: 'var(--pictoGrey)',
  width: '100%',
});

const progressBarStyle = (width: number) =>
  css({
    width: `${width}%`,
    height: 'inherit',
    backgroundColor: 'var(--successColor)',
  });

export function ProgressBar({ variant }: { variant: CardContent | undefined }): JSX.Element {
  const percent = variant != null ? variant.completionLevel : 0;
  return (
    <div className={progressBarContainer}>
      <div className={progressBarStyle(percent)}> </div>
    </div>
  );
}

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  children: React.ReactNode;
  extraTools?: React.ReactNode;
  showProgressBar?: boolean;
}

export default function CardLayout({
  card,
  variant,
  variants,
  children,
  extraTools,
  showProgressBar = true,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const click = useSingleAndDoubleClick(
    e => {
      if (variant != null) {
        const path = `card/${card.id}`;
        if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
          navigate(`../${path}`);
          e?.stopPropagation();
        } else {
          navigate(path);
          e?.stopPropagation();
        }
      }
    },
    e => {
      if (variant != null) {
        const path = `edit/${card.id}/v/${variant.id}`;
        if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
          navigate(`../${path}`);
          e?.stopPropagation();
        } else {
          navigate(`${path}`);
          e?.stopPropagation();
        }
      }
    },
  );

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const color = card.color || 'white';

    return (
      <div
        className={cx(
          cardStyle,
          css({
            backgroundColor: color,
            boxShadow:
              variants.length > 1
                ? `${cardShadow}, 3px 3px 0px -1px white, 4px 4px 0px 0px ${color}`
                : undefined,
            flexDirection: 'column',
            justifyContent: 'space-between',
            display: 'flex',
          }),
        )}
        onClick={click}
      >
        {extraTools}
        {children}
        {showProgressBar ? <ProgressBar variant={variant} /> : null}
      </div>
    );
  }
}
