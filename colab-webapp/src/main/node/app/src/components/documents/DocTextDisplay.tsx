/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';

interface DocTextDisplayProps {
  id: number | null | undefined;
}

// TODO sandra work in progress make it editable

export default function DocTextDisplay({ id }: DocTextDisplayProps): JSX.Element {
  const { text } = useAndLoadTextOfDocument(id);

  return <>{text || ''}</>;
}
