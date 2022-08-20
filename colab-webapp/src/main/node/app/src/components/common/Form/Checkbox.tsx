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
import Tips, { TipsProps } from '../element/Tips';
import Flex from '../layout/Flex';

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
      {footer != null && <div className={textSmall}>{footer}</div>}
      <Flex direction="column" align="center" className={cx(textSmall, bottomClassName)}>
        {warningMessage != null && <div className={warningStyle}>{warningMessage}</div>}
        {errorMessage != null && <div className={errorStyle}>{errorMessage}</div>}
      </Flex>
    </Flex>
  );
}
