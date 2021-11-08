/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faFile as farFile,
  faStickyNote as farStickyNote,
} from '@fortawesome/free-regular-svg-icons/';
import { faCog, faFile, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useLocalStorage } from '../../preferences';
import { useCardACLForCurrentUser, useVariantsOrLoad } from '../../selectors/cardSelector';
import { useCardType } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OnBlurInput from '../common/OnBlurInput';
import OpenCloseModal from '../common/OpenCloseModal';
import { DocumentEditorAsDeliverableWrapper } from '../documents/DocumentEditorWrapper';
import { useBlock } from '../live/LiveTextEditor';
import { ResourceContextScope } from '../resources/ResourceCommonType';
import ResourcesWrapper from '../resources/ResourcesWrapper';
import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import { cardStyle, cardTitle } from '../styling/style';
import CardSettings from './CardSettings';
import ContentSubs from './ContentSubs';
import { VariantPager } from './VariantSelector';

interface Props {
  card: Card;
  variant: CardContent;
  showSubcards?: boolean;
}

const rightPanelStyle = css({
  borderLeft: '1px solid #c2c2c2',
  paddingLeft: '5px',
});

const barHeight = '18px';

const progressBarContainer = css({
  height: barHeight,
  lineHeight: barHeight,
  backgroundColor: '#949494',
  width: '100%',
  position: 'relative',
});

const valueStyle = css({
  position: 'absolute',
  color: 'white',
  width: '100%',
  textAlign: 'center',
});

const progressBar = (width: number) =>
  css({
    width: `${width}%`,
    height: 'inherit',
    backgroundColor: '#00DDB3',
  });

function ProgressBar({ variant }: { variant: CardContent | undefined }) {
  const percent = variant != null ? variant.completionLevel : 0;
  return (
    <div className={progressBarContainer}>
      <div className={valueStyle}>{percent}%</div>
      <div className={progressBar(percent)}></div>
    </div>
  );
}

export default function CardEditor({
  card,
  variant,
  showSubcards = true,
}: //variant,
//variants,
Props): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const cardTypeFull = useCardType(card.cardTypeId);
  const cardType = cardTypeFull.cardType;

  const variants = useVariantsOrLoad(card) || [];

  const purpose = useBlock(cardType?.purposeId);

  const [showStickyNote, setShowStickyNote] = useLocalStorage('showStickNotes', false);

  const toggleShowStickyNotes = React.useCallback(() => {
    setShowStickyNote(current => !current);
  }, [setShowStickyNote]);

  const [rightPanel, setRightPanel] = useLocalStorage<'NONE' | 'RESOURCES'>(
    'cardRightPanel',
    'NONE',
  );

  const toggleResourcePanel = React.useCallback(() => {
    setRightPanel(current => {
      if (current !== 'RESOURCES') {
        return 'RESOURCES';
      }
      return 'NONE';
    });
  }, [setRightPanel]);

  const userAcl = useCardACLForCurrentUser(card.id);
  const readOnly = !userAcl.write || variant.frozen;

  React.useEffect(() => {
    if (cardType === undefined) {
      if (cardTypeFull.chain.length > 0) {
        const link = cardTypeFull.chain[cardTypeFull.chain.length - 1];

        if (link != null && link.targetId != null) {
          dispatch(API.getCardType(link.targetId));
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
      <Flex direction="column" grow={1}>
        <Flex grow={1} direction="row">
          {showStickyNote ? <StickyNoteWrapper destCardId={card.id} showSrc /> : null}

          <Flex
            grow={1}
            direction="column"
            justify="space-between"
            className={cx(
              cardStyle,
              css({
                backgroundColor: card.color || 'white',
              }),
            )}
          >
            <Flex direction="row" grow={1}>
              <Flex direction="column" grow={1}>
                <Flex
                  direction="column"
                  grow={1}
                  className={css({
                    padding: '10px',
                    flexGrow: 1,
                  })}
                >
                  <div>
                    <Flex justify="space-between">
                      <Flex>
                        <OnBlurInput
                          className={cardTitle}
                          value={card.title || ''}
                          readOnly={readOnly}
                          placeholder={i18n.card.untitled}
                          onChange={newValue =>
                            dispatch(API.updateCard({ ...card, title: newValue }))
                          }
                        />
                        {variant != null && variants.length > 1 ? (
                          <>
                            {'/'}
                            <OnBlurInput
                              className={cardTitle}
                              value={variant.title || ''}
                              readOnly={readOnly}
                              placeholder={i18n.content.untitled}
                              onChange={newValue =>
                                dispatch(API.updateCardContent({ ...variant, title: newValue }))
                              }
                            />
                          </>
                        ) : null}
                      </Flex>
                      <Flex>
                        <OpenCloseModal
                          title="Card Settings"
                          showCloseButton={true}
                          collapsedChildren={<IconButton icon={faCog} />}
                        >
                          {close => <CardSettings onClose={close} card={card} variant={variant} />}
                        </OpenCloseModal>

                        <IconButton
                          icon={showStickyNote ? faStickyNote : farStickyNote}
                          onClick={toggleShowStickyNotes}
                        />

                        <IconButton
                          icon={rightPanel === 'RESOURCES' ? faFile : farFile}
                          onClick={toggleResourcePanel}
                        />
                      </Flex>
                    </Flex>
                    <h4>Purpose</h4>
                    <div>
                      <b>{cardType?.title}</b>: {purpose?.textData || ''}
                    </div>
                  </div>

                  {variant != null ? (
                    <Flex direction="column" grow={1}>
                      <h5>Card Content #{variant.id}</h5>
                      <div>
                        {userAcl.read ? (
                          variant && variant.id ? (
                            <DocumentEditorAsDeliverableWrapper
                              cardContentId={variant.id}
                              allowEdition={!readOnly}
                            />
                          ) : (
                            <span>no deliverable available</span>
                          )
                        ) : (
                          <span>Access Denied</span>
                        )}
                      </div>
                    </Flex>
                  ) : null}
                  <VariantPager allowCreation={userAcl.write} card={card} current={variant} />
                </Flex>
                <Flex align="center">
                  <OpenCloseModal
                    title="Edit card completion"
                    className={css({ width: '100%' })}
                    showCloseButton={true}
                    collapsedChildren={<ProgressBar variant={variant} />}
                  >
                    {() => (
                      <Flex direction="column">
                        {variant != null ? (
                          <AutoSaveInput
                            inputType="INPUT"
                            value={String(variant.completionLevel || 0)}
                            onChange={newValue =>
                              dispatch(
                                API.updateCardContent({ ...variant, completionLevel: +newValue }),
                              )
                            }
                          />
                        ) : null}
                      </Flex>
                    )}
                  </OpenCloseModal>
                </Flex>
              </Flex>

              {rightPanel !== 'NONE' ? (
                <Flex shrink={1} className={rightPanelStyle}>
                  {rightPanel === 'RESOURCES'
                    ? card.id &&
                      variant?.id && (
                        <ResourcesWrapper
                          kind={ResourceContextScope.CardOrCardContent}
                          accessLevel={
                            !readOnly && userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'
                          }
                          cardId={card.id}
                          cardContentId={variant.id}
                        />
                      )
                    : null}
                </Flex>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
        {showSubcards ? (
          variant != null ? (
            <ContentSubs depth={1} cardContent={variant} />
          ) : (
            <i>no content</i>
          )
        ) : null}
      </Flex>
    );
  }
}
