/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useStickyNoteLinksForDest } from '../../selectors/stickyNoteLinkSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import StickyNoteList from './StickyNoteList';

/**
 * In this component, we load the sticky note links if necessary and display the StickyNoteList
 */

export interface StickyNoteWrapperProps {
  destCardId: number | undefined;
  showSrc?: boolean;
  showDest?: boolean;
  // TODO complete with srcCardId, srcCardContentId, srcResourceId, srcBlockId
}

export default function StickyNoteWrapper({
  destCardId,
  showSrc,
  showDest,
}: StickyNoteWrapperProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { stickyNotesForDest, status } = useStickyNoteLinksForDest(destCardId);
  const allStickyNotes = stickyNotesForDest; // to concat with StickyNotesForSrc...

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && destCardId) {
      dispatch(API.getStickyNoteLinkAsDest(destCardId));
    }
  }, [status, dispatch, destCardId]);

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else if (allStickyNotes == null) {
    return <div>no sticky notes list, no display</div>;
  } else if (!destCardId) {
    return <div>No destination card set.</div>;
  } else {
    return (
      <StickyNoteList
        stickyNotes={allStickyNotes}
        destCardId={destCardId}
        showSrc={showSrc}
        showDest={showDest}
      />
    );
  }
}
