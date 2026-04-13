/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useDefaultVariant, useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { disabledStyle, p_xs, space_sm, text_xs } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

interface VariantSelectorProps {
  card: Card;
  className?: string;
  children: (variant: CardContent | undefined, list: CardContent[]) => JSX.Element;
  depth?: number;
  withNav?: boolean;
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
  p_xs,
  css({
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    alignItems: 'center',
    zIndex: 1,
    color: 'var(--transparent)',
  }),
);

const invisible = cx(
  arrowStyle,
  css({
    visibility: 'hidden',
  }),
);

const variantSelectorStyle = (depth?: number) => {
  switch (depth) {
    case 0:
      return css({
        margin: space_sm,
      });
    case 1:
      return css({
        margin: space_sm,
      });
    default:
      return undefined;
  }
};

export default function VariantSelector({
  card,
  className,
  children,
  depth,
  withNav = true,
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
    const variantPager = computeNav(contents, displayedVariantId || defaultVariant.id);

    return (
      <div
        className={cx(
          css({
            display: 'flex',
            flexGrow: 1,
            position: 'relative',
            '& > div': {
              flexGrow: 1,
            },
            '&:hover > .VariantPagerArrow': {
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            },
            '&:hover > .VariantPagerArrow:active': {
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            },
            overflow: 'hidden',
          }),
          variantSelectorStyle(depth),
          className,
        )}
      >
        {withNav && (
          <Flex
            align="center"
            className={cx(
              variantPager != null && variantPager.next != variantPager.current
                ? arrowStyle
                : invisible,
              css({
                left: 0,
              }),
            )}
            onClick={e => {
              e.stopPropagation();
              if (variantPager?.previous.id) {
                setDisplayedVariantId(variantPager.previous.id);
              }
            }}
          >
            <Icon icon={'chevron_left'} title={variantPager?.previous.title || ''} />
          </Flex>
        )}
        {children(variantPager?.current, contents || [])}
        {withNav && (
          <Flex
            align="center"
            className={cx(
              variantPager != null && variantPager.next != variantPager.current
                ? arrowStyle
                : invisible,
              css({
                right: 0,
              }),
            )}
            onClick={e => {
              e.stopPropagation();
              if (variantPager?.next.id) {
                setDisplayedVariantId(variantPager.next.id);
              }
            }}
          >
            <Icon icon={'chevron_right'} title={variantPager?.next.title || ''} />
          </Flex>
        )}
      </div>
    );
  }
}

interface PagerProps {
  card: Card;
  current: CardContent;
  //onSelect: (variant: CardContent) => void;
}

export function VariantPager({ card, current }: PagerProps): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();

  const contents = useVariantsOrLoad(card);

  const variantPager = computeNav(contents, current.id);

  const goto = React.useCallback(
    (card: Card, variant: CardContent) => {
      navigate(`../card/${card.id}/v/${variant.id}`);
    },
    [navigate],
  );

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else if (variantPager === null || variantPager.length === 1) {
    return <></>;
  }
  {
    return (
      <Flex justify="center">
        <Flex grow={1} justify="center" align="center" className={cx(text_xs, disabledStyle)}>
          {variantPager != null && variantPager.previous != variantPager.current ? (
            <IconButton
              icon={'chevron_left'}
              iconSize="xs"
              title={variantPager.previous.title || ''}
              onClick={() => {
                if (variantPager.previous.id) {
                  goto(card, variantPager.previous);
                }
              }}
              className={p_xs}
            />
          ) : null}

          <p>
            {variantPager != null && variantPager.length > 1
              ? `${variantPager.index + 1} / ${contents?.length || 0}`
              : null}
          </p>

          {variantPager != null && variantPager.next != variantPager.current ? (
            <IconButton
              icon={'chevron_right'}
              iconSize="xs"
              title={variantPager.next.title || ''}
              onClick={() => {
                if (variantPager.next.id) {
                  goto(card, variantPager.next);
                }
              }}
              className={p_xs}
            />
          ) : null}
        </Flex>
      </Flex>
    );
  }
}
