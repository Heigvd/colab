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
import { useCard } from '../../selectors/cardSelector';
import { useAppDispatch } from '../../store/hooks';
import CardThumbWithSelector from '../cards/CardThumbWithSelector';
import AutoSaveInput from '../common/AutoSaveInput';
import Flex from '../common/Flex';
import { defaultRowContainerStyle } from '../styling/style';

// TODO replace <CardThumbWithSelector for something easy and without actions

const stickyNoteOwnDataStyle = css({
  padding: '10px',
});

const teaserStyle = css({
  fontWeight: 'bolder',
  marginBottom: '5px',
});

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
    <div className={defaultRowContainerStyle}>
      {showSrc && (
        <div>
          {srcCard && typeof srcCard === 'object' && (
            <CardThumbWithSelector card={srcCard} depth={0} />
          )}
        </div>
      )}

      <Flex direction="column" grow={1}>
        <div className={stickyNoteOwnDataStyle}>
          <div className={teaserStyle}>
            <AutoSaveInput
              value={stickyNote.teaser || ''}
              placeholder="add a teaser"
              onChange={newValue =>
                dispatch(API.updateStickyNote({ ...stickyNote, teaser: newValue }))
              }
            />
          </div>
          <AutoSaveInput
            value={stickyNote.explanation || ''}
            placeholder="add an explanation"
            onChange={newValue =>
              dispatch(API.updateStickyNote({ ...stickyNote, explanation: newValue }))
            }
          />
        </div>
      </Flex>

      {showDest && (
        <div>
          {destCard && typeof destCard === 'object' && (
            <CardThumbWithSelector card={destCard} depth={0} />
          )}
        </div>
      )}
    </div>
  );
}
