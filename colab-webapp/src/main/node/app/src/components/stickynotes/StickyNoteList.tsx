/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import Flex from '../common/Flex';
import Tips from '../common/Tips';
import { lightIconButtonStyle, space_M } from '../styling/style';
import StickyNoteCreator from './StickyNoteCreator';
import StickyNoteDisplay from './StickyNoteDisplay';

// TODO real sort order
function sortStickyNotes(a: StickyNoteLink, b: StickyNoteLink): number {
  return (a.id || 0) - (b.id || 0);
}

export interface StickyNoteListProps {
  stickyNotes: StickyNoteLink[];
  destCardId: number;
  showSrc?: boolean;
  showDest?: boolean;
}

export default function StickyNoteList({
  stickyNotes,
  destCardId,
  showSrc = false,
  showDest = false,
}: StickyNoteListProps): JSX.Element {
  return (
    <Flex direction="column" align="stretch">
      <Tips>
        <h5>List of sticky notes stuck on the card</h5>
        <div>Sticky notes come from a source (card, card specific version, resource, block)</div>
      </Tips>
      <Flex
        grow={1}
        direction="column"
        align="stretch"
        className={css({ overflow: 'auto', padding: space_M })}
      >
        {stickyNotes.sort(sortStickyNotes).map(stickyNote => (
          <div key={stickyNote.id}>
            <StickyNoteDisplay
              key={stickyNote.id}
              stickyNote={stickyNote}
              showSrc={showSrc}
              showDest={showDest}
            />
          </div>
        ))}
      </Flex>
      <StickyNoteCreator destCardId={destCardId} className={lightIconButtonStyle} />
    </Flex>
  );
}
