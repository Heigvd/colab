/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCaretLeft, faCaretRight, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import IconButton from '../common/IconButton';
import WithToolbar from '../common/WithToolbar';

interface Props {
  card: Card;
  children: (variant: CardContent | undefined, list: CardContent[]) => JSX.Element;
}

const computeNav = (contents: CardContent[] | null | undefined, currentId: number | undefined) => {
  if (contents && contents.length) {
    const index = contents.findIndex(cc => cc.id == currentId);
    const effectiveIndex = index >= 0 ? index : 0;
    const next = (effectiveIndex + 1) % contents.length;
    // "(x + length -1 )% length" not (x-1) & length to avoid negative indexes
    const previous = (effectiveIndex + contents.length - 1) % contents.length;
    return {
      current: contents[effectiveIndex]!,
      previous: contents[previous]!,
      next: contents[next]!,
    };
  } else {
    return null;
  }
};

export default function VariantSelector({ card, children }: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const [displayedVariantId, setDisplayedVariantId] = React.useState<number | undefined>();

  const contents = useAppSelector(state => {
    if (card.id && state.cards.cards[card.id]) {
      const cardState = state.cards.cards[card.id]!;
      if (cardState.contents == null) {
        return cardState.contents;
      } else {
        const contentState = state.cards.contents;
        return cardState.contents.flatMap(contentId => {
          const content = contentState[contentId];
          return content && content.content ? [content.content] : [];
        });
      }
    } else {
      return null;
    }
  }, shallowEqual);

  React.useEffect(() => {
    if (contents === undefined && card.id != null) {
      dispatch(API.getCardContents(card.id));
    }
  }, [contents, card.id, dispatch]);

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const cardId = card.id;
    const variantPager = computeNav(contents, displayedVariantId);

    return (
      <div
        className={css({
          margin: '10px',
          flexGrow: 1,
          display: 'flex',
          //          alignItems: 'center',
          '& > div': {
            flexGrow: 1,
          },
        })}
      >
        {variantPager != null && variantPager.previous != variantPager.current ? (
          <IconButton
            icon={faCaretLeft}
            iconSize="2x"
            title={variantPager.previous.title || ''}
            onClick={() => {
              if (variantPager.previous.id) {
                setDisplayedVariantId(variantPager.previous.id);
              }
            }}
          />
        ) : null}

        <WithToolbar
          toolbarPosition="TOP_RIGHT"
          //          offsetX={-1}
          toolbar={
            <IconButton
              icon={faWindowRestore}
              title="Create new variant"
              onClick={() => {
                dispatch(API.createCardContentVariant(cardId)).then(payload => {
                  // TODO select and display new content
                  if (payload.meta.requestStatus === 'fulfilled') {
                    if (entityIs(payload.payload, 'CardContent')) {
                      setDisplayedVariantId(payload.payload.id || undefined);
                    }
                  }
                });
              }}
            />
          }
        >
          {children(variantPager?.current, contents || [])}
        </WithToolbar>

        {variantPager != null && variantPager.next != variantPager.current ? (
          <IconButton
            icon={faCaretRight}
            iconSize="2x"
            title={variantPager.next.title || ''}
            onClick={() => {
              if (variantPager.next.id) {
                setDisplayedVariantId(variantPager.next.id);
              }
            }}
          />
        ) : null}
      </div>
    );
  }
}
