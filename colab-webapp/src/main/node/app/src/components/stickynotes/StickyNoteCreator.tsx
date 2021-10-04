/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import CardSelector from '../cards/CardSelector';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenCloseModal from '../common/OpenCloseModal';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';

interface StickyNoteCreatorProps {
  destCardId: number;
}

export default function StickyNoteCreator({ destCardId }: StickyNoteCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [teaser, setTeaser] = React.useState('');
  const [explanation, setExplanation] = React.useState('');
  const [srcId, setSrcId] = React.useState<number | undefined>(undefined);

  function resetInputs() {
    setTeaser('');
    setExplanation('');
    setSrcId(undefined);
    // must be the same as the default values of the states
  }

  return (
    <OpenCloseModal
      title="add a sticky note"
      collapsedChildren={<IconButton title="add a sticky note" icon={addIcon} />}
    >
      {collapse => (
        <>
          <h2>Create a new sticky note</h2>
          <div>
            {'Title : '}
            <input value={teaser} onChange={event => setTeaser(event.target.value)} />
          </div>
          <div>
            {'Explanation : '}
            <input value={explanation} onChange={event => setExplanation(event.target.value)} />
          </div>
          <div>
            {'Source : '}
            <CardSelector value={srcId} onSelect={card => setSrcId(card?.id || undefined)} />
          </div>
          <Flex>
            <IconButton
              icon={createIcon}
              title="create"
              onClick={() => {
                dispatch(
                  API.createStickyNote({
                    '@class': 'StickyNoteLink',
                    srcCardId: srcId,
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
          </Flex>
        </>
      )}
    </OpenCloseModal>
  );
}
