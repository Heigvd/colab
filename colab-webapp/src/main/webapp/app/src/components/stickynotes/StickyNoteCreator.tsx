/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/IconButton';
import OpenClose from '../common/OpenClose';
import Overlay from '../common/Overlay';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';

interface StickyNoteCreatorProps {
  destCardId: number;
}

export default function StickyNoteCreator({ destCardId }: StickyNoteCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [teaser, setTeaser] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [src, setSrc] = React.useState('');

  function resetInputs() {
    setTeaser('');
    setExplanation('');
    setSrc('');
    // must be the same as the default values of the states
  }

  return (
    <OpenClose collapsedChildren={<IconButton icon={addIcon} title="add a sticky note" />}>
      {collapse => (
        <Overlay>
          <h2>Create a new sticky note</h2>
          <p>
            {'Title : '}
            <input value={teaser} onChange={event => setTeaser(event.target.value)} />
          </p>
          <p>
            {'Explanation : '}
            <input value={explanation} onChange={event => setExplanation(event.target.value)} />
          </p>
          <p>
            {'Source : '}
            <input value={src} onChange={event => setSrc(event.target.value)} />
            {/* TODO : card picker */}
          </p>
          <IconButton
            icon={createIcon}
            title="create"
            onClick={() => {
              dispatch(
                API.createStickyNote({
                  '@class': 'StickyNoteLink',
                  srcCardId: parseInt(src),
                  destinationCardId: destCardId,
                  teaser: teaser,
                  explanation: explanation,
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
        </Overlay>
      )}
    </OpenClose>
  );
}
