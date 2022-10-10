/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useVariantsOrLoad } from '../../selectors/cardSelector';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { useDefaultVariant } from '../projects/edition/Editor';
import { space_S } from '../styling/style';

interface VariantSelectorProps {
  card: Card;
  className?: string;
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

const arrowStyle = cx(
  'VariantPagerArrow',
  css({
    alignSelf: 'center',
  }),
);

const invisible = cx(
  arrowStyle,
  css({
    visibility: 'hidden',
  }),
);

export default function VariantSelector({
  card,
  className,
  children,
}: VariantSelectorProps): JSX.Element {
  const [displayedVariantId, setDisplayedVariantId] = React.useState<number | undefined>();
  const i18n = useTranslations();
  const contents = useVariantsOrLoad(card);

  const defaultVariant = useDefaultVariant(card.id!);

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else if (defaultVariant === 'LOADING') {
    return <InlineLoading />;
  } else {
    //    const cardId = card.id;
    const variantPager = computeNav(contents, displayedVariantId || defaultVariant.id);

    return (
      <div
        className={cx(
          css({
            margin: '16px 0',
            display: 'flex',
            flexGrow: 1,
            minWidth: '120px',
            '& > div': {
              flexGrow: 1,
            },
            '&:hover > .VariantPagerArrow path': {
              color: 'grey',
            },
          }),
          className,
        )}
      >
        <IconButton
          className={
            variantPager != null && variantPager.previous != variantPager.current
              ? arrowStyle
              : invisible
          }
          icon={faCaretLeft}
          iconSize="2x"
          iconColor="lightgrey"
          title={variantPager?.previous.title || ''}
          onClick={e => {
            e.stopPropagation();
            if (variantPager?.previous.id) {
              setDisplayedVariantId(variantPager.previous.id);
            }
          }}
        />
        {children(variantPager?.current, contents || [])}

        <IconButton
          className={
            variantPager != null && variantPager.next != variantPager.current
              ? arrowStyle
              : invisible
          }
          icon={faCaretRight}
          iconSize="2x"
          iconColor="lightgrey"
          title={variantPager?.next.title || ''}
          onClick={e => {
            e.stopPropagation();
            if (variantPager?.next.id) {
              setDisplayedVariantId(variantPager.next.id);
            }
          }}
        />
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
  const i18n = useTranslations();
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
    return <i>{i18n.modules.card.error.withoutId}</i>;
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
