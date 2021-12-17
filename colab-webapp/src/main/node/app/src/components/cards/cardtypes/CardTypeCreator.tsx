/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { useCardTypeTags } from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import Form, { createSelectField, Field } from '../../common/Form/Form';
import IconButton from '../../common/IconButton';

export interface Props {
  global?: boolean;
  afterCreation?: (id: number) => void;
}

interface NewType {
  title: string;
  purpose: string;
  tags: string[];
}

export default ({ afterCreation, global = false }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const { project } = useProjectBeingEdited();

  const [state, setState] = React.useState<'OPEN' | 'CLOSED'>('CLOSED');

  const createTypeCb = React.useCallback(
    (typeToCreate: NewType) => {
      dispatch(
        API.createCardType({
          projectId: project && !global ? project.id! : null,
          title: typeToCreate.title,
          tags: typeToCreate.tags,
          purpose: {
            '@class': 'TextDataBlock',
            mimeType: 'text/markdown',
            textData: typeToCreate.purpose,
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
      setState('CLOSED');
    },
    [dispatch, afterCreation, global, project],
  );

  const allTags = useCardTypeTags();

  if (project == null && !global) {
    //TODO: global types
    return <i>No project</i>;
  }
  if (state === 'OPEN') {
    const fields: Field<NewType>[] = [
      {
        key: 'title',
        type: 'text',
        label: 'title',
        placeholder: 'title',
        isMandatory: true,
      },
      {
        key: 'purpose',
        type: 'text',
        label: 'purpose',
        placeholder: 'purpose',
        isMandatory: true,
      },
      createSelectField({
        key: 'tags',
        type: 'select',
        label: 'category',
        isMulti: true,
        options: allTags.map(c => ({ label: c, value: c })),
        canCreateOption: true,
        placeholder: 'category',
        isMandatory: true,
      }),
    ];

    return (
      <div
        className={css({
          margin: '20px',
          width: 'max-content',
        })}
      >
        <Form
          fields={fields}
          value={{ title: '', purpose: '', tags: [] }}
          autoSubmit={false}
          onSubmit={createTypeCb}
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
