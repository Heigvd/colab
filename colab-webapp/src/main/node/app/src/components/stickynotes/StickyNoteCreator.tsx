/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAllProjectCards } from '../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Flex from '../common/Flex';
import Form, { Field } from '../common/Form/Form';
import IconButton from '../common/IconButton';
import OpenCloseModal, { modalPadding } from '../common/OpenCloseModal';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';

interface StickyNoteCreatorProps {
  destCardId: number;
}

const defaultStickyNode: StickyNoteLink = {
  '@class': 'StickyNoteLink',
  srcCardId: undefined,
  destinationCardId: undefined,
  teaser: '',
  explanation: '',
};

export default function StickyNoteCreator({ destCardId }: StickyNoteCreatorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const { project } = useProjectBeingEdited();
  const cards = useAllProjectCards();
  const cardStatus = useAppSelector(state => state.cards.status);
  const projectId = project != null ? project.id : undefined;

  // make sure to know all cards
  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCards(projectId));
    }
  }, [cardStatus, dispatch, projectId]);

  const [state, setState] = React.useState<StickyNoteLink>(defaultStickyNode);

  const resetInputs = React.useCallback(() => {
    setState(defaultStickyNode);
  }, []);

  const cardOptions = cards.flatMap(card => {
    if (card.parentId != null) {
      return [
        {
          label: `${card.title || i18n.card.untitled} (${card.id})`,
          value: card.id!,
        },
      ];
    } else {
      return [];
    }
  });

  const fields: Field<StickyNoteLink>[] = [
    {
      key: 'teaser',
      type: 'text',
      label: 'teaser',
      placeholder: 'teaser',
      isMandatory: true,
    },
    {
      key: 'explanation',
      type: 'text',
      label: 'explaination',
      placeholder: 'explaination',
      isMandatory: true,
    },
    {
      key: 'srcCardId',
      label: 'Source',
      placeholder: 'Source',
      type: 'selectnumber',
      options: cardOptions,
      isMandatory: true,
    },
  ];

  return (
    <OpenCloseModal
      title="Create a new sticky note"
      collapsedChildren={<IconButton title="add a sticky note" icon={addIcon} />}
    >
      {collapse => (
        <div className={css({ padding: modalPadding })}>
          <Form fields={fields} value={state} autoSubmit={true} onSubmit={setState} />
          <Flex>
            <IconButton
              icon={createIcon}
              title="create"
              onClick={() => {
                dispatch(API.createStickyNote({ ...state, destinationCardId: destCardId })).then(
                  () => {
                    resetInputs();
                    collapse();
                  },
                );
              }}
            />
            <IconButton icon={reinitIcon} title="reinit" onClick={() => resetInputs()} />
            <IconButton
              icon={cancelIcon}
              title="cancel"
              onClick={() => {
                // see if it is better to reset the values or not
                collapse();
              }}
            />
          </Flex>
        </div>
      )}
    </OpenCloseModal>
  );
}
