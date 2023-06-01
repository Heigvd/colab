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
import useTranslations from '../../../../i18n/I18nContext';
import Button from '../../../common/element/Button';
import { LabeledInput } from '../../../common/element/Input';

import { sanitizeUrl, validateUrl } from '../utils/url';

export function InsertLinkDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const i18n = useTranslations();
  const [link, setLink] = useState('https://');

  const onClick = () => {
    activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(link));
    onClose();
  };

  return (
    <>
      <LabeledInput label="Link" onChange={setLink} value={link} />
      <Button onClick={onClick}>{i18n.common.ok}</Button>
    </>
  );
}

export default function LinkPlugin(): JSX.Element {
  return <LexicalLinkPlugin validateUrl={validateUrl} />;
}
