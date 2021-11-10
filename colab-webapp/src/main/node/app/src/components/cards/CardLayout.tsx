/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPen, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import WithToolbar from '../common/WithToolbar';
import { cardShadow, cardStyle } from '../styling/style';

const progressBarContainer = css({
  height: '4px',
  backgroundColor: '#c2c2c2',
  width: '100%',
});

const progressBarStyle = (width: number) =>
  css({
    width: `${width}%`,
    height: 'inherit',
    backgroundColor: '#2674AC',
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
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const color = card.color || 'white';

    return (
      <WithToolbar
        offsetY={-0.5}
        toolbar={
          <>
            {extraTools}

            {variant != null ? (
              <>
                <IconButton
                  icon={faSearch}
                  onClick={() => {
                    const path = `card/${card.id}`;
                    if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
                      navigate(`../${path}`);
                    } else {
                      navigate(path);
                    }
                  }}
                />
                <IconButton
                  icon={faPen}
                  onClick={() => {
                    const path = `edit/${card.id}/v/${variant.id}`;
                    if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
                      navigate(`../${path}`);
                    } else {
                      navigate(`${path}`);
                    }
                  }}
                />
              </>
            ) : null}

            {variants.length > 1 && variant != null ? (
              // several variants, delete the current one
              <Destroyer
                title="Delete this variant"
                onDelete={() => {
                  dispatch(API.deleteCardContent(variant));
                }}
              />
            ) : (
              // last variant : delete the whole card
              <Destroyer
                title="Delete the card"
                onDelete={() => {
                  dispatch(API.deleteCard(card));
                }}
              />
            )}
          </>
        }
      >
        <Flex
          direction="column"
          justify="space-between"
          className={cx(
            cardStyle,
            css({
              backgroundColor: color,
              boxShadow:
                variants.length > 1
                  ? `${cardShadow}, 3px 3px 0px -1px white, 4px 4px 0px 0px ${color}`
                  : undefined,
            }),
          )}
        >
          {children}
          {showProgressBar ? <ProgressBar variant={variant} /> : null}
        </Flex>
      </WithToolbar>
    );
  }
}
