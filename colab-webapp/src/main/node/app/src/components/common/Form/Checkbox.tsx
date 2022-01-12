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
import { errorStyle, space_S, warningStyle } from '../../styling/style';
import Flex from '../Flex';

export interface Props {
  label?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  title?: string;
  disabled?: boolean;
  value?: boolean;
  onChange: (newValue: boolean) => void;
  className?: string;
  containerClassName?: string;
}

const disabledStyle = css({
  color: 'var(--disabledFgColor)',
});
const enabledStyle = css({ cursor: 'pointer' });

export default function Checkbox({
  label,
  warning,
  error,
  title,
  disabled = false,
  value,
  onChange,
  containerClassName,
  className,
}: Props): JSX.Element {
  return (
    <Flex className={containerClassName} direction="column">
      <Flex justify="space-between">
        {warning ? <div className={warningStyle}>{warning}</div> : null}
        {error ? <div className={errorStyle}>{error}</div> : null}
      </Flex>
      <Flex
        className={disabled ? disabledStyle : enabledStyle}
        justify="flex-start"
        onClick={disabled ? undefined : () => onChange(!value)}
      >
        <FontAwesomeIcon title={title} icon={value ? faCheckSquare : faSquare} className={cx(css({marginRight: space_S}), className)}/>
        {label}
      </Flex>
    </Flex>
  );
}
