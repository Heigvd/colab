/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  disabledStyle,
  errorTextStyle,
  space_sm,
  text_sm,
  warningTextStyle,
} from '../../styling/style';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';
import Tips, { TipsProps } from './Tips';

interface CheckboxProps {
  label?: React.ReactNode;
  value?: boolean;
  readOnly?: boolean;
  onChange: (newValue: boolean) => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warningMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
  bottomClassName?: string;
}

export default function Checkbox({
  label,
  value,
  readOnly = false,
  onChange,
  tip,
  footer,
  warningMessage,
  errorMessage,
  className,
  bottomClassName,
}: CheckboxProps): JSX.Element {
  return (
    <Flex
      direction="column"
      align="normal"
      className={cx(css({ padding: space_sm + ' 0' }), className, { [disabledStyle]: readOnly })}
    >
      <Flex align="center" justify="flex-start">
        <Flex align="center" onClick={readOnly ? undefined : () => onChange(!value)}>
          <Icon
            icon={value ? 'check_box' : 'check_box_outline_blank'}
            className={css({ marginRight: space_sm })}
          />
          {label}
        </Flex>
        {tip != null && <Tips>{tip}</Tips>}
      </Flex>
      {footer != null && <div className={text_sm}>{footer}</div>}
      <Flex direction="column" align="center" className={cx(text_sm, bottomClassName)}>
        {warningMessage != null && <div className={warningTextStyle}>{warningMessage}</div>}
        {errorMessage != null && <div className={errorTextStyle}>{errorMessage}</div>}
      </Flex>
    </Flex>
  );
}
