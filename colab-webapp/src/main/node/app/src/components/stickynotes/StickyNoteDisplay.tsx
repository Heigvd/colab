/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useCard } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import CardThumbWithSelector from '../cards/CardThumbWithSelector';
import Button from '../common/element/Button';
import { DiscreetInput } from '../common/element/Input';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { cardStyle, lightIconButtonStyle, space_lg, space_sm } from '../styling/style';

// TODO replace <CardThumbWithSelector for something easy and without actions

export interface StickyNoteDisplayProps {
  stickyNote: StickyNoteLink;
  showSrc: boolean;
  showDest: boolean;
}

export default function StickyNoteDisplay({
  stickyNote,
  showSrc,
  showDest,
}: StickyNoteDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const srcCard = useCard(stickyNote.srcCardId || 0);
  const destCard = useCard(stickyNote.destinationCardId || 0);

  const [showModal, setShowModal] = React.useState('');

  React.useEffect(() => {
    if (showSrc && stickyNote.srcCardId && srcCard === undefined) {
      dispatch(API.getCard(stickyNote.srcCardId));
    }
  }, [showSrc, stickyNote.srcCardId, srcCard, dispatch]);

  React.useEffect(() => {
    if (showDest && stickyNote.destinationCardId && destCard === undefined) {
      dispatch(API.getCard(stickyNote.destinationCardId));
    }
  }, [showDest, stickyNote.destinationCardId, destCard, dispatch]);

  return (
    <Flex
      align="stretch"
      direction="column"
      className={cx(cardStyle, css({ margin: space_sm, maxWidth: '300px' }))}
    >
      <Flex
        justify="space-between"
        className={css({ borderBottom: '1px solid var(--divider-main)', padding: space_sm })}
      >
        {showModal === 'delete' && (
          <ConfirmDeleteModal
            title={'Delete sticky note'}
            message={
              <p>
                Are you <strong>sure</strong> you want to delete this sticky note? This will remove
                it one the source as well.
              </p>
            }
            onCancel={() => {
              setShowModal('');
            }}
            onConfirm={() => {
              dispatch(API.deleteStickyNote(stickyNote));
            }}
            confirmButtonLabel={'Delete sticky note'}
          />
        )}
        <DiscreetInput
          value={stickyNote.teaser || ''}
          placeholder="There is no teaser for the moment. Feel free to fill it."
          onChange={newValue => dispatch(API.updateStickyNote({ ...stickyNote, teaser: newValue }))}
          inputDisplayClassName={css({ fontWeight: 'bold' })}
        />
        <DropDownMenu
          icon={'more_vert'}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_sm }))}
          onSelect={value => setShowModal(value.value)}
          entries={[
            {
              value: 'delete',
              label: (
                <>
                  <Icon icon={'delete'} color={'var(--error-main)'} /> {i18n.common.delete}
                </>
              ),
            },
          ]}
        />
      </Flex>
      <Flex direction="column" align="stretch">
        <div className={css({ margin: space_lg, minWidth: '0' })}>
          {stickyNote.explanationId && (
            <div>
              <p>
                <b>Explanation:</b>
              </p>
              <BlockEditorWrapper blockId={stickyNote.explanationId} readOnly={false} />
            </div>
          )}
          {showSrc && (
            <div>
              {srcCard && typeof srcCard === 'object' && (
                <div>
                  <p>
                    <b>Source:</b>
                  </p>
                  <p>{srcCard.title}</p>
                  <p>Card #{srcCard.id}</p>
                  <Button
                    onClick={function () {
                      navigate(`../card/${srcCard.id}`);
                    }}
                    className={css({ display: 'inline-block' })}
                  >
                    Show source
                  </Button>
                </div>
              )}
            </div>
          )}
          {showDest && (
            <div>
              {destCard && typeof destCard === 'object' && (
                <CardThumbWithSelector card={destCard} depth={0} showPreview />
              )}
            </div>
          )}
        </div>
      </Flex>
    </Flex>
  );
}
