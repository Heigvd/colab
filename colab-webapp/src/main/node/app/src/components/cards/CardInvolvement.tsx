/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import OpenClose from '../common/OpenClose';
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
        <InvolvementSelector
          self={card.defaultInvolvementLevel}
          onChange={updateDefInvolvementLevel}
        />
        <OpenClose
          closeIcon={faCheck}
          collapsedChildren={
            <span>
              <FontAwesomeIcon icon={faUsers} />
            </span>
          }
        >
          {() => <CardACL card={card} />}
        </OpenClose>
      </>
    );
  }
