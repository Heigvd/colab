/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAllProjectCards } from '../../selectors/cardSelector';
import { useCurrentProjectId } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '../common/element/Button';
import Form, { Field } from '../common/element/Form';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_lg, space_sm } from '../styling/style';

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

export default function StickyNoteCreator({
  destCardId,
  className,
}: StickyNoteCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const currentProjectId = useCurrentProjectId();
  const cards = useAllProjectCards();
  const cardStatus = useAppSelector(state => state.cards.status);

  // make sure to know all cards
  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && currentProjectId != null) {
      dispatch(API.getAllProjectCards(currentProjectId));
    }
  }, [cardStatus, dispatch, currentProjectId]);

  const [state, setState] = React.useState<StickyNoteLinkType>(defaultStickyNode);

  const resetInputs = React.useCallback(() => {
    setState(defaultStickyNode);
  }, []);

  const cardOptions = cards.flatMap(card => {
    if (card.parentId != null) {
      return [
        {
          label: `${card.title || i18n.modules.card.untitled} (${card.id})`,
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
      label: 'teaser',
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'explanation',
      label: 'explanation',
      type: 'textarea',
      isMandatory: true,
    },
    {
      key: 'srcCardId',
      label: 'Source',
      type: 'selectnumber',
      isMandatory: true,
      options: cardOptions,
    },
  ];

  return (
    <OpenCloseModal
      title="Create a sticky note"
      collapsedChildren={
        <Flex
          justify="center"
          className={cx(
            css({
              borderTop: '1px solid var(--divider-main)',
              padding: space_sm,
              '&:hover': { backgroundColor: 'var(--divider-main)', cursor: 'pointer' },
            }),
            className,
          )}
        >
          <Icon title="Create a sticky note" icon={'add'} />
        </Flex>
      }
    >
      {collapse => (
        <>
          <Form
            fields={fields}
            value={state}
            onSubmit={function (e) {
              setState(e);
              dispatch(
                API.createStickyNote({
                  ...e,
                  explanation: {
                    '@class': 'TextDataBlock',
                    mimeType: 'text/markdown',
                    textData: e.explanation,
                    revision: '0',
                    healthy: true,
                  },
                  destinationCardId: destCardId,
                }),
              ).then(() => {
                resetInputs();
                collapse();
              });
            }}
            submitLabel={i18n.common.create}
            className={css({ alignSelf: 'center' })}
            childrenClassName={css({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'end',
            })}
          >
            <Button
              onClick={() => {
                // see if it is better to reset the values or not
                collapse();
              }}
              variant="outline"
              className={css({ margin: space_lg })}
            >
              {i18n.common.cancel}
            </Button>
            <IconButton icon={'undo'} title="reinit fields" onClick={() => resetInputs()} />
          </Form>
        </>
      )}
    </OpenCloseModal>
  );
}
