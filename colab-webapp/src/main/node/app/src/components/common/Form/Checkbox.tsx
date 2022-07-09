/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { errorStyle, space_S, textSmall, warningStyle } from '../../styling/style';
import Flex from '../Flex';
import Tips, { TipsProps } from '../Tips';

const disabledStyle = css({
  color: 'var(--disabledFgColor)',
});
const enabledStyle = css({ cursor: 'pointer' });

interface CheckboxProps {
  label?: React.ReactNode;
  value?: boolean;
  readOnly?: boolean;
  onChange: (newValue: boolean) => void;
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

export default function Checkbox({
  label,
  value,
  readOnly = false,
  onChange,
  tip,
  fieldFooter,
  warning,
  error,
  className,
}: CheckboxProps): JSX.Element {
  return (
    <Flex
      direction="column"
      align="normal"
      className={cx(css({ padding: space_S + ' 0' }), className)}
    >
      <Flex align="center" justify="flex-start">
        <Flex
          onClick={readOnly ? undefined : () => onChange(!value)}
          className={readOnly ? disabledStyle : enabledStyle}
        >
          <FontAwesomeIcon
            icon={value ? faCheckSquare : faSquare}
            className={css({ marginRight: space_S })}
          />
          {label}
        </Flex>
        {tip != null && <Tips>{tip}</Tips>}
      </Flex>
      {fieldFooter != null && <div className={cx(textSmall)}>{fieldFooter}</div>}
      {warning != null && <div className={cx(textSmall, warningStyle)}>{warning}</div>}
      {error != null && <div className={cx(textSmall, errorStyle)}>{error}</div>}
    </Flex>
  );
}
