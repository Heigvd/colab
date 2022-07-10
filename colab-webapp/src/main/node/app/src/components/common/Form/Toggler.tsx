/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { errorStyle, space_S, successColor, textSmall, warningStyle } from '../../styling/style';
import Tips, { TipsProps } from '../element/Tips';
import Flex from '../layout/Flex';

const containerStyle = css({
  width: '28px',
  height: '16px',
  border: 'solid 1px #d7d7d7',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
});

const offStyle = css({
  position: 'absolute',
  width: '16px',
  height: '16px',
  padding: '0',
  margin: '0',
  top: '0',
  left: 0,
  border: 'none',
  background: '#666',
  borderRadius: '8px',
  successColor,
  boxSizing: 'border-box',
  transition: '.3s',
});

const onStyle = cx(
  offStyle,
  css({
    left: '12px',
    background: successColor,
  }),
);

interface TogglerProps {
  label?: React.ReactNode;
  value?: boolean;
  readOnly?: boolean;
  onChange: (newValue: boolean) => void;
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  bottomClassName?: string;
}

export default function Toggler({
  label,
  value,
  readOnly = false,
  onChange,
  tip,
  fieldFooter,
  warning,
  error,
  className,
  bottomClassName,
}: TogglerProps): JSX.Element {
  return (
    <Flex
      direction="column"
      align="normal"
      className={cx(css({ padding: space_S + ' 0' }), className)}
    >
      <Flex align="center" justify="flex-start">
        <Flex
          onClick={readOnly ? undefined : () => onChange(!value)}
          className={cx(containerStyle, className)}
        >
          <div className={value ? onStyle : offStyle}></div>
        </Flex>
        <div>&nbsp;{label}</div>
        {tip != null && <Tips>{tip}</Tips>}
      </Flex>
      {fieldFooter != null && <div className={textSmall}>{fieldFooter}</div>}
      <Flex direction="column" align="center" className={cx(textSmall, bottomClassName)}>
        {warning != null && <div className={warningStyle}>{warning}</div>}
        {error != null && <div className={errorStyle}>{error}</div>}
      </Flex>
    </Flex>
  );
}
