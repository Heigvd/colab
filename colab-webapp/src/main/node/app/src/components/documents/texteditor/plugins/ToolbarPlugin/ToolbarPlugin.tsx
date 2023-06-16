/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  LexicalCommand,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import useTranslations from '../../../../../i18n/I18nContext';
import {
  activeIconButtonInnerStyle,
  ghostIconButtonStyle,
  iconButtonStyle,
  p_xs,
  space_2xs,
} from '../../../../../styling/style';
import { projectColors } from '../../../../../styling/theme';
import IconButton from '../../../../common/element/IconButton';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { DocumentOwnership } from '../../../documentCommonType';
import useModal from '../../hooks/useModal';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { InsertFileDialog } from '../FilesPlugin';
import { InsertImageDialog } from '../ImagesPlugin';
import { InsertTableDialog } from '../TablePlugin/TablePlugin';
import ConverterPlugin from './Converter';
import { BlockFormatDropDown, blockTypeToBlockName } from './FormatDropDown';
import ListDropDown, { listTypeToListName } from './ListDropDown';
import TextAlignDropDown from './TextAlignDropDown';

const dividerStyleHorizontal = css({
  width: '1px',
  alignSelf: 'stretch',
  backgroundColor: 'var(--divider-main)',
  margin: '0 4px',
});
const dividerStyleVertical = css({
  height: '1px',
  justifySelf: 'stretch',
  backgroundColor: 'var(--divider-main)',
  margin: '0 4px',
});

interface DividerProps {
  isHorizontal?: boolean;
}

export function Divider({ isHorizontal = true }: DividerProps): JSX.Element {
  return <div className={isHorizontal ? dividerStyleHorizontal : dividerStyleVertical} />;
}

const toolbarStyle = cx(
  p_xs,
  css({
    borderBottom: '1px solid var(--divider-main)',
    marginBottom: space_2xs,
    background: 'var(--bg-primary)',
    overflowX: 'auto',
    overflowY: 'hidden',
    height: '42px',
    minHeight: '42px',
    position: 'sticky',
    top: '0',
    zIndex: '20',
  }),
);

export const toolbarButtonStyle = css({
  border: '0',
  display: 'flex',
  background: 'none',
  borderRadius: '10px',
  padding: '8px',
  cursor: 'pointer',
  verticalAlign: 'middle',
  flexShrink: '0',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:disabled': {
    cursor: 'not-allowed',
  },
  '&:hover:not(:disabled)': {
    backgroundColor: '#eee',
  },
  '&.active': {
    //background: '#dfe8fa4d',
    ...activeIconButtonInnerStyle,
  },
});

export const activeToolbarButtonStyle = cx(
  p_xs,
  css({
    '&.active': {
      ...activeIconButtonInnerStyle,
    },
  }),
);

export const TOGGLE_LINK_MENU_COMMAND: LexicalCommand<string> = createCommand();

