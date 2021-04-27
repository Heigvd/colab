/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { useProjectBeingEdited, useAppDispatch, useAppSelector } from '../../../store/hooks';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../common/IconButton';
import { useHistory } from 'react-router-dom';
import { css } from '@emotion/css';
import InlineLoading from '../../common/InlineLoading';
import CardDisplay from '../../cards/CardDisplay';

export default (): JSX.Element => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { project, status } = useProjectBeingEdited();

  const root = useAppSelector(state => {
    if (project != null && project.rootCardId != null) {
      return state.cards.cards[project.rootCardId].card
    } else {
      return null;
    }
  });

  if (status == 'LOADING') {
    return <InlineLoading />;
  } else if (project == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <h3>Edit project #{project.id}</h3>
          <IconButton
            iconSize="2x"
            onClick={() => {
              // make sure to go back to projects page before closing project
              // to avoid infinite loop
              history.push('/projects');
              dispatch(API.closeCurrentProject());
            }}
            icon={faTimes}
          />
        </div>
        <div>{root != null ? <CardDisplay card={root} /> : <InlineLoading />}</div>
      </div>
    );
  }
};
