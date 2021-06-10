/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { css } from '@emotion/css';
import { useAppDispatch } from '../../../store/hooks';
import { CardType } from 'colab-rest-client';
import AutoSaveInput from '../../common/AutoSaveInput';
import { cardShadow } from '../../styling/style';
import IconButton from '../../common/IconButton';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';

interface DisplayProps {
  cardType: CardType;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
  background: 'white',
  boxShadow: cardShadow,
});

export default function CardTypeEditor({ cardType }: DisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div className={style}>
      <AutoSaveInput
        label="Title: "
        placeholder=""
        inputType="INPUT"
        value={cardType.title || ''}
        onChange={newValue => dispatch(API.updateCardType({ ...cardType, title: newValue }))}
      />
      <AutoSaveInput
        label="Purpose: "
        placeholder=""
        inputType="TEXTAREA"
        value={cardType.purpose || ''}
        onChange={newValue => dispatch(API.updateCardType({ ...cardType, purpose: newValue }))}
      />
      <IconButton
        icon={cardType.deprecated ? faCheckSquare : faSquare}
        onClick={() =>
          dispatch(API.updateCardType({ ...cardType, deprecated: !cardType.deprecated }))
        }
      >
        Deprecated
      </IconButton>
      <IconButton
        icon={cardType.published ? faCheckSquare : faSquare}
        onClick={() =>
          dispatch(API.updateCardType({ ...cardType, published: !cardType.published }))
        }
      >
        Published
      </IconButton>
    </div>
  );
}
