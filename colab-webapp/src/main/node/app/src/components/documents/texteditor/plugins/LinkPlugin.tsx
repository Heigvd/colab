/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalEditor } from 'lexical';
import * as React from 'react';
import { useState } from 'react';
import Button from '../../../common/element/Button';
import { DialogActions } from '../ui/Dialog';
import TextInput from '../ui/TextInput';

import { sanitizeUrl, validateUrl } from '../utils/url';

export function InsertLinkDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [link, setLink] = useState('https://');

  const onClick = () => {
    activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(link));
    onClose();
  };

  return (
    <>
      <TextInput label="Link" onChange={setLink} value={link} />
      <DialogActions data-test-id="table-model-confirm-insert">
        <Button onClick={onClick}>Confirm</Button>
      </DialogActions>
    </>
  );
}

export default function LinkPlugin(): JSX.Element {
  return <LexicalLinkPlugin validateUrl={validateUrl} />;
}
