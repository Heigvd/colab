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
import { useCardDefs } from '../../../selectors/cardDefSelector';
import InlineLoading from '../../common/InlineLoading';
import IconButton from '../../common/IconButton';
import CardDefEditor from './CardDefEditor';

const flexWrap = css({
  display: 'flex',
  flexDirecion: 'row',
  flexWrap: 'wrap',
});

export interface Props {}

export default ({}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const cardDefs = useCardDefs();

  const createNewCb = React.useCallback(() => {
    dispatch(
      API.createCardDef({
        '@class': 'CardDef',
        projectId: null,
      }),
    );
  }, [dispatch]);

  if (cardDefs.status === 'UNSET') {
    dispatch(API.getAllGlobalCardDefs());
  }

  if (cardDefs.status !== 'READY') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <h3>Global Card Types</h3>
        <IconButton onClick={createNewCb} icon={faPlus} />
        <div className={flexWrap}>
          {cardDefs.projectCardDef.map(cardDef => (
            <CardDefEditor key={cardDef.id} cardDef={cardDef} />
          ))}
        </div>
      </div>
    );
  }
};
