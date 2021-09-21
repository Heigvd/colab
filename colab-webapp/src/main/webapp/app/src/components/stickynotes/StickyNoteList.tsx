/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { StickyNoteLink } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import { Destroyer } from '../common/Destroyer';
import WithToolbar from '../common/WithToolbar';
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
    <>
      <h3>Sticky notes</h3>
      <div>
        {stickyNotes.sort(sortStickyNotes).map(stickyNote => (
          <div key={stickyNote.id}>
            <WithToolbar
              toolbarPosition="RIGHT_BOTTOM"
              offsetY={-0.5}
              toolbar={
                <Destroyer
                  title="Delete this sticky note"
                  onDelete={() => {
                    dispatch(API.deleteStickyNote(stickyNote));
                  }}
                />
              }
            >
              <StickyNoteDisplay
                key={stickyNote.id}
                stickyNote={stickyNote}
                showSrc={showSrc}
                showDest={showDest}
              />
            </WithToolbar>
          </div>
        ))}
      </div>
      <div>
        <StickyNoteCreator destCardId={destCardId} />
      </div>
    </>
  );
}
