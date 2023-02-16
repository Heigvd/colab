/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import InlineLoading from '../element/InlineLoading';
import Flex from './Flex';

export default function Loading(): JSX.Element {
  return (
    <>
      <Flex
      justify='center'
      align='center'
        className={css({
          margin: 'auto',
          height: '100%',
          width: '100%',
        })}
      >
        <InlineLoading size="200px" />
      </Flex>
    </>
  );
}
