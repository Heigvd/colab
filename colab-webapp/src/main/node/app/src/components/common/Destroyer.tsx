/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCheck, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import IconButton from './IconButton';

export interface Props {
  title?: string;
  icon?: IconDefinition;
  onDelete: () => void;
}
export function Destroyer({ onDelete, title, icon }: Props): JSX.Element {
  const [waitDeleteConfirm, setConfirm] = React.useState(false);

  const askConfirm = React.useCallback(() => {
    setConfirm(false);
  }, []);

  const confirmedCb = React.useCallback(() => {
    setConfirm(false);
    onDelete();
  }, [onDelete]);

  return (
    <div title={title || 'destroy'}>
      {waitDeleteConfirm ? (
        <div>
          <IconButton icon={icon || faTrashAlt} />:
          <IconButton title={`cancel ${title}`} icon={faTimes} onClick={askConfirm} />
          <IconButton title={`confirm ${title}`} icon={faCheck} onClick={confirmedCb} />
        </div>
      ) : (
        <div>
          <IconButton icon={icon || faTrashAlt} onClick={() => setConfirm(true)} />
        </div>
      )}
    </div>
  );
}
