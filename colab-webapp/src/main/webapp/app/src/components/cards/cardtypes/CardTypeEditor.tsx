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

export default function CardTypeEditor({ cardType }: DisplayProps) {
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
    </div>
  );
}
