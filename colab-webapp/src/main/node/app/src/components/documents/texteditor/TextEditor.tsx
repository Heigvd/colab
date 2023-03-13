/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import * as React from 'react';
import logger from '../../../logger';

const editorContainerStyle = css({
  width: '100%',
  margin: '20px auto 20px auto',
  borderRadius: '2px',
  maxWidth: '600px',
  color: '#000',
  position: 'relative',
  lineHeight: '20px',
  fontWeight: '400',
  textAlign: 'left',
  border: '1px solid black',
});
const editorStyle = css({
  background: '#fff',
  position: 'relative',
});
const placeholderStyle = css({
  color: '#999',
  overflow: 'hidden',
  position: 'absolute',
  textOverflow: 'ellipsis',
  top: '15px',
  left: '10px',
  fontSize: '15px',
  userSelect: 'none',
  display: 'inline-block',
  pointerEvents: 'none',
});
const inputStyle = css({
  minHeight: '150px',
  resize: 'none',
  fontSize: '15px',
  caretColor: 'rgb(5, 5, 5)',
  position: 'relative',
  tabSize: '1',
  outline: '0',
  padding: '15px 10px',
});

function onError(err: Error) {
  logger.error(err);
}

interface TextEditorProps {
  docId: number;
}

export default function TextEditor({ docId }: TextEditorProps) {
  const initialConfig = {
    editorState: null,
    namespace: 'debugger',
    onError,
  };

  const [floatingAnchorElem, setFloatingAnchorElem] = React.useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={editorContainerStyle}>
        {/* Toolbar here */}
        <div className={editorStyle}>
          <RichTextPlugin
            contentEditable={
              <div className="editor" ref={onRef}>
                <ContentEditable className={inputStyle} />
              </div>
            }
            placeholder={<div className={placeholderStyle}>Enter your text</div>}
            ErrorBoundary={LexicalErrorBoundary}
          ></RichTextPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
