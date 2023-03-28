/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

// Based on https://github.com/facebook/lexical, check this repo for updates

import { css, cx } from '@emotion/css';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HeadingNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { Provider } from '@lexical/yjs';
import * as React from 'react';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';
import { getDisplayName } from '../../../helper';
import logger from '../../../logger';
import { useCurrentUser } from '../../../selectors/userSelector';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingToolbarPlugin/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingToolbarPlugin/FloatingTextFormatPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import TableActionMenuPlugin from './plugins/TablePlugin/TableActionMenuPlugin';
import TableCellResizerPlugin from './plugins/TablePlugin/TableCellResizerPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin/ToolbarPlugin';
import theme from './theme/EditorTheme';

const editorContainerStyle = css({
  width: '100%',
  margin: '20px auto 20px auto',
  borderRadius: '2px',
  color: 'var(--text-primary)',
  position: 'relative',
  lineHeight: '20px',
  fontWeight: '400',
  textAlign: 'left',
  border: '1px solid var(--divider-main)',
});
const editorStyle = css({
  background: '#fff',
  position: 'relative',
});
const contentEditableStyle = css({
  border: '0',
  fontSize: '15px',
  display: 'block',
  position: 'relative',
  tabSize: '1',
  outline: '0',
  padding: '14px 28px',
  minHeight: 'calc(100% - 16px)',
  background: '#fff',
});
const placeholderStyle = css({
  color: '#999',
  overflow: 'hidden',
  position: 'absolute',
  textOverflow: 'ellipsis',
  top: '14px',
  left: '28px',
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
});

function onError(err: Error) {
  logger.error(err);
}

const skipCollaborationInit =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.parent != null && window.parent.frames.right === window;

const WEBSOCKET_ENDPOINT = 'ws://localhost:4321';
const WEBSOCKET_SLUG = 'colab';

interface TextEditorProps {
  docId: number;
  editable: boolean;
  colab?: boolean;
}

export default function TextEditor({ docId, editable, colab }: TextEditorProps) {
  const { currentUser } = useCurrentUser();
  const displayName = getDisplayName(currentUser);

  const initialConfig = {
    namespace: `lexical-${docId}`,
    editorState: null,
    editable: editable,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      AutoLinkNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    theme,
    onError,
  };

  const [floatingAnchorElem, setFloatingAnchorElem] = React.useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const webSocketProvider = React.useCallback(
    (id: string, yjsDocMap: Map<string, Doc>): Provider => {
      let doc = yjsDocMap.get(id);
      if (doc === undefined) {
        doc = new Doc();
        yjsDocMap.set(id, doc);
      } else {
        doc.load();
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new WebsocketProvider(WEBSOCKET_ENDPOINT, WEBSOCKET_SLUG + '/' + id, doc, {
        connect: true,
        params: {
          docId: String(docId),
          permission: 'asd',
        },
      });
    },
    [docId],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={editorContainerStyle}>
        <ToolbarPlugin />
        <div className={editorStyle}>
          <RichTextPlugin
            contentEditable={
              <div className={inputStyle} ref={onRef}>
                <ContentEditable className={contentEditableStyle} />
              </div>
            }
            placeholder={
              <div className={cx(placeholderStyle, 'placeholderXY')}>Enter your text</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {colab ? (
            <CollaborationPlugin
              id="main"
              providerFactory={webSocketProvider}
              shouldBootstrap={!skipCollaborationInit}
              username={displayName}
            />
          ) : (
            <HistoryPlugin />
          )}
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <ClickableLinkPlugin />
          <TablePlugin />
          <TableCellResizerPlugin />
          {floatingAnchorElem && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
              <TableActionMenuPlugin anchorElem={floatingAnchorElem} />
              <FloatingTextFormatToolbarPlugin anchorElement={floatingAnchorElem} />
              <FloatingLinkEditorPlugin anchorElement={floatingAnchorElem} />
            </>
          )}
        </div>
      </div>
    </LexicalComposer>
  );
}
