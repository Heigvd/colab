/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import 'easymde/dist/easymde.min.css';

import * as React from 'react';

import { TextDataBlock } from 'colab-rest-client';

export interface BlockEditorProps {
  block: TextDataBlock;
}

export function BlockEditorWrapper({ block }: BlockEditorProps): JSX.Element {
  return <div>{block.textData}</div>;
}
