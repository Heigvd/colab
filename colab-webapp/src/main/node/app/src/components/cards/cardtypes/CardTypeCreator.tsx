/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheck, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import IconButton from '../../common/IconButton';

export interface Props {
  global?: boolean;
  afterCreation?: (id: number) => void;
}

export default ({ afterCreation, global = false }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();

  const [state, setState] = React.useState<'OPEN' | 'CLOSED'>('CLOSED');
  const [title, setTitle] = React.useState('');
  const [purpose, setPurpose] = React.useState('');

  if (project == null && !global) {
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
              API.createCardType({
                projectId: project && !global ? project.id! : null,
                title: title,
                purpose: {
                  '@class': 'TextDataBlock',
                  mimeType: 'text/markdown',
                  textData: purpose,
                  revision: '0',
                },
              }),
            ).then(action => {
              if (action.meta.requestStatus === 'fulfilled') {
                if (afterCreation != null) {
                  if (entityIs(action.payload, 'CardType')) {
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
