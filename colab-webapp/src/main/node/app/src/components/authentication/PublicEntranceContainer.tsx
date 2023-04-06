/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Logo from '../../styling/Logo';
import Flex from '../common/layout/Flex';
import Monkeys from '../debugger/monkey/Monkeys';

interface PublicEntranceContainerProps {
  children: React.ReactNode;
}

export default function PublicEntranceContainer({
  children,
}: PublicEntranceContainerProps): JSX.Element {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className={cx(
        css({
          height: '100vh',
        }),
      )}
    >
      <Flex align="center">
        <a
          onClick={() => window.open(`#/about-colab`, '_blank')}
          className={css({ '&:hover': { cursor: 'pointer' } })}
        >
          <Logo
            className={css({
              height: '110px',
              width: '200px',
              margin: '10px',
            })}
          />
        </a>
      </Flex>
      <Monkeys />
      <Flex
        direction="column"
        align="center"
        className={css({
          padding: '10px',
        })}
      >
        {children}
      </Flex>
    </Flex>
  );
}
