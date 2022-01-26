/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import { space_S } from '../styling/style';

interface StickyNoteCreatorProps {
  destCardId: number;
  className?: string;
}

interface StickyNoteLinkType {
  srcCardId: number | null;
  srcCardContentId: number | null;
  srcResourceOrRefId: number | null;
  srcBlockId: number | null;
  destinationCardId: number | null;
  teaser: string;
  explanation: string;
}

const defaultStickyNode: StickyNoteLinkType = {
  srcCardId: null,
  srcCardContentId: null,
  srcResourceOrRefId: null,
  srcBlockId: null,
  destinationCardId: null,
  teaser: '',
  explanation: '',
};

export default function StickyNoteCreator({ destCardId, className }: StickyNoteCreatorProps): JSX.Element {
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

  const [state, setState] = React.useState<StickyNoteLinkType>(defaultStickyNode);

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

  const fields: Field<StickyNoteLinkType>[] = [
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
      label: 'explanation',
      placeholder: 'explanation',
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
      collapsedChildren={<Flex
        justify="center"
        className={cx(
          css({
            borderTop: '1px solid var(--lightGray)',
            padding: space_S,
            '&:hover': { backgroundColor: 'var(--lightGray)', cursor: 'pointer' },
          }),
          className,
        )}
      >
        <FontAwesomeIcon title="Add sticky note" icon={addIcon} />
      </Flex>}
    >
      {collapse => (
        <div className={css({ padding: modalPadding })}>
          <Form fields={fields} value={state} autoSubmit={true} onSubmit={setState} />
          <Flex>
            <IconButton
              icon={createIcon}
              title="create"
              onClick={() => {
                dispatch(
                  API.createStickyNote({
                    ...state,
                    explanation: {
                      '@class': 'TextDataBlock',
                      mimeType: 'text/markdown',
                      textData: state.explanation,
                      revision: '0',
                    },
                    destinationCardId: destCardId,
                  }),
                ).then(() => {
                  resetInputs();
                  collapse();
                });
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
