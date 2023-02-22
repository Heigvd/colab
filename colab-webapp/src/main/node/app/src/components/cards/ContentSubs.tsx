/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
//import { useLocation } from 'react-router-dom';
import { changeCardPosition } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import GridOrganizer, { fixGrid } from '../common/GridOrganizer';
import Ellipsis from '../common/layout/Ellipsis';
import Flex from '../common/layout/Flex';
import { useSortSubcardsWithPos } from '../hooks/sortCards';
import { lightIconButtonStyle, m_lg, space_xl } from '../styling/style';
import CardCreator from './CardCreator';
import { TinyCard } from './CardThumb';
import CardThumbWithSelector from './CardThumbWithSelector';

// TODO : nice className for div for empty slot (blank card)

interface ContentSubsProps {
  cardContent: CardContent;
  cardSize?: {
    width: number;
    height: number;
  };
  depth?: number;
  showEmptiness?: boolean;
  className?: string;
  subcardsContainerStyle?: string;
  organize?: boolean;
  showPreview?: boolean;
  minCardWidth: number;
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

export function gridCardsStyle(
  nbRows: number,
  nbColumns: number,
  depth?: number,
  cardWidth?: number,
) {
  const gridStyle = { flexGrow: '1', display: 'grid' };
  if (depth === 1) {
    return css({
      ...gridStyle,
      gridTemplateColumns: `repeat(${cardWidth ? cardWidth * 3 : 3}, minmax(65px, 1fr))`,
      //gridTemplateRows: 'repeat(2, 1fr)',
      gridAutoRows: `minmax(55px, 1fr)`,
    });
  } else {
    return css({
      ...gridStyle,
      gridTemplateColumns: `repeat(${nbColumns >= 3 ? nbColumns : 3}, minmax(250px, 1fr))`,
      //gridTemplateColumns: `repeat(${nbColumns}, minmax(250px, 1fr))`,
      gridTemplateRows: `repeat(${nbRows >= 3 ? nbRows : 3}, minmax(150px, 1fr))`,
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
export default function ContentSubs({
  cardContent,
  cardSize,
  depth = 1,
  showEmptiness = false,
  className,
  subcardsContainerStyle,
  organize = false,
  showPreview,
  minCardWidth,
}: ContentSubsProps): JSX.Element {
  //const location = useLocation();
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const subCards = useAndLoadSubCards(cardContent.id);
  const sortedSubCardsWithPos = useSortSubcardsWithPos(subCards);
  const nbSubDisplayed = cardSize
    ? cardSize?.width * cardSize.height * 6 + 3 * cardSize.width * (cardSize.height - 1)
    : undefined;
  //const [nbColumns, setNbColumns] = React.useState<number>(3);

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
    if (sortedSubCardsWithPos.length === 0 && showEmptiness) {
      return (
        <Flex
          justify="center"
          align="center"
          direction="column"
          className={css({
            padding: space_xl,
          })}
        >
          <h3>{i18n.modules.card.infos.noCardYetPleaseCreate}</h3>
          <CardCreator
            parentCardContent={cardContent}
            customLabel={i18n.modules.card.infos.createFirstCard}
            className={cx(lightIconButtonStyle, m_lg)}
          />
        </Flex>
      );
    } else {
      return depth > 0 ? (
        <div
          className={cx(
            subCardsContainerStyle,
            className,
            //indexedSubCards.cells.length > 0 ? flexGrow : undefined,
          )}
        >
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
                  padding: '0 ' + space_xl,
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
                    depth,
                    cardSize?.width,
                  ),
                  //gridCardsStyle(indexedSubCards.nbRows, nbColumns, depth),
                  subcardsContainerStyle,
                  hideEmptyGridStyle,
                )}
              >
                {depth === 1 && nbSubDisplayed && sortedSubCardsWithPos.length > nbSubDisplayed ? (
                  <>
                    {sortedSubCardsWithPos.slice(0, nbSubDisplayed - 1).map(payload => {
                      return (
                        <CardThumbWithSelector
                          cardThumbClassName={css({ overflow: 'hidden' })}
                          depth={depth - 1}
                          key={payload.id}
                          card={payload}
                          showPreview={showPreview}
                        />
                      );
                    })}
                    <Flex
                      justify="center"
                      align="center"
                      grow={1}
                      className={cx(
                        lightIconButtonStyle,
                        css({ border: '1px dashed var(--divider-main)' }),
                      )}
                    >
                      <h3>+ {sortedSubCardsWithPos.length - (nbSubDisplayed - 1)}</h3>
                    </Flex>
                  </>
                ) : (
                  <>
                    {sortedSubCardsWithPos.map(card => (
                      <CardThumbWithSelector
                        className={
                          depth === 1
                            ? undefined
                            : css({
                                gridColumnStart: card.x,
                                gridColumnEnd: card.x + card.width,
                                gridRowStart: card.y,
                                gridRowEnd: card.y + card.height,
                                minWidth: `${card.width * minCardWidth}px`,
                                maxHeight: '100%',
                              })
                        }
                        depth={depth - 1}
                        key={card.id}
                        card={card}
                        showPreview={showPreview}
                      />
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <Ellipsis
          items={sortedSubCardsWithPos}
          alignEllipsis="flex-end"
          itemComp={sub => <TinyCard key={sub.id} card={sub} />}
          containerClassName={css({ height: '20px' })}
        />
      );
    }
  }
}
