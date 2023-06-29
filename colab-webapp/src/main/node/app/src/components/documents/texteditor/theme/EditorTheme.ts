/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import type { EditorThemeClasses } from 'lexical';

import './EditorTheme.css';

const theme: EditorThemeClasses = {
  blockCursor: 'TextEditorTheme__blockCursor',
  characterLimit: 'TextEditorTheme__characterLimit',
  code: 'TextEditorTheme__code',
  codeHighlight: {
    atrule: 'TextEditorTheme__tokenAttr',
    attr: 'TextEditorTheme__tokenAttr',
    boolean: 'TextEditorTheme__tokenProperty',
    builtin: 'TextEditorTheme__tokenSelector',
    cdata: 'TextEditorTheme__tokenComment',
    char: 'TextEditorTheme__tokenSelector',
    class: 'TextEditorTheme__tokenFunction',
    'class-name': 'TextEditorTheme__tokenFunction',
    comment: 'TextEditorTheme__tokenComment',
    constant: 'TextEditorTheme__tokenProperty',
    deleted: 'TextEditorTheme__tokenProperty',
    doctype: 'TextEditorTheme__tokenComment',
    entity: 'TextEditorTheme__tokenOperator',
    function: 'TextEditorTheme__tokenFunction',
    important: 'TextEditorTheme__tokenVariable',
    inserted: 'TextEditorTheme__tokenSelector',
    keyword: 'TextEditorTheme__tokenAttr',
    namespace: 'TextEditorTheme__tokenVariable',
    number: 'TextEditorTheme__tokenProperty',
    operator: 'TextEditorTheme__tokenOperator',
    prolog: 'TextEditorTheme__tokenComment',
    property: 'TextEditorTheme__tokenProperty',
    punctuation: 'TextEditorTheme__tokenPunctuation',
    regex: 'TextEditorTheme__tokenVariable',
    selector: 'TextEditorTheme__tokenSelector',
    string: 'TextEditorTheme__tokenSelector',
    symbol: 'TextEditorTheme__tokenProperty',
    tag: 'TextEditorTheme__tokenProperty',
    url: 'TextEditorTheme__tokenOperator',
    variable: 'TextEditorTheme__tokenVariable',
  },
  embedBlock: {
    base: 'TextEditorTheme__embedBlock',
    focus: 'TextEditorTheme__embedBlockFocus',
  },
  hashtag: 'TextEditorTheme__hashtag',
  heading: {
    h1: 'TextEditorTheme__h1',
    h2: 'TextEditorTheme__h2',
    h3: 'TextEditorTheme__h3',
    h4: 'TextEditorTheme__h4',
    h5: 'TextEditorTheme__h5',
    h6: 'TextEditorTheme__h6',
  },
  image: 'editor-image',
  link: 'TextEditorTheme__link',
  list: {
    listitem: 'TextEditorTheme__listItem',
    listitemChecked: 'TextEditorTheme__listItemChecked',
    listitemUnchecked: 'TextEditorTheme__listItemUnchecked',
    nested: {
      listitem: 'TextEditorTheme__nestedListItem',
    },
    olDepth: [
      'TextEditorTheme__ol1',
      'TextEditorTheme__ol2',
      'TextEditorTheme__ol3',
      'TextEditorTheme__ol4',
      'TextEditorTheme__ol5',
    ],
    ul: 'TextEditorTheme__ul',
  },
  ltr: 'TextEditorTheme__ltr',
  mark: 'TextEditorTheme__mark',
  markOverlap: 'TextEditorTheme__markOverlap',
  paragraph: 'TextEditorTheme__paragraph',
  quote: 'TextEditorTheme__quote',
  rtl: 'TextEditorTheme__rtl',
  table: 'TextEditorTheme__table',
  tableAddColumns: 'TextEditorTheme__tableAddColumns',
  tableAddRows: 'TextEditorTheme__tableAddRows',
  tableCell: 'TextEditorTheme__tableCell',
  tableCellActionButton: 'TextEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer: 'TextEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'TextEditorTheme__tableCellEditing',
  tableCellHeader: 'TextEditorTheme__tableCellHeader',
  tableCellPrimarySelected: 'TextEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'TextEditorTheme__tableCellResizer',
  tableCellSelected: 'TextEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'TextEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'TextEditorTheme__tableCellResizeRuler',
  tableSelected: 'TextEditorTheme__tableSelected',
  text: {
    bold: 'TextEditorTheme__textBold',
    code: 'TextEditorTheme__textCode',
    italic: 'TextEditorTheme__textItalic',
    strikethrough: 'TextEditorTheme__textStrikethrough',
    subscript: 'TextEditorTheme__textSubscript',
    superscript: 'TextEditorTheme__textSuperscript',
    underline: 'TextEditorTheme__textUnderline',
    underlineStrikethrough: 'TextEditorTheme__textUnderlineStrikethrough',
  },
};

export default theme;
