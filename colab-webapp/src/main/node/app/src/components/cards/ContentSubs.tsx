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
import { changeCardPosition } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';
import { FeaturePreview } from '../common/element/Tips';
import Toggler from '../common/element/Toggler';
import Ellipsis from '../common/layout/Ellipsis';
import Flex from '../common/layout/Flex';
import GridOrganizer, { fixGrid } from '../debugger/GridOrganizer';
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
  mayOrganize?: boolean;
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

export function gridCardsStyle(nbColumn: number) {
  return css({
    display: 'grid',
    gridTemplateColumns: `repeat(${nbColumn}, minmax(min-content, 1fr))`,
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
  mayOrganize = false,
}: ContentSubsProps): JSX.Element {
  const location = useLocation();
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const [organize, setOrganize] = React.useState(false);

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

    return { cells: [], nbColumns: 1 };
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
          {mayOrganize && (
            <FeaturePreview>
              <Toggler
                className={css({ alignSelf: 'flex-end' })}
                label={i18n.modules.card.positioning.toggleText}
                value={organize}
                onChange={setOrganize}
              />
            </FeaturePreview>
          )}
          {organize ? (
            <GridOrganizer
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
                  />
                );
              }}
            />
          ) : (
            <>
              <div
                className={cx(gridCardsStyle(indexedSubCards.nbColumns), subcardsContainerStyle)}
              >
                {indexedSubCards.cells.map(({ payload, y, x, width, height }) => (
                  <CardThumbWithSelector
                    className={css({
                      gridColumnStart: x,
                      gridColumnEnd: x + width,
                      gridRowStart: y,
                      gridRowEnd: y + height,
                      maxHeight: '100%',
                    })}
                    depth={depth - 1}
                    key={payload.id}
                    card={payload}
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
