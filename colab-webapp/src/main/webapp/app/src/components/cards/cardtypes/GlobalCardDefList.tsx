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
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useCardTypes } from '../../../selectors/cardTypeSelector';
import InlineLoading from '../../common/InlineLoading';
import IconButton from '../../common/IconButton';
import CardTypeEditor from './CardTypeEditor';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export interface Props {}

export default ({}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const cardTypes = useCardTypes();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardType({
        '@class': 'CardType',
        projectId: null,
      }),
    );
  }, [dispatch]);

  if (cardTypes.status === 'UNSET') {
    dispatch(API.getAllGlobalCardTypes());
  }

  if (cardTypes.status !== 'READY') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <h3>Global Card Types</h3>
        <IconButton onClick={createNewCb} icon={faPlus} />
        <div className={flexWrap}>
          {cardTypes.projectCardType.map(cardType => (
            <CardTypeEditor key={cardType.id} cardType={cardType} />
          ))}
        </div>
      </div>
    );
  }
};
