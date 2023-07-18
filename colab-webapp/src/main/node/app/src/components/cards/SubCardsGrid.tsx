/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
//import { useLocation } from 'react-router-dom';
import { max } from 'lodash';
import { changeCardPosition } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useAndLoadSubCards,
  useSortSubcardsWithPos as sortSubcardsWithPos,
} from '../../store/selectors/cardSelector';
import { br_md, lightIconButtonStyle, space_lg, space_md, space_sm } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';
import GridOrganizer, { fixGrid } from '../common/GridOrganizer';
import Flex from '../common/layout/Flex';
import CardThumbWithSelector from './CardThumbWithSelector';
import Draggable from './dnd/Draggable';

// TODO : nice className for div for empty slot (blank card)

const NB_CARDS_PER_ROW = 3;
const NB_CARDS_PER_COLUMN = 2;

interface SubCardsGridProps {
  cardContent: CardContent;
  depth?: number;
  organize?: boolean;
  showPreview?: boolean;
  alwaysShowAllSubCards?: boolean;
  cardSize?: {
    width: number;
    height: number;
  };
  minCardWidth: number;
  className?: string;
  subcardsContainerStyle?: string;
}
/* const tinyCard = css({
  width: '30px',
  height: '20px',
  borderRadius: '2px',
  boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
  margin: '0 2px',
}); */

const subCardsContainerStyle = css({
  display: 'flex',
  alignItems: 'stretch',
  flexDirection: 'column',
  //justifyContent: 'flex-end',
  //marginTop: space_L,
});

/* const gridCardsStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))',
  justifyContent: 'stretch',
  alignContent: 'stretch',
  justifyItems: 'stretch',
  alignItems: 'stretch'}); */

function gridCardsStyle(nbRows: number, nbColumns: number, nbCardsInRow: number, depth?: number) {
  const gridStyle = { flexGrow: '1', display: 'grid' };
  if (depth === 1) {
    return css({
      ...gridStyle,
      gridTemplateColumns: `repeat(${nbCardsInRow}, minmax(65px, 1fr))`,
      //gridTemplateRows: 'repeat(2, 1fr)',
      gridAutoRows: `minmax(55px, 1fr)`,
    });
  } else {
    return css({
      ...gridStyle,
      gridTemplateColumns: `repeat(${nbColumns >= 3 ? nbColumns : 3}, minmax(250px, 1fr))`,
      //gridTemplateColumns: `repeat(${nbColumns}, minmax(250px, 1fr))`,
      gridTemplateRows: `repeat(${nbRows >= 1 ? nbRows : 1}, minmax(150px, 1fr))`,
      /* justifyContent: 'stretch',
    alignContent: 'stretch',
    justifyItems: 'stretch',
    alignItems: 'stretch', */
    });
  }
}

const hideEmptyGridStyle = css({
  ':empty': {
    display: 'none',
  },
});

