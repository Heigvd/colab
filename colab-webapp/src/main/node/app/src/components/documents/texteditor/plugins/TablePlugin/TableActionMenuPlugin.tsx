/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import {
  $deleteTableColumn,
  $getElementGridForTableNode,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn,
  $insertTableRow,
  $isTableCellNode,
  $isTableRowNode,
  $removeTableRowAtIndex,
  getTableSelectionFromTableElement,
  HTMLTableElementWithWithTableSelectionState,
  TableCellHeaderStates,
  TableCellNode,
} from '@lexical/table';
import { $getRoot, $getSelection, $isRangeSelection, DEPRECATED_$isGridSelection } from 'lexical';
import * as React from 'react';
import { ReactPortal, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import IconButton from '../../../../common/element/IconButton';
import { ddOptionsBodyStyle, entryStyle } from '../../../../common/layout/DropDownMenu';
import { lightMode } from '../../../../styling/theme';
import { Divider } from '../ToolbarPlugin/ToolbarPlugin';

const dropdownStyle = cx(
  ddOptionsBodyStyle,
  css({
    position: 'fixed',
    display: 'block',
    zIndex: 10,
  }),
);
const tableActionMenuStyle = css({
  position: 'absolute',
  top: '0',
  left: '0',
  willChange: 'transform',
});
const tableActionButtonStyle = css({
  width: '20px',
  height: '20px',
  backgroundColor: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '0',
  position: 'relative',
  borderRadius: '15px',
  color: '#222',
  cursor: 'pointer',
});

type TableCellActionMenuProps = Readonly<{
  contextRef: { current: null | HTMLElement };
  onClose: () => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  tableCellNode: TableCellNode;
}>;

function TableActionMenu({
  onClose,
  tableCellNode: _tableCellNode,
  setIsMenuOpen,
  contextRef,
}: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const [selectionCounts, updateSelectionCounts] = useState({
    columns: 1,
    rows: 1,
  });

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, nodeMutations => {
      const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === 'updated';

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest());
        });
      }
    });
  }, [editor, tableCellNode]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (DEPRECATED_$isGridSelection(selection)) {
        const selectionShape = selection.getShape();

        updateSelectionCounts({
          columns: selectionShape.toX - selectionShape.fromX + 1,
          rows: selectionShape.toY - selectionShape.fromY + 1,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const menuButtonElement = contextRef.current;
    const dropDownElement = dropDownRef.current;

    if (menuButtonElement != null && dropDownElement != null) {
      const menuButtonRect = menuButtonElement.getBoundingClientRect();

      dropDownElement.style.opacity = '1';

      dropDownElement.style.left = `${
        menuButtonRect.left + menuButtonRect.width + window.pageXOffset + 5
      }px`;

      dropDownElement.style.top = `${menuButtonRect.top + window.pageYOffset}px`;
    }
  }, [contextRef, dropDownRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownRef.current != null &&
        contextRef.current != null &&
        !dropDownRef.current.contains(event.target as Node) &&
        !contextRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('click', handleClickOutside);

    return () => window.removeEventListener('click', handleClickOutside);
  }, [setIsMenuOpen, contextRef]);

  const clearTableSelection = useCallback(() => {
    editor.update(() => {
      if (tableCellNode.isAttached()) {
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
        const tableElement = editor.getElementByKey(
          tableNode.getKey(),
        ) as HTMLTableElementWithWithTableSelectionState;

        if (!tableElement) {
          throw new Error('Expected to find tableElement in DOM');
        }

        const tableSelection = getTableSelectionFromTableElement(tableElement);
        if (tableSelection !== null) {
          tableSelection.clearHighlight();
        }

        tableNode.markDirty();
        updateTableCellNode(tableCellNode.getLatest());
      }

      const rootNode = $getRoot();
      rootNode.selectStart();
    });
  }, [editor, tableCellNode]);

  const insertTableRowAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        const selection = $getSelection();

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

        let tableRowIndex;

        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape();
          tableRowIndex = shouldInsertAfter ? selectionShape.toY : selectionShape.fromY;
        } else {
          tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);
        }

        const grid = $getElementGridForTableNode(editor, tableNode);

        $insertTableRow(tableNode, tableRowIndex, shouldInsertAfter, selectionCounts.rows, grid);

        clearTableSelection();

        onClose();
      });
    },
    [editor, tableCellNode, selectionCounts.rows, clearTableSelection, onClose],
  );

  const insertTableColumnAtSelection = useCallback(
    (shouldInsertAfter: boolean) => {
      editor.update(() => {
        const selection = $getSelection();

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

        let tableColumnIndex;

        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape();
          tableColumnIndex = shouldInsertAfter ? selectionShape.toX : selectionShape.fromX;
        } else {
          tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);
        }

        const grid = $getElementGridForTableNode(editor, tableNode);

        $insertTableColumn(
          tableNode,
          tableColumnIndex,
          shouldInsertAfter,
          selectionCounts.columns,
          grid,
        );

        clearTableSelection();

        onClose();
      });
    },
    [editor, tableCellNode, selectionCounts.columns, clearTableSelection, onClose],
  );

  const deleteTableRowAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      $removeTableRowAtIndex(tableNode, tableRowIndex);

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
      tableNode.remove();

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const deleteTableColumnAtSelection = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);

      $deleteTableColumn(tableNode, tableColumnIndex);

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableRowIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.');
      }

      const tableRow = tableRows[tableRowIndex];

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row');
      }

      tableRow.getChildren().forEach(tableCell => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.ROW);
      });

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  const toggleTableColumnIsHeader = useCallback(() => {
    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);

      const tableRows = tableNode.getChildren();

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r];

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row');
        }

        const tableCells = tableRow.getChildren();

        if (tableColumnIndex >= tableCells.length || tableColumnIndex < 0) {
          throw new Error('Expected table cell to be inside of table row.');
        }

        const tableCell = tableCells[tableColumnIndex];

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell');
        }

        tableCell.toggleHeaderStyle(TableCellHeaderStates.COLUMN);
      }

      clearTableSelection();
      onClose();
    });
  }, [editor, tableCellNode, clearTableSelection, onClose]);

  return createPortal(
    <div
      className={cx(
        lightMode,
        ddOptionsBodyStyle,
        css({ alignItems: 'stretch', display: 'flex', flexDirection: 'column' }),
      )}
      ref={dropDownRef}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <button
        className={cx(lightMode, entryStyle)}
        onClick={() => insertTableRowAtSelection(false)}
      >
        <span className="text">
          Insert {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} above
        </span>
      </button>
      <button className={entryStyle} onClick={() => insertTableRowAtSelection(true)}>
        <span className="text">
          Insert {selectionCounts.rows === 1 ? 'row' : `${selectionCounts.rows} rows`} below
        </span>
      </button>
      <Divider isHorizontal={false} />
      <button className={entryStyle} onClick={() => insertTableColumnAtSelection(false)}>
        <span className="text">
          Insert {selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`}{' '}
          left
        </span>
      </button>
      <button className={entryStyle} onClick={() => insertTableColumnAtSelection(true)}>
        <span className="text">
          Insert {selectionCounts.columns === 1 ? 'column' : `${selectionCounts.columns} columns`}{' '}
          right
        </span>
      </button>
      <Divider isHorizontal={false} />
      <button className={entryStyle} onClick={() => deleteTableColumnAtSelection()}>
        <span className="text">Delete column</span>
      </button>
      <button className={entryStyle} onClick={() => deleteTableRowAtSelection()}>
        <span className="text">Delete row</span>
      </button>
      <button className={entryStyle} onClick={() => deleteTableAtSelection()}>
        <span className="text">Delete table</span>
      </button>
      <Divider isHorizontal={false} />
      <button className={entryStyle} onClick={() => toggleTableRowIsHeader()}>
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.ROW) === TableCellHeaderStates.ROW
            ? 'Remove'
            : 'Add'}{' '}
          row header
        </span>
      </button>
      <button className={entryStyle} onClick={() => toggleTableColumnIsHeader()}>
        <span className="text">
          {(tableCellNode.__headerState & TableCellHeaderStates.COLUMN) ===
          TableCellHeaderStates.COLUMN
            ? 'Remove'
            : 'Add'}{' '}
          column header
        </span>
      </button>
    </div>,
    document.body,
  );
}

function TableCellActionMenuContainer({ anchorElem }: { anchorElem: HTMLElement }): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);
  const menuRootRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(null);

  const moveMenu = useCallback(() => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (selection == null || menu == null) {
      setTableMenuCellNode(null);
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
        selection.anchor.getNode(),
      );

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null);
        return;
      }

      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if (!activeElement) {
      setTableMenuCellNode(null);
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        moveMenu();
      });
    });
  });

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
        const menuRect = menuButtonDOM.getBoundingClientRect();
        const anchorRect = anchorElem.getBoundingClientRect();

        const top = tableCellRect.top - anchorRect.top + 4;
        const left = tableCellRect.right - menuRect.width - 10 - anchorRect.left;

        menuButtonDOM.style.opacity = '1';
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
      } else {
        menuButtonDOM.style.opacity = '0';
        menuButtonDOM.style.transform = 'translate(-10000px, -10000px)';
      }
    }
  }, [menuButtonRef, tableCellNode, editor, anchorElem]);

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      setIsMenuOpen(false);
    }

    prevTableCellDOM.current = tableCellNode;
  }, [prevTableCellDOM, tableCellNode]);

  return (
    <div className={tableActionMenuStyle} ref={menuButtonRef}>
      {tableCellNode != null && (
        <>
          <div ref={menuRootRef}>
            <IconButton
              icon={'expand_more'}
              variant="ghost"
              iconSize="xs"
              className={tableActionButtonStyle}
              title={'Show more'}
              onClick={e => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            />
          </div>
          {isMenuOpen && (
            <TableActionMenu
              contextRef={menuRootRef}
              setIsMenuOpen={setIsMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              tableCellNode={tableCellNode}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function TableActionMenuPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): null | ReactPortal {
  const isEditable = useLexicalEditable();
  return createPortal(
    isEditable ? <TableCellActionMenuContainer anchorElem={anchorElem} /> : null,
    anchorElem,
  );
}
