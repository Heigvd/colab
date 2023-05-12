/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip } from '@chakra-ui/react';
import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import { debounce } from 'lodash';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { space_sm } from '../../styling/style';
import { cardColors, cardProgressColors } from '../../styling/theme';

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

const progressBarStyle = css({
  height: '8px',
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
}: {
  card: Card;
  variant: CardContent | undefined;
}): JSX.Element {
  const fillColor = React.useMemo(() => {
    return fulfilledColor(card);
  }, [card]);

  const percent: number = variant?.completionLevel || 0;
  return (
    <div className={progressBarStyle}>
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
  const [showTooltip, setShowTooltip] = React.useState(false);

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
  const debouncedHandleMouseEnter = debounce(() => setShowTooltip(true), 300);

  const handlOnMouseLeave = () => {
    setShowTooltip(false);
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
      className={css({ height: '20px', padding: '0px !important' })}
    >
      <SliderTrack height={'20px'} bg={emptyColor}>
        <SliderFilledTrack className={css({ backgroundColor: fillColor, height: '100%' })} />
      </SliderTrack>
      <Tooltip
        hasArrow
        placement="top"
        color="white"
        bg={'var(--success-main)'}
        isOpen={showTooltip}
        label={`${value}%`}
        className={css({ padding: space_sm })}
      >
        <SliderThumb
          height="20px"
          width="20px"
          borderRadius={'50%'}
          className={css({
            backgroundColor: showTooltip ? 'var(--bg-primary)' : 'transparent',
            '&:focus-visible': { outline: 'none' },
          })}
        />
      </Tooltip>
    </Slider>
  );
}
