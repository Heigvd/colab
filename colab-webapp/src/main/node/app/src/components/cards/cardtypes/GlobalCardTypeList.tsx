/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../../API/api';
import { useGlobalTypes } from '../../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../../store/hooks';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import CardTypeEditor from './CardTypeEditor';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export default function GlobalCardTypeList(): JSX.Element {
  const dispatch = useAppDispatch();
  const cardTypes = useGlobalTypes();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardType({
        '@class': 'CardType',
        projectId: null,
      }),
    );
  }, [dispatch]);

  React.useEffect(() => {
    if (cardTypes.status === 'UNSET') {
      dispatch(API.getAllGlobalCardTypes());
    }
  }, [cardTypes.status, dispatch]);

  if (cardTypes.status !== 'READY') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <h3>Global Card Types</h3>
        <IconButton onClick={createNewCb} icon={faPlus} />
        <div className={flexWrap}>
          {cardTypes.types.map(cardType => (
            <CardTypeEditor key={cardType.id} cardType={cardType} />
          ))}
        </div>
      </div>
    );
  }
}
