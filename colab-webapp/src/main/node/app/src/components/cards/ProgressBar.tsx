/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import { debounce } from 'lodash';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { space_lg } from '../../styling/style';
import { cardColors, lightColor, vividColor } from '../../styling/theme';

const xTranslationOnLimits = '5px';

const emptyColor = 'var(--white)';

function fulfilledColor(card: Card) {
  switch (card.color?.toUpperCase()) {
    case cardColors.white:
      return `var(--green-200)`;
    case cardColors.yellow:
      return `var(${vividColor.yellow})`;
    case cardColors.orange:
      return `var(${vividColor.orange})`;
    case cardColors.pink:
      return `var(${vividColor.pink})`;
    case cardColors.purple:
      return `var(${vividColor.purple})`;
    case cardColors.blue:
      return `var(${vividColor.blue})`;
    case cardColors.green:
      return `var(${vividColor.green})`;
    case cardColors.gray:
    default:
      return `var(--green-200)`;
  }
}

function lightColorCard(card: Card) {
  switch (card.color?.toUpperCase()) {
    case cardColors.white:
      return `var(${lightColor.white})`;
    case cardColors.yellow:
      return `var(${lightColor.yellow})`;
    case cardColors.orange:
      return `var(${lightColor.orange})`;
    case cardColors.pink:
      return `var(${lightColor.pink})`;
    case cardColors.purple:
      return `var(${lightColor.purple})`;
    case cardColors.blue:
      return `var(${lightColor.blue})`;
    case cardColors.green:
      return `var(${lightColor.green})`;
    case cardColors.gray:
    default:
      return `var(${lightColor.gray})`;
  }
}

function sliderThumbStyle(value: number, card: Card) {
  const fulffiledColor = fulfilledColor(card);
  return cx(
    css({
      backgroundColor: lightColorCard(card),
      '&:focus-visible': { outline: 'none' },
      boxShadow: `0 0 0 2px ${fulffiledColor}`,
    }),
    {
      [css({
        transform: `translateX(${xTranslationOnLimits})`,
      })]: value === 0,
    },
    {
      [css({
        transform: `translateX(-${xTranslationOnLimits})`,
      })]: value === 100,
    },
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// view

const progressBarStyle = (size: string) =>
  css({
    height: size,
    backgroundColor: emptyColor,
    width: '100%',
  });

const progressBarFulfilledStyle = (percentage: number, color: string) =>
  css({
    width: `${percentage}%`,
    height: 'inherit',
    backgroundColor: color,
  });

export function ProgressBar({
  card,
  variant,
  size = space_lg,
}: {
  card: Card;
  variant: CardContent | undefined;
  size?: string;
}): JSX.Element {
  const fillColor = React.useMemo(() => {
    return fulfilledColor(card);
  }, [card]);

  const percent: number = variant?.completionLevel || 0;
  return (
    <div className={progressBarStyle(size)}>
      <div className={progressBarFulfilledStyle(percent, fillColor)}> </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// edit

interface ProgressBarEditorProps {
  card: Card;
  variant: CardContent;
  readOnly?: boolean;
  size?: string;
}

export function ProgressBarEditor({
  card,
  variant,
  readOnly = false,
  size = space_lg,
}: ProgressBarEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    setValue(variant.completionLevel ?? 0);
  }, [variant]);

  const debouncedOnChange = React.useMemo(() => {
    return debounce((value: number) => {
      dispatch(
        API.updateCardContent({
          ...variant,
          completionLevel: value,
        }),
      );
    }, 150);
  }, [dispatch, variant]);

  const onInternalChange = React.useCallback(
    (v: number) => {
      const nValue = +v;
      if (!Number.isNaN(nValue)) {
        setValue(nValue);
        debouncedOnChange(nValue);
      }
    },
    [debouncedOnChange],
  );

  const fillColor = React.useMemo(() => {
    return fulfilledColor(card);
  }, [card]);

  /* FIXME Jess : est-ce la manière propre de mettre un poil de couleur à gauche de la barre quand elle est vide? */
  return (
    <Slider
      id="slider"
      value={value + 1}
      style={{ display: 'none' }}
      min={0}
      max={100}
      step={10}
      onChange={onInternalChange}
      cursor="pointer"
      isReadOnly={readOnly}
      className={css({
        height: size,
        padding: '0px !important',
        border: ` 1px solid ${fillColor}`,
      })}
    >
      <SliderTrack height={size} bg={emptyColor}>
        <SliderFilledTrack
          className={css({
            backgroundColor: fillColor,
            height: '100%',
          })}
        />
      </SliderTrack>
      <SliderThumb
        height={size}
        width={size}
        borderRadius={'50%'}
        className={!readOnly ? sliderThumbStyle(value, card) : undefined}
      />
    </Slider>
  );
}
