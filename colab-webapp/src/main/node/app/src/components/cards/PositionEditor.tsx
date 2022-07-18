/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Form from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import { space_L, space_S } from '../styling/style';

// TODO : affiner tips
// TODO : do something against not number input

interface PositionEditorProps {
  card: Card;
}

export default function PositionEditor({ card }: PositionEditorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (
    <Form
      fields={[
        {
          key: 'index',
          label: 'Position index',
          placeholder: '0',
          type: 'text',
          isMandatory: false,
          tip: (
            <Flex direction="row">
              <Flex grow={1} className={css({ padding: space_S })}>
                <p>The indexes are determined as follows</p>
              </Flex>
              <Flex direction="column" className={css({ padding: space_S })}>
                <Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    1
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    2
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    3
                  </Flex>
                </Flex>
                <Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    4
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    5
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    6
                  </Flex>
                </Flex>
                <Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    7
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    8
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    9
                  </Flex>
                </Flex>
                <Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    10
                  </Flex>
                  <Flex
                    align="center"
                    justify="center"
                    className={css({ border: '1px solid black', width: space_L, height: space_L })}
                  >
                    ...
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          ),
        },
      ]}
      value={{ index: card.index == 0 ? undefined : card.index }}
      onSubmit={fields => {
        if (card && card.id && fields.index != null && fields.index > 0) {
          dispatch(API.changeCardIndex({ cardId: card.id, newIndex: fields.index }));
          navigate('../');
        }
      }}
    />
  );
}
