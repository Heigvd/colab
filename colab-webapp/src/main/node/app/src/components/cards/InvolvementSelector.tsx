/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import useTranslations from '../../i18n/I18nContext';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';

const DEFAULT_RIGHT = 'INFORMED_READWRITE';
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

function buildOption(level?: InvolvementLevel) {
  return {
    value: level ? level : DEFAULT_RIGHT,
    label: level ? prettyPrint(level) : prettyPrint(DEFAULT_RIGHT),
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

export default function InvolvementSelector({
  self,
  effectives,
  onChange,
}: {
  self: InvolvementLevel | null | undefined;
  effectives?: InvolvementLevel[];
  onChange: (value: InvolvementLevel | null) => void;
}): JSX.Element {
  const i18n = useTranslations();
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

  const clearCb = React.useCallback(() => {
    onChange(null);
  }, [onChange]);

  /* if (self != null) {
    return (
      <Flex align="center">
        <Select
          className={css({ minWidth: '240px' })}
          options={options}
          value={buildOption(self)}
          onChange={onChangeCb}
        />
        <IconButton icon={faEraser} title="Clear" onClick={clearCb} />
      </Flex>
    );
  } else {
    const creator = (
      <IconButton
        icon={'edit'}
        title="Edit inv. level"
        onClick={createCb}
        className={lightIconButtonStyle}
      />
    );
    if (effectives != null && effectives.length > 0) {
      return (
        <Flex>
          <Flex align="center">{effectives.map(e => prettyPrint(e))}</Flex>
          {creator}
        </Flex>
      );
    } else {
      return (
        <Flex align="center">
          <p className={cx(lightItalicText, textSmall)}>Undefined</p>
          {creator}
        </Flex>
      );
    }
  } */
  return (
    <Flex align="center">
      {self == null && effectives != null && effectives.length > 0 ? (
        <Flex align="center">
          {effectives.map(e => (
            <Select
              key={e}
              className={css({ minWidth: '240px' })}
              options={options}
              value={buildOption(e)}
              onChange={onChangeCb}
            />
          ))}
        </Flex>
      ) : (
        <>
          <Select
            className={css({ minWidth: '240px' })}
            options={options}
            value={self != null ? buildOption(self) : null}
            onChange={onChangeCb}
          />
          {self != null && (
            <IconButton icon={'history'} title={i18n.team.resetInvolvement} onClick={clearCb} />
          )}
        </>
      )}
    </Flex>
  );
}

{/* <Select
            className={css({ minWidth: '240px' })}
            options={options}
            value={self != null ? buildOption(self) : null}
            onChange={onChangeCb}
          /> */}
          {/* {self != null && (
            <IconButton icon={'history'} title={i18n.team.resetInvolvement} onClick={clearCb} />
          )} */}