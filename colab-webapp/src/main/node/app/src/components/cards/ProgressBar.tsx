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
import { cardColors, lightColor, vividColor } from '../../styling/theme';

const xTranslationOnLimits = '5px';
const defaultEditionHeight = '20px';

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

const progressBarStyle = (tall?: boolean) =>
  css({
    height: tall ? defaultEditionHeight : '16px',
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
  tall,
}: {
  card: Card;
  variant: CardContent | undefined;
  tall?: boolean;
}): JSX.Element {
  const fillColor = React.useMemo(() => {
    return fulfilledColor(card);
  }, [card]);

  const percent: number = variant?.completionLevel || 0;
  return (
    <div className={progressBarStyle(tall)}>
      <div className={progressBarFulfilledStyle(percent, fillColor)}> </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// edit

interface ProgressBarEditorProps {
  card: Card;
  variant: CardContent;
}

export function ProgressBarEditor({ card, variant }: ProgressBarEditorProps): JSX.Element {
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

  return (
    <Slider
      id="slider"
      value={
        value + 1
      } /*est-ce la manière propre de mettre un poil de couleur à gauche de la barre quand elle est vide? */
      style={{ display: 'none' }}
      min={0}
      max={100}
      step={10}
      onChange={onInternalChange}
      cursor="pointer"
      className={css({
        height: defaultEditionHeight,
        padding: '0px !important',
        border: ` 1px solid ${fillColor}`,
      })}
    >
      <SliderTrack height={defaultEditionHeight} bg={emptyColor}>
        <SliderFilledTrack
          className={css({
            backgroundColor: fillColor,
            height: '100%',
          })}
        />
      </SliderTrack>
      <SliderThumb
        height={defaultEditionHeight}
        width={defaultEditionHeight}
        borderRadius={'50%'}
        className={sliderThumbStyle(value, card)}
      />
    </Slider>
  );
}
