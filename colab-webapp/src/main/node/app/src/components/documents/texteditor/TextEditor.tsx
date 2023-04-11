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
import { useColabConfig } from '../../../store/selectors/configSelector';
import { useCurrentUser } from '../../../store/selectors/userSelector';
import { DocumentOwnership } from '../documentCommonType';
import { ImageNode } from './nodes/ImageNode';
import ClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingToolbarPlugin/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingToolbarPlugin/FloatingTextFormatPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
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

export const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

interface TextEditorProps {
  editable: boolean;
  colab?: boolean;
  docOwnership: DocumentOwnership;
}

export default function TextEditor({ docOwnership, editable, colab }: TextEditorProps) {
  const { currentUser } = useCurrentUser();
  const displayName = getDisplayName(currentUser);

  const initialConfig = {
    namespace: `lexical-${docOwnership.ownerId}-${docOwnership.kind}`,
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
      ImageNode,
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

  const WEBSOCKET_SLUG = 'colab';
  const { yjsUrl } = useColabConfig();

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
      return new WebsocketProvider(yjsUrl, WEBSOCKET_SLUG + '/' + id, doc, {
        connect: true,
        params: {
          ownerId: String(docOwnership.ownerId),
          kind: String(docOwnership.kind),
        },
      });
    },
    [docOwnership.kind, docOwnership.ownerId, yjsUrl],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={editorContainerStyle}>
        <ToolbarPlugin docId={docOwnership.ownerId} />
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
              id={`lexical-${docOwnership.kind}-${docOwnership.ownerId}`}
              providerFactory={webSocketProvider}
              shouldBootstrap={true}
              username={displayName!}
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
          <ImagesPlugin />
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
