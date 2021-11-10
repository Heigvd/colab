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
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useVariantsOrLoad } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
//import WithToolbar from '../common/WithToolbar';
import { useDefaultVariant } from '../projects/edition/Editor';

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
      length: contents.length,
    };
  } else {
    return null;
  }
};

export default function VariantSelector({ card, children }: Props): JSX.Element {
  //  const dispatch = useAppDispatch();

  const [displayedVariantId, setDisplayedVariantId] = React.useState<number | undefined>();

  const contents = useVariantsOrLoad(card);

  const defaultVariant = useDefaultVariant(card.id!);

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else if (defaultVariant === 'LOADING') {
    return <InlineLoading />;
  } else {
    //    const cardId = card.id;
    const variantPager = computeNav(contents, displayedVariantId || defaultVariant.id);

    return (
      <div
        className={css({
          margin: '10px',
          //          flexGrow: 1,
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

        {children(variantPager?.current, contents || [])}

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
  current: CardContent;
  allowCreation: boolean;
  //onSelect: (variant: CardContent) => void;
}

export function VariantPager({ card, current, allowCreation }: PagerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const contents = useVariantsOrLoad(card);

  const variantPager = computeNav(contents, current.id);

  const goto = React.useCallback(
    (card: Card, variant: CardContent) => {
      navigate(`../edit/${card.id}/v/${variant.id}`);
    },
    [navigate],
  );

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    const cardId = card.id;

    return (
      <Flex justify="space-between">
        <Flex basis="1px" grow={1}>
          {/*space*/}
        </Flex>
        <Flex basis="1px" grow={1} justify="center">
          {variantPager != null && variantPager.previous != variantPager.current ? (
            <IconButton
              icon={faCaretLeft}
              iconSize="2x"
              title={variantPager.previous.title || ''}
              onClick={() => {
                if (variantPager.previous.id) {
                  goto(card, variantPager.previous);
                  //setDisplayedVariant(variantPager.previous);
                  //                onSelect(variantPager.previous);
                }
              }}
            />
          ) : null}

          {variantPager != null && variantPager.length > 1
            ? `${variantPager.index + 1} / ${contents?.length || 0}`
            : null}

          {variantPager != null && variantPager.next != variantPager.current ? (
            <IconButton
              icon={faCaretRight}
              iconSize="2x"
              title={variantPager.next.title || ''}
              onClick={() => {
                if (variantPager.next.id) {
                  goto(card, variantPager.next);
                  //setDisplayedVariant(variantPager.next);
                  //                onSelect(variantPager.next);
                }
              }}
            />
          ) : null}
        </Flex>
        <Flex basis="1px" grow={1} justify="flex-end">
          {allowCreation ? (
            <IconButton
              icon={faWindowRestore}
              title="Create new variant"
              onClick={() => {
                dispatch(API.createCardContentVariantWithBlockDoc(cardId)).then(payload => {
                  if (payload.meta.requestStatus === 'fulfilled') {
                    if (entityIs(payload.payload, 'CardContent')) {
                      goto(card, payload.payload);
                    }
                  }
                });
              }}
            >
              Create a new variant
            </IconButton>
          ) : null}
        </Flex>
      </Flex>
    );
  }
}
