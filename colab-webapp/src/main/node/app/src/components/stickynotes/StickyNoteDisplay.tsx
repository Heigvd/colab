/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { useCard } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import CardThumbWithSelector from '../cards/CardThumbWithSelector';
import Button from '../common/element/Button';
import InlineInputNew from '../common/element/InlineInputNew';
import ConfirmDeleteModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import { cardStyle, errorColor, lightIconButtonStyle, space_M, space_S } from '../styling/style';

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

  const srcCard = useCard(stickyNote.srcCardId || 0);
  const destCard = useCard(stickyNote.destinationCardId || 0);

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
      className={cx(cardStyle, css({ margin: space_S, maxWidth: '300px' }))}
    >
      <Flex
        justify="space-between"
        className={css({ borderBottom: '1px solid var(--lightGray)', padding: space_S })}
      >
        <InlineInputNew
          value={stickyNote.teaser || ''}
          placeholder="There is no teaser for the moment. Feel free to fill it."
          onChange={newValue => dispatch(API.updateStickyNote({ ...stickyNote, teaser: newValue }))}
          className={css({ fontWeight: 'bold' })}
          autosave={false}
        />
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
          entries={[
            {
              value: 'Delete sticky note',
              label: (
                <ConfirmDeleteModal
                  buttonLabel={
                    <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                      <FontAwesomeIcon icon={faTrash} />
                      {' Delete sticky note'}
                    </div>
                  }
                  className={css({
                    '&:hover': { textDecoration: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                  })}
                  message={
                    <p>
                      Are you <strong>sure</strong> you want to delete this sticky note? This will
                      remove it one the source as well.
                    </p>
                  }
                  onConfirm={() => {
                    dispatch(API.deleteStickyNote(stickyNote));
                  }}
                  confirmButtonLabel={'Delete sticky note'}
                />
              ),
              modal: true,
            },
          ]}
        />
      </Flex>
      <Flex direction="column" align="stretch">
        <div className={css({ margin: space_M, minWidth: '0' })}>
          {stickyNote.explanationId && (
            <div>
              <p>
                <b>Explanation:</b>
              </p>
              <BlockEditorWrapper blockId={stickyNote.explanationId} allowEdition={true} />
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
                <CardThumbWithSelector card={destCard} depth={0} />
              )}
            </div>
          )}
        </div>
      </Flex>
    </Flex>
  );
}
