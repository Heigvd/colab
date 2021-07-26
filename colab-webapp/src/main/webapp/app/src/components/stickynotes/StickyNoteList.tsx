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
import FitSpace from '../common/FitSpace';
import InlineLoading from '../common/InlineLoading';
import WithToolbar from '../common/WithToolbar';
import StickyNoteCreator from './StickyNoteCreator';
import StickyNoteDisplay from './StickyNoteDisplay';

// TODO check with Maxence that we cannot have null entry in the []

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
  // TODO if sn cannot be null, no need to check and display an inline loading

  return (
    <FitSpace>
      <>
        <h3>Sticky notes</h3>
        <div>
          {stickyNotes.map(stickyNote =>
            stickyNote == null ? (
              <InlineLoading />
            ) : (
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
            ),
          )}
        </div>
        <div>
          <StickyNoteCreator destCardId={destCardId} />
        </div>
      </>
    </FitSpace>
  );
}
