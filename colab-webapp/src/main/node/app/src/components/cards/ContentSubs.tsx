/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../selectors/cardSelector';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';
import Ellipsis from '../common/layout/Ellipsis';
import Flex from '../common/layout/Flex';
import { depthMax } from '../projects/edition/Editor';
import { fixedButtonStyle, voidStyle } from '../styling/style';
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
}
/* const tinyCard = css({
  width: '30px',
  height: '20px',
  borderRadius: '2px',
  boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
  margin: '0 2px',
}); */

const flexWrap = css({
  display: 'flex',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap',
});

/* const gridCardsStyle = css({
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))', 
  justifyContent: 'stretch', 
  alignContent: 'stretch',
  justifyItems: 'stretch', 
  alignItems: 'stretch'}); */

function gridPosFromIndex(index: number): { row: number; column: number } {
  return {
    row: Math.ceil(index / 3),
    column: ((index - 1) % 3) + 1,
  };
}

interface MaxSize {
  maxColumn: number;
  maxRow: number;
}

export function gridCardsStyle(max: MaxSize) {
  return css({
    display: 'grid',
    gridTemplateColumns: `repeat(${max.maxColumn}, minmax(min-content, 1fr))`,
    justifyContent: 'strech',
    alignContent: 'stretch',
    justifyItems: 'stretch',
    alignItems: 'stretch',
  });
}

// Display sub cards of a parent
export default function ContentSubs({
  cardContent,
  depth = 1,
  showEmptiness = false,
  className,
  subcardsContainerStyle,
}: ContentSubsProps): JSX.Element {
  const location = useLocation();
  const i18n = useTranslations();

  const subCards = useAndLoadSubCards(cardContent.id);

  const indexedSubCards = React.useMemo(() => {
    if (subCards != null) {
      const maxIndex = subCards.reduce<number>((acc, cur) => {
        return Math.max(acc, cur.index ?? 0);
      }, 1);

      const cards = subCards.map((card, index) => {
        const { row, column } = gridPosFromIndex(card.index || index + maxIndex);
        return {
          card: card,
          row: row,
          column: column,
        };
      });
      const max = cards.reduce<MaxSize>(
        (max, cur) => {
          max.maxColumn = Math.max(max.maxColumn, cur.column);
          max.maxRow = Math.max(max.maxRow, cur.row);
          return max;
        },
        { maxRow: 0, maxColumn: 0 },
      );

      return { subCardWithIndex: cards, max: max };
    }

    return { subCardWithIndex: [], max: { maxColumn: 1, maxRow: 1 } };
  }, [subCards]);

  if (subCards == null) {
    return <InlineLoading />;
  } else {
    if (subCards.length === 0 && showEmptiness) {
      return (
        <div className={voidStyle}>
          <p>{i18n.modules.card.infos.noCardYetPleaseCreate}</p>
          <CardCreator
            parentCardContent={cardContent}
            customButton={
              <Button icon={faPlus} clickable>
                {i18n.modules.card.infos.createFirstCard}
              </Button>
            }
            className={css({ display: 'block' })}
          />
        </div>
      );
    } else {
      return depth > 0 ? (
        <div
          className={cx(
            flexWrap,
            css({ flexDirection: 'column', alignItems: 'stretch', flexGrow: 1 }),
            className,
          )}
        >
          <div className={cx(gridCardsStyle(indexedSubCards.max), subcardsContainerStyle)}>
            {indexedSubCards.subCardWithIndex.map(({ card, row, column }) => (
              <CardThumbWithSelector
                className={css({
                  gridColumn: column,
                  gridRow: row,
                })}
                depth={depth - 1}
                key={card.id}
                card={card}
              />
            ))}
          </div>
          <Flex justify="center">
            <CardCreator
              parentCardContent={cardContent}
              customButton={
                depth === depthMax ? (
                  location.pathname.match(/card\/\d+\/v\/\d+/) ? undefined : (
                    <Button icon={faPlus} className={fixedButtonStyle} clickable>
                      {i18n.modules.card.createCard}
                    </Button>
                  )
                ) : undefined
              }
            />
          </Flex>
        </div>
      ) : (
        <Ellipsis
          items={subCards}
          alignEllipsis='flex-end'
          itemComp={sub => <TinyCard key={sub.id} card={sub} />}
        />
      );
    }
  }
}
