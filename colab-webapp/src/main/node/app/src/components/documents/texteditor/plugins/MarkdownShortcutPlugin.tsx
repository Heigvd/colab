/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { ELEMENT_TRANSFORMERS, TEXT_FORMAT_TRANSFORMERS, Transformer } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import * as React from 'react';

const TRANSFORMERS: Array<Transformer> = [...ELEMENT_TRANSFORMERS, ...TEXT_FORMAT_TRANSFORMERS];

export default function MarkdownPlugin(): JSX.Element {
  return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
