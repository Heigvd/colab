/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faEraser, faPen } from '@fortawesome/free-solid-svg-icons';
import { InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import Flex from '../common/FlexRow';
import IconButton from '../common/IconButton';

function prettyPrint(level: InvolvementLevel) {
  switch (level) {
    case 'RESPONSIBLE':
      return 'Responsible';
    case 'ACCOUNTABLE':
      return 'Approver';
    case 'CONSULTED_READWRITE':
      return 'Consulted';
    case 'CONSULTED_READONLY':
      return 'Consulted (read-only)';
    case 'INFORMED_READWRITE':
      return 'Informed';
    case 'INFORMED_READONLY':
      return 'Informed (read-only)';
    case 'OUT_OF_THE_LOOP':
      return 'Access denied';
  }
}

function buildOption(level: InvolvementLevel) {
  return {
    value: level,
    label: prettyPrint(level),
  };
}

const options = [
  buildOption('RESPONSIBLE'),
  buildOption('ACCOUNTABLE'),
  buildOption('CONSULTED_READWRITE'),
  buildOption('CONSULTED_READONLY'),
  buildOption('INFORMED_READWRITE'),
  buildOption('INFORMED_READONLY'),
  buildOption('OUT_OF_THE_LOOP'),
];

export default function InvolvemenetSelector({
  self,
  effectives,
  onChange,
}: {
  self: InvolvementLevel | null | undefined;
  effectives?: InvolvementLevel[];
  onChange: (value: InvolvementLevel | null) => void;
}): JSX.Element {
  const onChangeCb = React.useCallback(
    (option: { value: InvolvementLevel } | null) => {
      if (option != null) {
        onChange(option.value);
      } else {
        onChange(null);
      }
    },
    [onChange],
  );

  const createCb = React.useCallback(() => {
    onChange('INFORMED_READWRITE');
  }, [onChange]);

  const clearCb = React.useCallback(() => {
    onChange(null);
  }, [onChange]);

  if (self != null) {
    return (
      <Flex>
        <Select
          className={css({ minWidth: '240px' })}
          options={options}
          value={buildOption(self)}
          onChange={onChangeCb}
        />
        <IconButton icon={faEraser} onClick={clearCb} />
      </Flex>
    );
  } else {
    const creator = <IconButton icon={faPen} onClick={createCb} />;
    if (effectives != null && effectives.length > 0) {
      return (
        <Flex>
          {effectives.map(e => prettyPrint(e))}
          {creator}
        </Flex>
      );
    } else {
      return <Flex>"n/a" {creator}</Flex>;
    }
  }
}
