/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';
import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import { debounce } from 'lodash';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { cardColors, cardProgressColors } from '../../styling/theme';

const defaultEditionHeight = '20px';

const emptyColor = 'var(--gray-50)';

function fulfilledColor(card: Card) {
  switch (card.color?.toUpperCase()) {
    case cardColors.white:
      return `var(${cardProgressColors.white})`;
    case cardColors.yellow:
      return `var(${cardProgressColors.yellow})`;
    case cardColors.pink:
      return `var(${cardProgressColors.pink})`;
    case cardColors.blue:
      return `var(${cardProgressColors.blue})`;
    case cardColors.green:
      return `var(${cardProgressColors.green})`;
    case cardColors.gray:
    default:
      return `var(${cardProgressColors.gray})`;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// view

const progressBarStyle = (tall?: boolean) =>
  css({
    height: tall ? defaultEditionHeight : '8px',
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
  const [showChangePossible, setShowChangePossible] = React.useState(false);

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
  const debouncedHandleMouseEnter = debounce(() => setShowChangePossible(true), 300);

  const handlOnMouseLeave = () => {
    setShowChangePossible(false);
    debouncedHandleMouseEnter.cancel();
  };

  const fillColor = React.useMemo(() => {
    return fulfilledColor(card);
  }, [card]);

  return (
    <Slider
      id="slider"
      value={value}
      style={{ display: 'none' }}
      min={0}
      max={100}
      step={10}
      onChange={onInternalChange}
      onMouseEnter={debouncedHandleMouseEnter}
      onMouseLeave={handlOnMouseLeave}
      cursor="pointer"
      className={css({ height: defaultEditionHeight, padding: '0px !important' })}
    >
      <SliderTrack height={defaultEditionHeight} bg={emptyColor}>
        <SliderFilledTrack className={css({ backgroundColor: fillColor, height: '100%' })} />
      </SliderTrack>
      <SliderThumb
        height={defaultEditionHeight}
        width={defaultEditionHeight}
        borderRadius={'50%'}
        className={css({
          backgroundColor: showChangePossible ? 'var(--bg-primary)' : 'transparent',
          '&:focus-visible': { outline: 'none' },
        })}
      />
    </Slider>
  );
}
