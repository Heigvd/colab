/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from '@lexical/rich-text';
import * as React from 'react';
import logger from '../../../logger';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin/ToolbarPlugin';
import theme from './theme/EditorTheme';

const editorContainerStyle = css({
  width: '100%',
  margin: '20px auto 20px auto',
  borderRadius: '2px',
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
  editable: boolean;
}

export default function TextEditor({ docId, editable }: TextEditorProps) {
  const initialConfig = {
    namespace: `lexical-${docId}`,
    editorState: null,
    editable: editable,
    nodes: [HeadingNode, ListNode, ListItemNode, AutoLinkNode, LinkNode],
    theme,
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
        <ToolbarPlugin />
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
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <ClickableLinkPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
