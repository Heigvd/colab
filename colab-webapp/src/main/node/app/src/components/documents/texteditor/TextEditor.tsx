/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

// Based on https://github.com/facebook/lexical, check this repo for updates

import { css, cx } from '@emotion/css';
import { CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
//import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { Provider } from '@lexical/yjs';
import { TextNode } from 'lexical';
import * as React from 'react';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';
import { getDisplayName } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import { useCurrentUser } from '../../../store/selectors/userSelector';
import InlineLoading from '../../common/element/InlineLoading';
import { TipsCtx } from '../../common/element/Tips';
import { DocumentOwnership } from '../documentCommonType';
import { ExtendedTextNode } from './nodes/ExtendedTextNode';
import { FileNode } from './nodes/FileNode';
import { ImageNode } from './nodes/ImageNode';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmptinessSensorPlugin from './plugins/EmptinessSensorPlugin';
import FilesPlugin from './plugins/FilesPlugin';
import FloatingFileMenuPlugin from './plugins/FloatingToolbarPlugin/FloatingFileMenuPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingToolbarPlugin/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingToolbarPlugin/FloatingTextFormatPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import CustomCheckListPlugin from './plugins/ListPlugin/CustomCheckListPlugin';
import MarkdownPlugin from './plugins/MarkdownShortcutPlugin';
import TableActionMenuPlugin from './plugins/TablePlugin/TableActionMenuPlugin';
import TableCellResizerPlugin from './plugins/TablePlugin/TableCellResizerPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin/ToolbarPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import theme from './theme/EditorTheme';

const editorContainerStyle = css({
  width: '100%',
  borderRadius: '2px',
  color: 'var(--text-primary)',
  lineHeight: '20px',
  fontWeight: '400',
  textAlign: 'left',
  flexDirection: 'column',
  margin: 'auto',
  maxWidth: '78em',
});
const editorStyle = css({
  height: '100%',
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
  padding: '28px',
  minHeight: 'calc(100% - 28px - 28px)', // 2 * padding
  background: '#fff',
});
const placeholderStyle = css({
  color: '#999',
  overflow: 'hidden',
  position: 'absolute',
  textOverflow: 'ellipsis',
  top: '28px',
  left: '28px',
  fontSize: '15px',
  userSelect: 'none',
  display: 'inline-block',
  pointerEvents: 'none',
});

const editorScrollerStyle = css({
  height: '100%',
  minHeight: '150px',
  border: 0,
  display: 'flex',
  position: 'relative',
  outline: 0,
  zIndex: 0,
  resize: 'none',
});

const editorRefStyle = css({
  flex: 'auto',
  position: 'relative',
  resize: 'none',
  zIndex: -1,
});

interface TextEditorProps {
  readOnly?: boolean;
  docOwnership: DocumentOwnership;
  url: string;
}

export default function TextEditor({ readOnly, docOwnership, url }: TextEditorProps) {
  const i18n = useTranslations();

  const tipsCtxt = React.useContext(TipsCtx);

  const { currentUser } = useCurrentUser();
  const displayName = getDisplayName(currentUser);

  const [floatingAnchorElem, setFloatingAnchorElem] = React.useState<HTMLDivElement | null>(null);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);

  const initialConfig = {
    namespace: `lexical-${docOwnership.ownerId}`,
    editorState: null,
    editable: !readOnly,
    nodes: [
      ExtendedTextNode,
      {
        replace: TextNode,
        with: (node: TextNode) => new ExtendedTextNode(node.__text, node.__key),
      },
      HeadingNode,
      ListNode,
      ListItemNode,
      AutoLinkNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      ImageNode,
      FileNode,
      MarkNode,
      CodeNode,
      QuoteNode,
      // CardLinkNode,
    ],
    theme,
    onError: (err: Error) => logger.error(err),
  };

  const onRef = React.useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  const webSocketProvider = React.useCallback(
    (id: string, yjsDocMap: Map<string, Doc>): Provider => {
      let doc = yjsDocMap.get(id);

      if (doc === undefined) {
        doc = new Doc();
        yjsDocMap.set(id, doc);
      } else {
        doc.load();
      }

      const wsProvider = new WebsocketProvider(url, 'colab' + '/' + id, doc, {
        connect: false,
        params: {
          ownerId: String(docOwnership.ownerId),
          kind: String(docOwnership.kind),
        },
      });

      wsProvider.on('status', (event: { status: string }) => {
        setIsConnected(event.status === 'connected');
      });

      return wsProvider as unknown as Provider;
    },
    [docOwnership.kind, docOwnership.ownerId, url],
  );

  return (
    <>
      {!isConnected && <InlineLoading />}
      <LexicalComposer initialConfig={initialConfig}>
        <div className={cx(editorContainerStyle, css({ display: isConnected ? 'flex' : 'none' }))}>
          <ToolbarPlugin {...docOwnership} />
          <div className={editorStyle}>
            <RichTextPlugin
              contentEditable={
                <div className={editorScrollerStyle}>
                  <div className={editorRefStyle} ref={onRef}>
                    <ContentEditable className={contentEditableStyle} />
                  </div>
                </div>
              }
              placeholder={
                <div className={cx(placeholderStyle, 'placeholderXY')}>
                  {i18n.modules.content.liveEditor.placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CollaborationPlugin
              id={`lexical-${docOwnership.ownerId}`}
              providerFactory={webSocketProvider}
              shouldBootstrap={true}
              username={displayName!}
            />
            <AutoFocusPlugin />
            <LinkPlugin />
            <ListPlugin />
            {/* we use a custom check list, because the one of lexical prevents space to be written on the text. 
            When pressing the space key, the box toggles between checked and unchecked, and the space is not written in text. */}
            <CustomCheckListPlugin />
            {/* <ClickableLinkPlugin /> // used to open a link when the user clicks on it */}
            <TablePlugin />
            <TableCellResizerPlugin />
            <ImagesPlugin />
            <FilesPlugin />
            {/* <CardLinkPlugin /> */}
            <TabIndentationPlugin />
            <MarkdownPlugin />
            {/* EmptinessSensorPlugin : to get when a text editor is empty */}
            <EmptinessSensorPlugin />
            {floatingAnchorElem && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <TableActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin anchorElement={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElement={floatingAnchorElem} />
                <FloatingFileMenuPlugin anchorElement={floatingAnchorElem} />
              </>
            )}
            {tipsCtxt.DEBUG.value && <TreeViewPlugin />}
          </div>
        </div>
      </LexicalComposer>
    </>
  );
}
