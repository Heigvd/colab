/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
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
//import { depthMax } from '../projects/edition/Editor';
import { space_L, voidStyle } from '../styling/style';
import CardCreator from './CardCreator';
import { TinyCard } from './CardThumb';
import CardThumbWithSelector from './CardThumbWithSelector';

// TODO : nice className for div for empty slot (blank card)

interface ContentSubsProps {
  cardContent: CardContent;
  depth?: number;
  showEmptiness?: boolean;
  className?: string;
  subcardsContainerStyle?: string;
  organize?: boolean;
  showPreview: boolean;
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
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  flexDirection: 'column',
  marginTop: space_L,
});

/* const flexGrow = css({
  flexGrow: '1',
}); */

/* const gridCardsStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))',
  justifyContent: 'stretch',
  alignContent: 'stretch',
  justifyItems: 'stretch',
  alignItems: 'stretch'}); */

export function gridCardsStyle(_nbRows: number) {
  return css({
    flexGrow: '1',
    display: 'grid',
    gridTemplateColumns: `repeat(3, minmax(min-content, auto))`,
    gridTemplateRows: `repeat(3, auto)`,
    //height: '50%'
    //gridTemplateColumns: `repeat(${nbColumns}, minmax(min-content, auto))`,
    // gridTemplateRows: `repeat(${nbRows}, 1fr)`,
    /* justifyContent: 'stretch',
    alignContent: 'stretch',
    justifyItems: 'stretch',
    alignItems: 'stretch', */
  });
}

const hideEmptyGridStyle = css({
  ':empty': {
    display: 'none',
  },
});

// Display sub cards of a parent
export default function ContentSubs({
  cardContent,
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

  if (subCards == null) {
    return <InlineLoading />;
  } else {
    if (subCards.length === 0 && showEmptiness) {
      return (
        <div
          className={cx(
            voidStyle,
            css({
              height: '200px',
              width: '100%',
            }),
          )}
        >
          <p>{i18n.modules.card.infos.noCardYetPleaseCreate}</p>
          <CardCreator
            parentCardContent={cardContent}
            display="2"
            className={css({ display: 'block' })}
          />
        </div>
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
            <GridOrganizer
              className={css({
                height: '100%',
                width: '100%',
              })}
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
          ) : (
            <>
              <div
                className={cx(
                  gridCardsStyle(indexedSubCards.nbRows),
                  subcardsContainerStyle,
                  hideEmptyGridStyle,
                )}
              >
                {indexedSubCards.cells.map(({ payload, y, x, width, height }) => (
                  <CardThumbWithSelector
                    className={css({
                      gridColumnStart: x,
                      gridColumnEnd: x + width,
                      gridRowStart: y,
                      gridRowEnd: y + height,
                      minWidth: `${width * minCardWidth}px`,
                      maxHeight: '100%',
                    })}
                    depth={depth - 1}
                    key={payload.id}
                    card={payload}
                    showPreview={showPreview}
                  />
                ))}
              </div>
              <Flex justify="center">
                {/* <CardCreator
                  parentCardContent={cardContent}
                  display={
                    depth === depthMax
                      ? location.pathname.match(/card\/\d+\/v\/\d+/)
                        ? undefined
                        : '1'
                      : undefined
                  }
                /> */}
              </Flex>
            </>
          )}
        </div>
      ) : (
        <Ellipsis
          items={subCards}
          alignEllipsis="flex-end"
          itemComp={sub => <TinyCard key={sub.id} card={sub} />}
        />
      );
    }
  }
}
