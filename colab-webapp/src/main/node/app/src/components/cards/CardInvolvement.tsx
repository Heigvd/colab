/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { Card, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/layout/Flex';
import Tips from '../common/Tips';
import { space_M } from '../styling/style';
import CardACL from './CardACL';
import InvolvementSelector from './InvolvementSelector';

interface Props {
  card: Card;
}

export default function CardInvolvement({ card }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const updateDefInvolvementLevel = React.useCallback(
    (value: InvolvementLevel | null) => {
      dispatch(API.updateCard({ ...card, defaultInvolvementLevel: value }));
    },
    [card, dispatch],
  );
  return (
    <>
      <Flex
        align="center"
        className={css({
          marginBottom: space_M,
          borderBottom: '1px solid var(--lightGray)',
          alignSelf: 'stretch',
        })}
      >
        <h2>General involvement</h2>
        <Tips>
          Add or select an involvement level for all members and roles. You can fine-tune it below
          by choosing indiviually a different level.
          <br />
          <br />
          When undefined, the involvement level is calculated based on parent(s) card(s), and then
          on your rights in the project.
        </Tips>
      </Flex>
      <InvolvementSelector
        self={card.defaultInvolvementLevel}
        onChange={updateDefInvolvementLevel}
      />
      <CardACL card={card} />
    </>
  );
}
