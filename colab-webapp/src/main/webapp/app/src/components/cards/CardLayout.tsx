/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { Card, CardContent } from 'colab-rest-client';
import { css } from '@emotion/css';
import { Destroyer } from '../common/Destroyer';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/IconButton';
import { faPen, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import WithToolbar from '../common/WithToolbar';
import CardCreator from './CardCreator';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  children: JSX.Element;
}

export default ({ card, variant, variants, children }: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const history = useHistory();

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const color = card.color || 'lightgrey';

    return (
      <WithToolbar
        offsetY="-10px"
        toolbar={
          <>
            <IconButton
              icon={faSearch}
              onClick={() => {
                if (history.location.pathname.startsWith('/card/')) {
                  history.push('' + card.id);
                } else {
                  history.push('/card/' + card.id);
                }
              }}
            />
            <IconButton
              icon={faPen}
              onClick={() => {
                if (history.location.pathname.startsWith('/card/')) {
                  history.push('../edit/' + card.id);
                } else if (history.location.pathname.startsWith('/edit/')) {
                  history.push('' + card.id);
                } else {
                  history.push('/edit/' + card.id);
                }
              }}
            />

            {variant != null ? <CardCreator parent={variant} /> : null}

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
        <div
          className={css({
            //            width: 'max-content',
            border: `2px solid ${color}`,
            borderRadius: '5px',
            boxShadow:
              variants.length > 1 ? `3px 3px 0px -1px white, 4px 4px 0px 0px ${color}` : '',
          })}
        >
          {children}
        </div>
      </WithToolbar>
    );
  }
};
