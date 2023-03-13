/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Flex from '../../common/layout/Flex';
import TextEditor from './TextEditor';

interface TextEditorWrapperProps {
  docId: number;
  permissions?: string;
}

export default function TextEditorWrapper({ docId = 0 }: TextEditorWrapperProps): JSX.Element {
  //    Any use with colab-wss?
  //   const doc = useBlock(docId);

  return (
    <Flex style={{ width: '100%' }}>
      <TextEditor docId={docId}></TextEditor>
    </Flex>
  );
}
