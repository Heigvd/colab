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
import { useAppDispatch } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';
import { TwitterPicker } from 'react-color';
import OpenClose from '../common/OpenClose';
import { faFile, faPalette, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../common/IconButton';
import FitSpace from '../common/FitSpace';
import { useCardType } from '../../selectors/cardTypeSelector';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
}

export default function CardEditor({
  card,
  showSubcards = true,
  variant,
  variants,
}: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const [resourcesVisible, showResources] = React.useState(false);
  const [stickyNotesVisible, showStickyNotes] = React.useState(false);

  const cardTypeFull = useCardType(card.cardTypeinitionId);
  const cardType = cardTypeFull.cardType;

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    if (cardType === undefined && card.cardTypeinitionId != null) {
      dispatch(API.getCardType(card.cardTypeinitionId));
    }

    return (
      <FitSpace>
        <>
          <FitSpace direction="row">
            <>
              <div className={css({ display: stickyNotesVisible ? undefined : 'none' })}>
                <h3>Sticky Notes</h3>
                <p>
                  <i>show block to card relationship</i>
                </p>
              </div>

              <CardLayout card={card} variant={variant} variants={variants}>
                <div
                  className={css({
                    padding: '10px',
                    flexGrow: 1,
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                    })}
                  >
                    <IconButton
                      icon={faStickyNote}
                      iconColor={stickyNotesVisible ? 'var(--pictoOrange)' : undefined}
                      onClick={() => showStickyNotes(state => !state)}
                    />
                    <IconButton
                      icon={faFile}
                      iconColor={resourcesVisible ? 'var(--pictoOrange)' : undefined}
                      onClick={() => showResources(state => !state)}
                    />
                  </div>
                  <div>
                    <h5>Card Definition</h5>
                    <div>Type: {cardType?.title || ''}</div>
                    <div>Purpose: {cardType?.purpose || ''}</div>
                  </div>

                  <div>
                    <h5>Card settings</h5>
                    <OpenClose
                      openIcon={faPalette}
                      collaspedChildren={<span>{card.color || 'no color'}</span>}
                    >
                      <TwitterPicker
                        colors={['#EDD3EC', '#EAC2C2', '#CCEFD4', '#E1F2F9', '#F9F5D6', '#F6F1F1']}
                        color={card.color || 'white'}
                        onChangeComplete={newColor => {
                          dispatch(API.updateCard({ ...card, color: newColor.hex }));
                        }}
                      />
                    </OpenClose>
                  </div>

                  {variant != null ? (
                    <div>
                      <h5>Card Content</h5>
                      <div>
                        Title:
                        <AutoSaveInput
                          inputType="INPUT"
                          value={variant.title || ''}
                          onChange={newValue =>
                            dispatch(API.updateCardContent({ ...variant, title: newValue }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardLayout>
              <div className={css({ display: resourcesVisible ? undefined : 'none' })}>
                <h3>Resources</h3>
                <ul>
                  <li>Acces ressources "héritées"</li>
                  <li>
                    Ajouter une ressource
                    <ul>
                      <li>Pour cette variante uniquement</li>
                      <li>Pour toutes les variantes de la carte</li>
                      <li>Pour toutes les cartes de ce type</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </>
          </FitSpace>
          {showSubcards ? (
            variant != null ? (
              <ContentSubs depth={1} cardContent={variant} />
            ) : (
              <i>no content</i>
            )
          ) : null}
        </>
      </FitSpace>
    );
  }
}
