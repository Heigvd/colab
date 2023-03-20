import { css, cx } from '@emotion/css';
import { $isCodeHighlightNode } from '@lexical/code';
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
import { getDOMRangeRect } from '../../utils/getDOMRangeRect';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { toolbarButtonStyle } from '../ToolbarPlugin/ToolbarPlugin';

const floatingTextFormatToolbarStyle = css({
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
}: {
  editor: LexicalEditor;
  anchorElement: HTMLElement;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
}) {
  const floatingToolbarRef = React.useRef<HTMLDivElement | null>(null);

  function mouseMoveListener(e: MouseEvent) {
    if (floatingToolbarRef?.current && (e.buttons === 1 || e.buttons === 3)) {
      floatingToolbarRef.current.style.pointerEvents = 'none';
    }
  }
  function mouseUpListener(e: MouseEvent) {
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
    <div ref={floatingToolbarRef} className={floatingTextFormatToolbarStyle}>
      {editor.isEditable() && (
        <>
          <button
            className={cx(isBold ? 'active' : '', toolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
          >
            B
          </button>
          <button
            className={cx(isItalic ? 'active' : '', toolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
          >
            I
          </button>
          <button
            className={cx(isUnderline ? 'active' : '', toolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
          >
            U
          </button>
          <button
            className={cx(isStrikethrough ? 'active' : '', toolbarButtonStyle)}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
          >
            S
          </button>
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

  const updatePopup = React.useCallback(() => {
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
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText) return null;

  return createPortal(
    <FloatingTextFormatToolbar
      editor={editor}
      anchorElement={anchorElement}
      isBold={isBold}
      isItalic={isItalic}
      isUnderline={isUnderline}
      isStrikethrough={isStrikethrough}
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
