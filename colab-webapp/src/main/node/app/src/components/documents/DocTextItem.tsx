/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadTextOfDocument } from '../../store/selectors/documentSelector';
////////////////////////////////////////////////////////////////////////////////////////////////////
// Doc text data block display
////////////////////////////////////////////////////////////////////////////////////////////////////

interface DocTextDisplayProps {
  id: number | null | undefined;
}

export function DocTextDisplay({ id }: DocTextDisplayProps): JSX.Element {
  const { text } = useAndLoadTextOfDocument(id);

  return <>{text || ''}</>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Doc text data block wrapper
////////////////////////////////////////////////////////////////////////////////////////////////////

interface DocTextWrapperProps {
  id: number | null | undefined;
  children: (text: string | null | undefined) => React.ReactNode;
}

export function DocTextWrapper({ id, children }: DocTextWrapperProps): JSX.Element {
  const { text } = useAndLoadTextOfDocument(id);

  return <>{children(text)}</>;
}
