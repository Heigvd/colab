/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheck, faPalette, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import { useCardType } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';
import FitSpace from '../common/FitSpace';
import OpenClose from '../common/OpenClose';
import { DocumentEditorWrapper } from '../documents/DocumentEditorWrapper';
import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import CardACL from './CardACL';
import CardLayout from './CardLayout';
import ContentSubs from './ContentSubs';
import InvolvemenetSelector from './InvolvementSelector';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
}

const sideTabButton = css({
  writingMode: 'sideways-lr',
  textOrientation: 'sideways',
  width: '24px',
});

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

  const updateDefInvolvementLevel = React.useCallback(
    (value: InvolvementLevel | null) => {
      dispatch(API.updateCard({ ...card, defaultInvolvementLevel: value }));
    },
    [card, dispatch],
  );

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <FitSpace>
        <>
          <FitSpace direction="row">
            <>
              <OpenClose collaspedChildren={<span className={sideTabButton}>sticky notes</span>}>
                {() => <>{card.id && <StickyNoteWrapper cardDestId={card.id} showSrc />}</>}
              </OpenClose>

              <CardLayout card={card} variant={variant} variants={variants}>
                <div
                  className={css({
                    padding: '10px',
                    flexGrow: 1,
                  })}
                >
                  <div>
                    <h5>Card Type</h5>
                    <div>Type: {cardType?.title || ''}</div>
                    <div>Purpose: {cardType?.purpose || ''}</div>
                  </div>

                  <div>
                    <h5>Card settings</h5>
                    <InvolvemenetSelector
                      self={card.defaultInvolvementLevel}
                      onChange={updateDefInvolvementLevel}
                    />
                    <OpenClose
                      closeIcon={faCheck}
                      collaspedChildren={
                        <span>
                          <FontAwesomeIcon icon={faUsers} />
                        </span>
                      }
                    >
                      {() => <CardACL card={card} />}
                    </OpenClose>

                    <OpenClose
                      closeIcon={faCheck}
                      collaspedChildren={
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
              <OpenClose collaspedChildren={<span className={sideTabButton}>Resources</span>}>
                {() => (
                  <div>
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
