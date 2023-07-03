/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as React from 'react';
import logger from '../../../../../logger';
import IconButton from '../../../../common/element/IconButton';
import { activeToolbarButtonStyle } from './ToolbarPlugin';

export default function JsonExporterPlugin() {
  const [editor] = useLexicalComposerContext();

  const exportToJson = React.useCallback(() => {
    logger.info(JSON.stringify(editor.getEditorState().toJSON()));
  }, [editor]);

  return (
    <IconButton
      icon={'read_more'}
      iconSize="xs"
      title={'export to JSON into the console'}
      onClick={exportToJson}
      className={activeToolbarButtonStyle}
      aria-label="Export to JSON into the console"
    />
  );
}
