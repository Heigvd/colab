import { css, cx } from '@emotion/css';
import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../../../../../i18n/I18nContext';
import IconButton from '../../../../common/element/IconButton';
import { getDOMRangeRect } from '../../utils/getDOMRangeRect';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { activeToolbarButtonStyle, TOGGLE_LINK_MENU_COMMAND } from '../ToolbarPlugin/ToolbarPlugin';

export const floatingToolbarStyle = css({
  display: 'flex',
  background: '#fff',
  padding: '4px',
  verticalAlign: 'middle',
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: '10',
  opacity: '0',
  backgroundColor: '#fff',
  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.3)',
  borderRadius: '8px',
  transition: 'opacity 0.5s',
  height: '35px',
  willChange: 'transform',
});

function FloatingTextFormatToolbar({
  editor,
  anchorElement,
  isBold,
  isItalic,
  isUnderline,
  isStrikethrough,
  isLink,
}: {
  editor: LexicalEditor;
  anchorElement: HTMLElement;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isLink: boolean;
}) {
  const floatingToolbarRef = React.useRef<HTMLDivElement | null>(null);

  const insertLink = React.useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_MENU_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const i18n = useTranslations();
  function mouseMoveListener(e: MouseEvent) {
    if (floatingToolbarRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      floatingToolbarRef.current.style.pointerEvents = 'none';
    }
  }
  function mouseUpListener() {
    if (floatingToolbarRef?.current) {
      floatingToolbarRef.current.style.pointerEvents = 'auto';
    }
  }

  React.useEffect(() => {
    if (floatingToolbarRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      };
    }
  }, [floatingToolbarRef]);

  const updateTextFormatFloatingToolbar = React.useCallback(() => {
    const selection = $getSelection();

    const floatingToolbarElem = floatingToolbarRef.current;
    const nativeSelection = window.getSelection();

    if (floatingToolbarElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, floatingToolbarElem, anchorElement);
    }
  }, [editor, anchorElement]);

  React.useEffect(() => {
    const scrollerElem = anchorElement.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, updateTextFormatFloatingToolbar, anchorElement]);

  React.useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateTextFormatFloatingToolbar]);
  return (
    <div ref={floatingToolbarRef} className={floatingToolbarStyle}>
      {editor.isEditable() && (
        <>
          <IconButton
            icon={'format_bold'}
            iconSize="xs"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            className={cx(isBold ? 'active' : '', activeToolbarButtonStyle)}
            title={i18n.modules.content.textFormat.boldSC}
            aria-label={i18n.modules.content.textFormat.formatBold}
          />
          <IconButton
            icon={'format_italic'}
            iconSize="xs"
            className={cx(isItalic ? 'active' : '', activeToolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            title={i18n.modules.content.textFormat.italicSC}
            aria-label={i18n.modules.content.textFormat.formatItalic}
          />
          <IconButton
            icon={'format_underlined'}
            iconSize="xs"
            className={cx(isUnderline ? 'active' : '', activeToolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            title={i18n.modules.content.textFormat.underlineSC}
            aria-label={i18n.modules.content.textFormat.formatUnderline}
          />
          <IconButton
            icon={'strikethrough_s'}
            iconSize="xs"
            className={cx(isStrikethrough ? 'active' : '', activeToolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            title={i18n.modules.content.textFormat.strikeText}
            aria-label={i18n.modules.content.textFormat.formatAsStrike}
          />
          <IconButton
            icon={'link'}
            iconSize="xs"
            className={cx(isLink ? 'active' : '', activeToolbarButtonStyle)}
            onClick={insertLink}
            title={i18n.modules.content.insertLink}
            aria-label={i18n.modules.content.addLink}
          />
        </>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
): JSX.Element | null {
  const [isText, setIsText] = React.useState<boolean>(false);
  const [isBold, setIsBold] = React.useState<boolean>(false);
  const [isItalic, setIsItalic] = React.useState<boolean>(false);
  const [isUnderline, setIsUnderline] = React.useState<boolean>(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState<boolean>(false);
  const [isLink, setIsLink] = React.useState<boolean>(false);

  const updateToolbar = React.useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return;
      }

      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) return;

      const node = getSelectedNode(selection);

      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
        setIsText($isTextNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  React.useEffect(() => {
    document.addEventListener('selectionchange', updateToolbar);
    return () => {
      document.removeEventListener('selectionchange', updateToolbar);
    };
  }, [updateToolbar]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateToolbar();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updateToolbar]);

  if (!isText || isLink) return null;

  return createPortal(
    <FloatingTextFormatToolbar
      editor={editor}
      anchorElement={anchorElement}
      isBold={isBold}
      isItalic={isItalic}
      isUnderline={isUnderline}
      isStrikethrough={isStrikethrough}
      isLink={isLink}
    />,
    anchorElement,
  );
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElement = document.body,
}: {
  anchorElement?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElement);
}
