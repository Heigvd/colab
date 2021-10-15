/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCog, faFile } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useVariants } from '../../selectors/cardSelector';
import { useCardType } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import AutoSaveInput from '../common/AutoSaveInput';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenClose from '../common/OpenClose';
import OpenCloseModal from '../common/OpenCloseModal';
import { DocumentEditorAsDeliverableWrapper } from '../documents/DocumentEditorWrapper';
import { ResourceContextScope } from '../resources/ResourceCommonType';
import ResourcesWrapper from '../resources/ResourcesWrapper';
import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import { sideTabButton } from '../styling/style';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import ContentSubs from './ContentSubs';
import { VariantPager } from './VariantSelector';

interface Props {
  card: Card;
  //variant: CardContent | undefined;
  //variants: CardContent[];
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
  showSubcards = true,
}: //variant,
//variants,
Props): JSX.Element {
  const dispatch = useAppDispatch();

  const cardTypeFull = useCardType(card.cardTypeId);
  const cardType = cardTypeFull.cardType;

  const variants = useVariants(card) || [];

  const [rightPanel, setRightPanel] = React.useState<'NONE' | 'RESOURCES' | 'SETTINGS'>('NONE');

  const [variant, setVariant] = React.useState<CardContent | undefined>(undefined);

  const closePanelCb = React.useCallback(() => {
    setRightPanel('NONE');
  }, []);

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
          <OpenClose collapsedChildren={<span className={sideTabButton}>sticky notes</span>}>
            {() => <>{card.id && <StickyNoteWrapper destCardId={card.id} showSrc />}</>}
          </OpenClose>

          <CardLayout
            showProgressBar={false}
            card={card}
            variant={variant}
            variants={variants}
            extraTools={
              <>
                <IconButton
                  icon={faCog}
                  onClick={() => {
                    setRightPanel('SETTINGS');
                  }}
                />
                <IconButton
                  icon={faFile}
                  onClick={() => {
                    setRightPanel('RESOURCES');
                  }}
                />
              </>
            }
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
                    <h5>Purpose {cardType?.title || ''}</h5>
                    <div>{cardType?.purpose || ''}</div>
                    Card name (card.title):
                    <AutoSaveInput
                      inputType="INPUT"
                      value={card.title || ''}
                      onChange={newValue => dispatch(API.updateCard({ ...card, title: newValue }))}
                    />
                  </div>

                  {variant != null ? (
                    <Flex direction="column" grow={1}>
                      <h5>Card Content #{variant.id}</h5>
                      <div>
                        Version (contentTitle):
                        <AutoSaveInput
                          inputType="INPUT"
                          value={variant.title || ''}
                          onChange={newValue =>
                            dispatch(API.updateCardContent({ ...variant, title: newValue }))
                          }
                        />
                        {variant && variant.id ? (
                          <DocumentEditorAsDeliverableWrapper cardContentId={variant.id} />
                        ) : (
                          <span>no deliverable available</span>
                        )}
                      </div>
                    </Flex>
                  ) : null}
                  <Flex justify="center">
                    <VariantPager card={card} onSelect={setVariant} />
                  </Flex>
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
                          cardId={card.id}
                          cardContentId={variant.id}
                        />
                      )
                    : null}
                  {rightPanel === 'SETTINGS' ? (
                    <CardSettings onClose={closePanelCb} card={card} />
                  ) : null}
                </Flex>
              ) : null}
            </Flex>
          </CardLayout>
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