// Display sub cards of a parent
export default function SubCardsGrid({
  cardContent,
  depth = 1,
  organize = false,
  showPreview,
  alwaysShowAllSubCards = false,
  cardSize,
  minCardWidth,
  className,
  subcardsContainerStyle,
}: SubCardsGridProps): JSX.Element {
  //const location = useLocation();
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const maxCardsInRow = NB_CARDS_PER_ROW * (cardSize?.width ?? 1);
  const maxCardsInColumn = (NB_CARDS_PER_COLUMN + 1) * (cardSize?.height ?? 1) - 1;

  const subCards = useAndLoadSubCards(cardContent.id);
  const sortedSubCardsWithPos = React.useMemo(() => {
    return sortSubcardsWithPos(subCards);
  }, [subCards]);

  const isCardHiddenByDefault = React.useCallback(
    (card: Card) => {
      return card.x > maxCardsInRow || card.y > maxCardsInColumn;
    },
    [maxCardsInRow, maxCardsInColumn],
  );

  const hasALotOfSubCards: boolean = React.useMemo(() => {
    return (
      !alwaysShowAllSubCards &&
      (subCards || []).filter(card => isCardHiddenByDefault(card)).length > 0
    );
  }, [alwaysShowAllSubCards, isCardHiddenByDefault, subCards]);

  const [showMoreCards, setShowMoreCards] = React.useState<boolean>(false);

  const effectiveNbCardByRow: number = React.useMemo(() => {
    if (!showMoreCards) {
      return maxCardsInRow;
    }
    const effectiveMaxRow = max((subCards || []).map(card => card.x));
    return max([effectiveMaxRow, maxCardsInRow]) || 0;
  }, [showMoreCards, subCards, maxCardsInRow]);

  const indexedSubCards = React.useMemo(() => {
    if (subCards != null) {
      const cards = subCards.map(card => {
        return {
          id: card.id!,
          x: card.x,
          y: card.y,
          width: card.width,
          height: card.height,
          payload: card,
        };
      });

      return fixGrid(cards);
    }

    return { cells: [], nbColumns: 3, nbRows: 1 };
  }, [subCards]);

  if (sortedSubCardsWithPos == null) {
    return <InlineLoading />;
  } else {
    if (depth > 0) {
      return (
        <>
          <div
            className={cx(
              subCardsContainerStyle,
              className,
              //indexedSubCards.cells.length > 0 ? flexGrow : undefined,
            )}
          >
            {sortedSubCardsWithPos.length === 0 && depth === 2 && (
              <h3 className={css({ padding: '10px 0 0 10px' })}>
                {i18n.modules.card.infos.noCardYetPleaseCreate}
              </h3>
            )}
            {organize ? (
              <>
                {/* <Flex>
                <LabeledInput
                  label={'Number of columns'}
                  type='number'
                  value={nbColumns}
                  onChange={(c) => {setNbColumns(Number(c))}}
                />
              </Flex> */}
                <GridOrganizer
                  className={css({
                    height: '100%',
                    //width: '100%',
                    alignSelf: 'stretch',
                    padding: '0 ' + space_md,
                  })}
                  //nbColumns={{nbColumns, setNbColumns}}
                  cells={indexedSubCards.cells}
                  gap="6px"
                  handleSize="33px"
                  onResize={(cell, newPosition) => {
                    dispatch(
                      changeCardPosition({
                        cardId: cell.payload.id!,
                        newPosition: newPosition,
                      }),
                    );
                  }}
                  background={cell => {
                    return (
                      <Draggable id={String(cell.id)} data={cell.payload}>
                        <CardThumbWithSelector
                          className={css({
                            height: '100%',
                            minHeight: '100px',
                            margin: 0,
                            '.VariantPagerArrow': {
                              display: 'none',
                            },
                          })}
                          depth={0}
                          key={cell.payload.id}
                          card={cell.payload}
                          showPreview={false}
                        />
                      </Draggable>
                    );
                  }}
                />
              </>
            ) : (
              <>
                <div
                  className={cx(
                    gridCardsStyle(
                      indexedSubCards.nbRows,
                      indexedSubCards.nbColumns,
                      effectiveNbCardByRow,
                      depth,
                    ),
                    //gridCardsStyle(indexedSubCards.nbRows, nbColumns, depth),
                    subcardsContainerStyle,
                    hideEmptyGridStyle,
                  )}
                >
                  {sortedSubCardsWithPos
                    .filter(
                      card =>
                        alwaysShowAllSubCards ||
                        !hasALotOfSubCards ||
                        (hasALotOfSubCards && showMoreCards) ||
                        (!showMoreCards &&
                          !isCardHiddenByDefault(card) &&
                          !(card.x === maxCardsInRow && card.y === maxCardsInColumn)),
                    )
                    .map(card => {
                      return (
                        <Draggable
                          id={String(card.id)}
                          data={card}
                          key={card.id}
                          className={css({
                            gridColumnStart: card.x,
                            gridColumnEnd: card.x + card.width,
                            gridRowStart: card.y,
                            gridRowEnd: card.y + card.height,
                            minWidth: `${card.width * minCardWidth}px`,
                            maxHeight: '100%',
                          })}
                        >
                          <CardThumbWithSelector
                            cardThumbClassName={css({ overflow: 'hidden' })}
                            depth={depth - 1}
                            key={card.id}
                            card={card}
                            showPreview={showPreview}
                          />
                        </Draggable>
                      );
                    })}
                  {hasALotOfSubCards &&
                    (!showMoreCards ? (
                      <Flex
                        justify="center"
                        align="center"
                        grow={1}
                        className={cx(
                          lightIconButtonStyle,
                          br_md,
                          css({
                            gridColumnStart: maxCardsInRow,
                            gridRowStart: maxCardsInColumn,
                          }),
                        )}
                      >
                        <IconButton
                          kind="ghost"
                          title={i18n.common.action.showMore}
                          icon={'expand_more'}
                          onClick={() => setShowMoreCards(e => !e)}
                          className={css({ border: '1px solid var(--divider-main)' })}
                        />
                      </Flex>
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        grow={1}
                        className={cx(
                          lightIconButtonStyle,
                          br_md,
                          css({
                            position: 'absolute',
                            right: space_sm,
                            bottom: space_lg,
                            border: '1px dotted var(--divider-main)',
                          }),
                        )}
                      >
                        <IconButton
                          kind="ghost"
                          title={i18n.common.action.showLess}
                          icon={'expand_less'}
                          onClick={() => setShowMoreCards(e => !e)}
                        />
                      </Flex>
                    ))}
                </div>
              </>
            )}
          </div>
        </>
      );
    }
    return <></>;
  }
}
