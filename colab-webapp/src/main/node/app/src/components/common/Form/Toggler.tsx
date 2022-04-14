/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { errorStyle, space_S, successColor, warningStyle } from '../../styling/style';
import Flex from '../Flex';
import Tips, { TipsProps } from '../Tips';

export interface Props {
  label?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  title?: string;
  value?: boolean;
  onChange: (newValue: boolean) => void;
  tip?: TipsProps['children'];
  className?: string;
  disabled?: boolean;
}

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

export default function Toggler({
  label,
  warning,
  error,
  title,
  value,
  onChange,
  tip,
  className,
  disabled = false,
}: Props): JSX.Element {
  return (
    <Flex className={cx(css({ padding: space_S + ' 0' }), className)} direction="column">
      <Flex justify="space-between">
        {warning ? <div className={warningStyle}>{warning}</div> : null}
        {error ? <div className={errorStyle}>{error}</div> : null}
      </Flex>
      <Flex justify="space-between">
        <div
          title={title}
          onClick={disabled ? undefined : () => onChange(!value)}
          className={cx(containerStyle, className)}
        >
          <div className={value ? onStyle : offStyle}></div>
        </div>
        <div>&nbsp;{label}</div>
        <div>{tip && <Tips>{tip}</Tips>}</div>
      </Flex>
    </Flex>
  );
}
