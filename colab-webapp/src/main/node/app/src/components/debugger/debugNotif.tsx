/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addNotification } from '../../store/slice/notificationSlice';
import { text_sm } from '../../styling/style';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';

export default function DebugNotif(): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <Flex direction="row">
      <Button
        onClick={() =>
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'ERROR',
              message: 'Oh an error',
            }),
          )
        }
        className={cx(text_sm, css({ margin: '5px' }))}
      >
        show error
      </Button>
      <Button
        onClick={() =>
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: 'ah a warning',
            }),
          )
        }
        className={cx(text_sm, css({ margin: '5px' }))}
      >
        show warning
      </Button>
      <Button
        onClick={() =>
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'INFO',
              message: 'hey an information',
            }),
          )
        }
        className={cx(text_sm, css({ margin: '5px' }))}
      >
        show info
      </Button>
    </Flex>
  );
}
