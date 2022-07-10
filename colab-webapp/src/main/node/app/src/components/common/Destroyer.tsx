/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { ConfirmIconButton } from './element/ConfirmIconButton';

// soon not used anymore

export interface Props {
  title?: string;
  icon?: IconDefinition;
  onDelete: () => void;
}
export function Destroyer({ onDelete, title, icon = faTrashAlt }: Props): JSX.Element {
  return <ConfirmIconButton icon={icon} title={title || 'destroy'} onConfirm={onDelete} />;
}
