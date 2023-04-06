/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import Flex from '../../common/layout/Flex';
import { DocumentOwnership } from '../documentCommonType';
import TextEditor from './TextEditor';

const editorWrapperStyle = css({
  width: '100%',
  maxWidth: '1100px',
  color: '#000',
  position: 'relative',
  lineHeight: '1.7',
  fontWeight: '400',
});

interface TextEditorWrapperProps {
  editable: boolean;
  permissions?: string;
  colab?: boolean;
  docOwnership: DocumentOwnership;
}

export default function TextEditorWrapper({
  editable,
  colab,
  docOwnership,
}: TextEditorWrapperProps): JSX.Element {
  //    Any use with colab-wss?
  //   const doc = useBlock(docId);

  return (
    <Flex style={{ width: '100%' }}>
      <div className={editorWrapperStyle}>
        <TextEditor editable={editable} colab={colab} docOwnership={docOwnership}></TextEditor>
      </div>
    </Flex>
  );
}
