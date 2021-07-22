/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import FitSpace from '../common/FitSpace';
import InlineLoading from '../common/InlineLoading';
import StickyNoteDisplay from './StickyNoteDisplay';

// TODO check with Maxence that we cannot have null entry in the []

export interface StickyNoteListProps {
  stickyNotes: StickyNoteLink[];
  showSrc?: boolean;
  showDest?: boolean;
}

export default function StickyNoteList({
  stickyNotes,
  showSrc = false,
  showDest = false,
}: StickyNoteListProps): JSX.Element {
  // TODO if sn cannot be null, no need to check and display an inline loading

  return (
    <FitSpace>
      <>
        <h3>Sticky notes</h3>
        {stickyNotes.map(stickyNote =>
          stickyNote == null ? (
            <InlineLoading />
          ) : (
            <StickyNoteDisplay
              key={stickyNote.id}
              stickyNote={stickyNote}
              showSrc={showSrc}
              showDest={showDest}
            />
          ),
        )}
      </>
    </FitSpace>
  );
}