export default function ToolbarPlugin(docOwnership: DocumentOwnership) {
  const docId = docOwnership.ownerId;
  const i18n = useTranslations();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isEditable, setIsEditable] = React.useState(() => editor.isEditable());

  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const [, setSelectedElementKey] = React.useState<NodeKey | null>(null);
  const [blockType, setBlockType] = React.useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [alignment, setAlignment] = React.useState<ElementFormatType>('left');
  const [listType, setListType] = React.useState<keyof typeof listTypeToListName>('paragraph');
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);

  const [textColor, setTextColor] = React.useState<string>('');
  const [bgColor, setBgColor] = React.useState<string>('');

  const [modal, showModal] = useModal();
  const [isLink, setIsLink] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();

    // if selection is a range
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      // if element is null
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update color format
      setTextColor($getSelectionStyleValueForProperty(selection, 'color', ''));
      setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', ''));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setListType(type);
        } else {
          const align = element.getFormatType();
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if (type in listTypeToListName) {
            setListType(type as keyof typeof listTypeToListName);
          }
          setAlignment(align);
        }
      }
      // Todo Handle buttons
    }
  }, [activeEditor]);

  // Resets toolbar when selection or edit or changes
  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  // Enable undo / redo commands on editor
  // React.useEffect(() => {
  //   return mergeRegister(
  //     editor.registerEditableListener(editable => {
  //       setIsEditable(editable);
  //     }),
  //     activeEditor.registerUpdateListener(({ editorState }) => {
  //       editorState.read(() => {
  //         updateToolbar();
  //       });
  //     }),
  //     activeEditor.registerCommand<boolean>(
  //       CAN_UNDO_COMMAND,
  //       payload => {
  //         setCanUndo(payload);
  //         return false;
  //       },
  //       COMMAND_PRIORITY_CRITICAL,
  //     ),
  //     activeEditor.registerCommand<boolean>(
  //       CAN_REDO_COMMAND,
  //       payload => {
  //         setCanRedo(payload);
  //         return false;
  //       },
  //       COMMAND_PRIORITY_CRITICAL,
  //     ),
  //   );
  // }, [activeEditor, editor, updateToolbar]);

  const clearFormatting = React.useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          if ($isTextNode(node)) {
            if (idx === 0 && anchor.offset !== 0) {
              // eslint-disable-next-line no-param-reassign
              node = node.splitText(anchor.offset)[1] || node;
            }
            if (idx === nodes.length - 1) {
              // eslint-disable-next-line no-param-reassign
              node = node.splitText(focus.offset)[0] || node;
            }

            if (node.__style !== '') {
              node.setStyle('');
            }
            if (node.__format !== 0) {
              node.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(node).setFormat('');
            }
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
      updateToolbar();
    });
  }, [activeEditor, updateToolbar]);

  // Apply currently selected styles (text color or background color)
  const applyStyleText = React.useCallback(
    (styles: Record<string, string | null>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  // apply selected text color
  const onTextColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ color: value === '#000000' ? null : value });
    },
    [applyStyleText],
  );

  // apply selected background color
  const onBgColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ 'background-color': value === '#ffffff' ? null : value });
    },
    [applyStyleText],
  );

  const insertLink = React.useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_MENU_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <Flex align="center" className={cx(toolbarStyle, 'toolbar')}>
      {/* <IconButton
        icon={'undo'}
        iconSize="xs"
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className={activeToolbarButtonStyle}
        title={'Undo (Ctrl+Z)'}
        aria-label="Undo"
      />
      <IconButton
        icon={'redo'}
        iconSize="xs"
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className={activeToolbarButtonStyle}
        title={'Redo (Ctrl+Y)'}
        aria-label="Redo"
      />
      <Divider /> */}
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
          <Divider />
        </>
      )}
      <IconButton
        icon={'format_bold'}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={cx(isBold ? 'active' : '', activeToolbarButtonStyle, ghostIconButtonStyle)}
        title={i18n.modules.content.textFormat.boldSC}
        aria-label={i18n.modules.content.textFormat.formatBold}
      />
      <IconButton
        icon={'format_italic'}
        className={cx(isItalic ? 'active' : '', activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        title={i18n.modules.content.textFormat.italicSC}
        aria-label={i18n.modules.content.textFormat.formatItalic}
      />
      <IconButton
        icon={'format_underlined'}
        className={cx(isUnderline ? 'active' : '', activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        title={i18n.modules.content.textFormat.underlineSC}
        aria-label={i18n.modules.content.textFormat.formatUnderline}
      />
      <IconButton
        icon={'strikethrough_s'}
        className={cx(
          isStrikethrough ? 'active' : '',
          activeToolbarButtonStyle,
          ghostIconButtonStyle,
        )}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        title={i18n.modules.content.textFormat.strikeText}
        aria-label={i18n.modules.content.textFormat.formatAsStrike}
      />
      <IconButton
        icon={'replay'}
        iconSize="xs"
        className={cx(activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={clearFormatting}
        title={i18n.modules.content.textFormat.clearStyles}
        aria-label={i18n.modules.content.textFormat.clearStyles}
      />
      <Divider />
      <DropDownMenu
        entries={[
          {
            value: 'color',
            label: (
              <>
                <TwitterPicker
                  colors={[
                    projectColors.yellow,
                    projectColors.green,
                    projectColors.blue,
                    projectColors.purple,
                    projectColors.pink,
                    projectColors.red,
                    projectColors.orange,
                    '#000',
                  ]}
                  color="white"
                  triangle="hide"
                  onChange={newColor => {
                    onTextColorSelect(newColor.hex);
                  }}
                  styles={{
                    default: { swatch: { boxShadow: 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.1)' } },
                  }}
                />
              </>
            ),
            action: () => {},
          },
        ]}
        disabled={false}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle)}
        buttonLabel={
          <Icon
            opsz={'xs'}
            icon={'format_color_text'}
            color={textColor === '#000000' ? 'inherit' : textColor}
          />
        }
        menuIcon={'CARET'}
      />
      <DropDownMenu
        entries={[
          {
            value: 'color',
            label: (
              <>
                <TwitterPicker
                  colors={[
                    projectColors.yellow,
                    projectColors.green,
                    projectColors.blue,
                    projectColors.purple,
                    projectColors.pink,
                    projectColors.red,
                    projectColors.orange,
                    '#FFF',
                  ]}
                  color="white"
                  triangle="hide"
                  onChange={newColor => {
                    onBgColorSelect(newColor.hex);
                  }}
                  styles={{
                    default: { swatch: { boxShadow: 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.1)' } },
                  }}
                />
              </>
            ),
            action: () => {},
          },
        ]}
        disabled={false}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle)}
        buttonLabel={
          <Icon
            opsz={'xs'}
            icon={'format_color_fill'}
            color={bgColor === '#ffffff' ? 'inherit' : bgColor}
          />
        }
        menuIcon={'CARET'}
      />
      <Divider />
      {activeEditor === editor && (
        <>
          <TextAlignDropDown editor={editor} alignment={alignment} />
        </>
      )}
      {activeEditor === editor && (
        <>
          <ListDropDown editor={editor} listType={listType} />
          <Divider />
        </>
      )}
      <IconButton
        icon={'link'}
        iconSize="xs"
        className={cx(isLink ? 'active' : '', activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={insertLink}
        title={i18n.modules.content.insertLink}
        aria-label={i18n.modules.content.insertLink}
      />
      <Divider />
      <IconButton
        icon={'image'}
        iconSize="xs"
        className={cx('toolbar-item spaced ' + activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          showModal('Insert Image', onClose => (
            <InsertImageDialog activeEditor={activeEditor} onClose={onClose} docId={docId} />
          ));
        }}
        title={i18n.modules.content.insertImage}
        aria-label={i18n.modules.content.insertImage}
      />
      <IconButton
        icon={'description'}
        iconSize="xs"
        className={cx('toolbar-item spaced ', activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          showModal('Insert File', onClose => (
            <InsertFileDialog activeEditor={activeEditor} onClose={onClose} docId={docId} />
          ));
        }}
        title={i18n.modules.content.insertImage}
        aria-label={i18n.modules.content.insertImage}
      />
      <IconButton
        icon={'table'}
        iconSize="xs"
        className={cx(activeToolbarButtonStyle, ghostIconButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          showModal(i18n.modules.content.insertTable, onClose => (
            <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
        title={i18n.modules.content.insertTable}
        aria-label={i18n.modules.content.insertTable}
      />
      <Divider />
      <ConverterPlugin {...docOwnership} />
      {modal}
    </Flex>
  );
}
