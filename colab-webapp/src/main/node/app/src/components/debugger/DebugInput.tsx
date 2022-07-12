/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Button from '../common/element/Button';
import { BlockInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import { space_M, textSmall } from '../styling/style';

export default function DebugInput(): JSX.Element {
  const [mandatory, setMandatory] = React.useState<boolean>(false);
  const [readOnly, setReadOnly] = React.useState<boolean>(false);

  return (
    <Flex direction="row">
      <Flex direction="column">
        <BlockInput
          label="input text"
          placeholder="i t"
          mandatory={mandatory}
          readOnly={readOnly}
          onChange={() => {}}
          tip="a wonderful advice"
          fieldFooter="and if I would like to add something"
          warning="ah a warning"
          error="oh an error"
        />
        <BlockInput
          label="text area"
          placeholder="t a"
          inputType="textarea"
          mandatory={mandatory}
          readOnly={readOnly}
          autoFocus
          //rows={5}
          onChange={() => {}}
          tip="a wonderful advice"
          fieldFooter="and if I would like to add something"
          warning="ah a warning"
          error="oh an error"
        />
        <BlockInput
          label="input number"
          placeholder="i n"
          type="number"
          mandatory={mandatory}
          readOnly={readOnly}
          min="0"
          max="5"
          onChange={() => {}}
          tip="a wonderful advice"
          fieldFooter="and if I would like to add something"
          warning="ah a warning"
          error="oh an error"
        />
      </Flex>
      <Flex direction="column" className={css({ padding: space_M })}>
        <h4>each field</h4>
        <Button
          title="mandatory"
          onClick={() => {
            setMandatory(!mandatory);
          }}
          className={cx(textSmall, css({ margin: '5px' }))}
        >
          mandatory = {mandatory ? 'true' : 'false'}
        </Button>
        <Button
          title="readOnly"
          onClick={() => {
            setReadOnly(!readOnly);
          }}
          className={cx(textSmall, css({ margin: '5px' }))}
        >
          readOnly = {readOnly ? 'true' : 'false'}
        </Button>
      </Flex>
    </Flex>
  );
}
