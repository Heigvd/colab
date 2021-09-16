/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheck, faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import { useCardType } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';
import FitSpace from '../common/FitSpace';
import OpenClose from '../common/OpenClose';
import { DocumentEditorWrapper } from '../documents/DocumentEditorWrapper';
import { ResourceContextScope } from '../resources/ResourceCommonType';
import ResourcesWrapper from '../resources/ResourcesWrapper';
import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import { sideTabButton } from '../styling/style';
import CardLayout from './CardLayout';
import ContentSubs from './ContentSubs';

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

  const cardTypeFull = useCardType(card.cardTypeId);
  const cardType = cardTypeFull.cardType;

  React.useEffect(() => {
    if (cardType === undefined) {
      if (cardTypeFull.chain.length > 0) {
        const link = cardTypeFull.chain[cardTypeFull.chain.length - 1];

        if (link != null && link.abstractCardTypeId != null) {
          dispatch(API.getCardType(link.abstractCardTypeId));
        }
      } else if (card.cardTypeId != null) {
        dispatch(API.getCardType(card.cardTypeId));
      }
    }
  }, [cardTypeFull, cardType, dispatch, card.cardTypeId]);

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <FitSpace>
        <>
          <FitSpace direction="row">
            <>
              <OpenClose collapsedChildren={<span className={sideTabButton}>sticky notes</span>}>
                {() => <>{card.id && <StickyNoteWrapper destCardId={card.id} showSrc />}</>}
              </OpenClose>

              <CardLayout card={card} variant={variant} variants={variants}>
                <div
                  className={css({
                    padding: '10px',
                    flexGrow: 1,
                  })}
                >
                  <div>
                    <h5>Card Type #{cardType?.id}</h5>
                    <div>Type: {cardType?.title || ''}</div>
                    <div>Purpose: {cardType?.purpose || ''}</div>
                  </div>

                  <div>
                    <h5>Card settings #{card.id}</h5>
                    <OpenClose
                      closeIcon={faCheck}
                      collapsedChildren={
                        <span>
                          <FontAwesomeIcon icon={faPalette} />
                        </span>
                      }
                    >
                      {() => (
                        <TwitterPicker
                          colors={[
                            '#EDD3EC',
                            '#EAC2C2',
                            '#CCEFD4',
                            '#E1F2F9',
                            '#F9F5D6',
                            '#F6F1F1',
                          ]}
                          color={card.color || 'white'}
                          triangle="hide"
                          onChangeComplete={newColor => {
                            dispatch(API.updateCard({ ...card, color: newColor.hex }));
                          }}
                        />
                      )}
                    </OpenClose>
                  </div>

                  {variant != null ? (
                    <div>
                      <h5>Card Content #{variant.id}</h5>
                      <div>
                        Title:
                        <AutoSaveInput
                          inputType="INPUT"
                          value={variant.title || ''}
                          onChange={newValue =>
                            dispatch(API.updateCardContent({ ...variant, title: newValue }))
                          }
                        />
                        {variant.deliverableId != null ? (
                          <DocumentEditorWrapper docId={variant.deliverableId} />
                        ) : (
                          <span>please create a doc !!!!</span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardLayout>
              <OpenClose collapsedChildren={<span className={sideTabButton}>Resources</span>}>
                {() => (
                  <>
                    {card.id && variant?.id && (
                      <ResourcesWrapper
                        kind={ResourceContextScope.CardOrCardContent}
                        cardId={card.id}
                        cardContentId={variant.id}
                      />
                    )}
                  </>
                )}
              </OpenClose>
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
