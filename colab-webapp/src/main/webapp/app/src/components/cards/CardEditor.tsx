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
import ContentSubs from './ContentSubs';
import CardLayout from './CardLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
}

export default function CardEditor({card, showSubcards = true, variant, variants}: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const cardDef = useAppSelector(state => {
    if (card.cardDefinitionId != null) {
      return state.carddef.carddefs[card.cardDefinitionId];
    } else {
      return null;
    }
  });

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    if (cardDef === undefined && card.cardDefinitionId != null) {
      dispatch(API.getCardDef(card.cardDefinitionId));
    }

    return (
      <>
        <CardLayout card={card} variant={variant} variants={variants}>
          <div
            className={css({
              padding: '10px',
            })}
          >
            <div>
              <h5>Card Definition</h5>
              <div>Type: {cardDef?.title || ''}</div>
              <div>Purpose: {cardDef?.purpose || ''}</div>
            </div>

            <div>
              <h5>Card settings</h5>
              <AutoSaveInput
                placeholder="grey"
                inputType="INPUT"
                value={card.color || ''}
                onChange={newValue => dispatch(API.updateCard({...card, color: newValue}))} />
            </div>

            {variant != null ? (
              <div>
                <h5>Card Content</h5>
                <div>
                  Title:
                  <AutoSaveInput
                    inputType="INPUT"
                    value={variant.title || ''}
                    onChange={newValue => dispatch(API.updateCardContent({...variant, title: newValue}))} />
                </div>
              </div>
            ) : null}
          </div>
        </CardLayout>
        {showSubcards ? (
          variant != null ? (
            <ContentSubs depth={1} cardContent={variant} />
          ) : (
            <i>no content</i>
          )
        ) : null}
      </>
    );
  }
};
