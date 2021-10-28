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
import { useVariants } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import WithToolbar from '../common/WithToolbar';

interface Props {
  card: Card;
  children: (variant: CardContent | undefined, list: CardContent[]) => JSX.Element;
}

const computeNav = (
  contents: CardContent[] | null | undefined,
  currentId: number | null | undefined,
) => {
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
      index: index,
    };
  } else {
    return null;
  }
};

export default function VariantSelector({ card, children }: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const [displayedVariantId, setDisplayedVariantId] = React.useState<number | undefined>();

  const contents = useVariants(card);

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
                dispatch(API.createCardContentVariantWithBlockDoc(cardId)).then(payload => {
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

interface PagerProps {
  card: Card;
  onSelect: (variant: CardContent) => void;
}

export function VariantPager({ card, onSelect }: PagerProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [displayedVariant, setDisplayedVariant] = React.useState<CardContent | undefined>();

  const contents = useVariants(card);

  React.useEffect(() => {
    if (contents === undefined && card.id != null) {
      dispatch(API.getCardContents(card.id));
    }
  }, [contents, card.id, dispatch]);

  const variantPager = computeNav(contents, displayedVariant?.id);

  React.useEffect(() => {
    if (variantPager?.current != null && variantPager.current !== displayedVariant) {
      setDisplayedVariant(variantPager.current);
      onSelect(variantPager.current);
    }
  }, [variantPager, onSelect, displayedVariant]);

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const cardId = card.id;

    return (
      <Flex>
        {variantPager != null && variantPager.previous != variantPager.current ? (
          <IconButton
            icon={faCaretLeft}
            iconSize="2x"
            title={variantPager.previous.title || ''}
            onClick={() => {
              if (variantPager.previous.id) {
                setDisplayedVariant(variantPager.previous);
                onSelect(variantPager.previous);
              }
            }}
          />
        ) : null}

        {variantPager != null ? `${variantPager.index + 1} / ${contents?.length || 0}` : null}

        {variantPager != null && variantPager.next != variantPager.current ? (
          <IconButton
            icon={faCaretRight}
            iconSize="2x"
            title={variantPager.next.title || ''}
            onClick={() => {
              if (variantPager.next.id) {
                setDisplayedVariant(variantPager.next);
                onSelect(variantPager.next);
              }
            }}
          />
        ) : null}

        <IconButton
          icon={faWindowRestore}
          title="Create new variant"
          onClick={() => {
            dispatch(API.createCardContentVariantWithBlockDoc(cardId)).then(payload => {
              // TODO select and display new content
              if (payload.meta.requestStatus === 'fulfilled') {
                if (entityIs(payload.payload, 'CardContent')) {
                  setDisplayedVariant(payload.payload || undefined);
                }
              }
            });
          }}
        >
          Create a new variant
        </IconButton>
      </Flex>
    );
  }
}
