/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faPalette, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenClose from '../common/OpenClose';
import { cancelIcon } from '../styling/defaultIcons';
import CardACL from './CardACL';
import InvolvementSelector from './InvolvementSelector';

interface Props {
  card: Card;
  onClose: () => void;
}

export default function CardSettings({ card, onClose }: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const updateDefInvolvementLevel = React.useCallback(
    (value: InvolvementLevel | null) => {
      dispatch(API.updateCard({ ...card, defaultInvolvementLevel: value }));
    },
    [card, dispatch],
  );

  return (
    <Flex direction="column" shrink={1}>
      <Flex>
        <h5>Settings</h5>
        <IconButton icon={cancelIcon} onClick={onClose} />
      </Flex>
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

      <OpenClose
        closeIcon={faCheck}
        collapsedChildren={
          <span>
            <FontAwesomeIcon icon={faPalette} />
          </span>
        }
      >
        {() => (
          <TwitterPicker
            colors={['#EDD3EC', '#EAC2C2', '#CCEFD4', '#E1F2F9', '#F9F5D6', '#F6F1F1']}
            color={card.color || 'white'}
            triangle="hide"
            onChangeComplete={newColor => {
              dispatch(API.updateCard({ ...card, color: newColor.hex }));
            }}
          />
        )}
      </OpenClose>
    </Flex>
  );
}
