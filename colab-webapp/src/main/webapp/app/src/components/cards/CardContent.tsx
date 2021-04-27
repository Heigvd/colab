/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import {CardContent} from 'colab-rest-client';
import {css} from '@emotion/css';
import AutoSaveInput from '../common/AutoSaveInput';
import {useAppDispatch} from '../../store/hooks';

interface Props {
  cardContent: CardContent;
}

// Display one card content
export default ({cardContent}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  return (
    <div
      className={css({
        margin: '20px',
        width: 'max-content',
        border: `1px solid grey`,
        borderRadius: '20px',
        padding: '10px',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: '1px solid grey',
        })}
      >
        <span className={css({})}>CardContent #{cardContent.id}</span>
        <AutoSaveInput
          inputType="INPUT"
          value={cardContent.title || ''}
          onChange={newValue => dispatch(API.updateCardContent({...cardContent, title: newValue}))}
        />
      </div>
      <div
        className={css({
          margin: '10px',
        })}
      >
        <i>card content does not have any content yet</i>
      </div>
    </div>
  );
};
