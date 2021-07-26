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
import Loading from '../common/Loading';
import Overlay from '../common/Overlay';
import { addIcon, cancelIcon, createIcon } from '../styling/style';

interface StickyNoteCreatorProps {
  destCardId: number;
}

export default function StickyNoteCreator({ destCardId }: StickyNoteCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<'CLOSED' | 'EXPANDED' | 'PENDING'>('CLOSED');

  const [teaser, setTeaser] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [src, setSrc] = React.useState('');

  if (state === 'CLOSED') {
    return (
      <div>
        <IconButton icon={addIcon} title="add a sticky note" onClick={() => setState('EXPANDED')} />
      </div>
    );
  } else if (state === 'PENDING') {
    return <Loading />;
  } else {
    return (
      <Overlay>
        <>
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
              );
              setTeaser('');
              setExplanation('');
              setSrc('');
              setState('CLOSED');
            }}
          />
          <IconButton
            icon={cancelIcon}
            title="cancel"
            onClick={() => {
              setState('CLOSED');
            }}
          />
        </>
      </Overlay>
    );
  }
}
