/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';

interface Props {
  id: number | null | undefined;
}

export default function DocTextDisplay({ id }: Props): JSX.Element {
  const { text } = useAndLoadTextOfDocument(id);

  return <>{text || ''}</>;
}
