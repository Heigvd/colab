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
import { useSingleAndDoubleClick } from '..//hooks/mouse';
import { cardShadow, cardStyle } from '../styling/style';

const progressBarContainer = css({
  height: '5px',
  backgroundColor: 'var(--pictoGrey)',
  width: '100%',
});

export const progressBarStyle = (width: number) =>
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

  const singleClick = React.useCallback(() => {
    if (variant != null) {
      const path = `card/${card.id}`;
      if (!location.pathname.match(path)) {
        if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
          navigate(`../${path}`);
        } else {
          navigate(path);
        }
      }
    }
  }, [variant, card.id, location.pathname, navigate]);

  const doubleClick = React.useCallback(() => {
    if (variant != null) {
      const path = `edit/${card.id}/v/${variant.id}`;
      if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
        navigate(`../${path}`);
      } else {
        navigate(`${path}`);
      }
    }
  }, [variant, card.id, location.pathname, navigate]);

  const click = useSingleAndDoubleClick(singleClick, doubleClick);

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <div
        className={cx(
          cardStyle,
          css({
            backgroundColor: 'white',
            boxShadow:
              variants.length > 1
                ? `${cardShadow}, 4px 4px 0px 0px white, 4px 4px 4px 1px var(--darkGray)`
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
