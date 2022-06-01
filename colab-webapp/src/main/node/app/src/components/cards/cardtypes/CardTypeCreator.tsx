/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../../API/api';
import {
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import Button from '../../common/Button';
import Form, { createSelectField, Field } from '../../common/Form/Form';
import OpenCloseModal from '../../common/OpenCloseModal';
import { buttonStyle, marginAroundStyle, space_M } from '../../styling/style';

interface CardTypeCreatorProps {
  onCreated?: (id: number) => void;
  usage: 'currentProject' | 'global';
}

interface NewType {
  title: string;
  purpose: string;
  tags: string[];
}

export default function CardTypeCreator({ onCreated, usage }: CardTypeCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { project } = useProjectBeingEdited();

  const createTypeCb = React.useCallback(
    (typeToCreate: NewType) => {
      dispatch(
        API.createCardType({
          projectId: usage === 'currentProject' && project ? project.id! : null,
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
        if (onCreated != null) {
          if (action.meta.requestStatus === 'fulfilled') {
            if (typeof action.payload === 'number') {
              onCreated(action.payload);
            }
          }
        }
      });
    },
    [dispatch, onCreated, usage, project],
  );

  const allCurrentProjectTags = useCurrentProjectCardTypeTags();
  const allGlobalTags = useGlobalCardTypeTags();
  const fields: Field<NewType>[] = [
    {
      key: 'title',
      type: 'text',
      label: 'name',
      isMandatory: true,
    },
    {
      key: 'purpose',
      type: 'textarea',
      label: 'purpose',
      isMandatory: true,
    },
    createSelectField({
      key: 'tags',
      type: 'select',
      label: 'category',
      isMulti: true,
      options: (usage === 'currentProject' ? allCurrentProjectTags : allGlobalTags).map(c => ({
        label: c,
        value: c,
      })),
      canCreateOption: true,
      placeholder: 'Select or type to create',
      isMandatory: true,
    }),
  ];

  if (project == null && usage === 'currentProject') {
    return <i>No project selected</i>;
  }

  return (
    <OpenCloseModal
      title={'Create a type'}
      collapsedChildren={
        <>
          <FontAwesomeIcon icon={faPlus} /> Add a type
        </>
      }
      className={cx(buttonStyle, css({ marginBottom: space_M }))}
      showCloseButton
    >
      {close => {
        return (
          <Form
            fields={fields}
            value={{ title: '', purpose: '', tags: [] }}
            autoSubmit={false}
            submitLabel="Create"
            onSubmit={function (type) {
              createTypeCb(type);
              close();
            }}
            className={css({ alignSelf: 'center' })}
            childrenClassName={css({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'end',
            })}
            buttonClassName={cx(buttonStyle, marginAroundStyle([1], space_M))}
          >
            <Button
              onClick={() => {
                close();
              }}
              invertedButton
              className={css({ margin: space_M })}
            >
              Cancel
            </Button>
          </Form>
        );
      }}
    </OpenCloseModal>
  );
}
