/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';

interface DocTextWrapperProps {
  id: number | null | undefined;
  children: (text: string | null | undefined) => React.ReactNode;
}

// TODO sandra work in progress make it editable

export default function DocTextWrapper({ id, children }: DocTextWrapperProps): JSX.Element {
  const { text } = useAndLoadTextOfDocument(id);

  return <>{children(text)}</>;
}
