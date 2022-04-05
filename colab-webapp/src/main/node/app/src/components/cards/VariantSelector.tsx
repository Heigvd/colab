/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVariantsOrLoad } from '../../selectors/cardSelector';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
//import WithToolbar from '../common/WithToolbar';
import { useDefaultVariant } from '../projects/edition/Editor';
import { space_S } from '../styling/style';

interface Props {
  card: Card;
  children: (variant: CardContent | undefined, list: CardContent[]) => JSX.Element;
}

export const computeNav = (
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
            onClick={e => {
              e.stopPropagation();
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
            onClick={e => {
              e.stopPropagation();
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

export function VariantPager({ card, current }: PagerProps): JSX.Element {
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
    return (
      <Flex justify="center" className={css({ marginTop: space_S })}>
        <Flex basis="1px" grow={1} justify="center" className={css({ fontSize: '0.9em' })}>
          {variantPager != null && variantPager.previous != variantPager.current ? (
            <IconButton
              icon={faCaretLeft}
              iconSize="lg"
              title={variantPager.previous.title || ''}
              onClick={() => {
                if (variantPager.previous.id) {
                  goto(card, variantPager.previous);
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
              iconSize="lg"
              title={variantPager.next.title || ''}
              onClick={() => {
                if (variantPager.next.id) {
                  goto(card, variantPager.next);
                }
              }}
            />
          ) : null}
        </Flex>
      </Flex>
    );
  }
}
