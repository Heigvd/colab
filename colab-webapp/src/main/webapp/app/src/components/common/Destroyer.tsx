/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { faTimes, faCheck, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton';

export interface Props {
  title?: string;
  onDelete: () => void;
}
export function Destroyer({ onDelete, title }: Props): JSX.Element {
  const [waitDeleteConfirm, setConfirm] = React.useState(false);

  return (
    <div title={title || 'destroy'}>
      {waitDeleteConfirm ? (
        <div>
          <IconButton icon={faTrashAlt} />:
          <IconButton title={`cancel ${title}`} icon={faTimes} onClick={() => setConfirm(false)} />
          <IconButton title={`confirm ${title}`} icon={faCheck} onClick={() => onDelete()} />
        </div>
      ) : (
        <div>
          <IconButton icon={faTrashAlt} onClick={() => setConfirm(true)} />
        </div>
      )}
    </div>
  );
}
