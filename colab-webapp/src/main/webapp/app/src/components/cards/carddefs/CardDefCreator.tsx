/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { css } from '@emotion/css';
import IconButton from '../../common/IconButton';
import { useAppDispatch } from '../../../store/hooks';
import { faTimes, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { entityIs } from 'colab-rest-client';

export interface Props {
  afterCreation?: (id: number) => void;
}

export default ({ afterCreation }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();

  const [state, setState] = React.useState<'OPEN' | 'CLOSED'>('CLOSED');
  const [title, setTitle] = React.useState('');
  const [purpose, setPurpose] = React.useState('');

  if (project == null) {
    //TODO: global types
    return <i>No project</i>;
  }
  if (state === 'OPEN') {
    return (
      <div
        className={css({
          margin: '20px',
          width: 'max-content',
        })}
      >
        Title:
        <input
          value={title}
          onChange={event => {
            setTitle(event.target.value);
          }}
        />
        Purpose:
        <textarea
          value={purpose}
          onChange={event => {
            setPurpose(event.target.value);
          }}
        />
        <IconButton
          icon={faTimes}
          onClick={() => {
            setTitle('');
            setPurpose('');
            setState('CLOSED');
          }}
        />
        <IconButton
          icon={faCheck}
          onClick={() => {
            dispatch(
              API.createCardDef({
                cardDef: {
                  '@class': 'CardDef',
                  title: title,
                  purpose: purpose,
                },
                projectId: project.id!,
              }),
            ).then(action => {
              if (action.meta.requestStatus === 'fulfilled') {
                if (afterCreation != null) {
                  if (entityIs(action.payload, 'CardDef')) {
                    afterCreation(action.payload.id!);
                  }
                }
              }
            });
            setTitle('');
            setPurpose('');
            setState('CLOSED');
          }}
        />
      </div>
    );
  } else {
    return (
      <IconButton
        title="Create a new type"
        icon={faPlus}
        onClick={() => {
          setState('OPEN');
        }}
      />
    );
  }
};
