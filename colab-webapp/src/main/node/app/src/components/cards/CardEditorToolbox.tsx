/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { DocumentContext } from '../documents/documentCommonType';
import DocumentCreatorButton from '../documents/DocumentCreatorButton';
import { space_S } from '../styling/style';

const toolboxContainerStyle = css({
  height: 'auto',
  maxHeight: '400px',
  overflow: 'hidden',
  padding: space_S,
  transition: 'all .5s ease',
  borderBottom: '2px solid var(--darkGray)',
});

const closedToolboxStyle = css({
  maxHeight: '0px',
  paddingTop: '0px',
  paddingBottom: '0px',
});

const borderRightStyle = css({
  paddingRight: space_S,
  marginRight: space_S,
  borderRight: '1px solid var(--lightGray)',
});

const toolboxButtonStyle = css({
  paddingRight: space_S,
  margin: space_S,
});

interface Props {
  open: boolean;
  context: DocumentContext;
  //selected: Document;
  prefixElement?: React.ReactNode;
}

export default function CardEditorToolbox({ open, context, prefixElement }: Props): JSX.Element {
  const blockSelected = 'Document'; 
  return (
    <Flex align="center" className={cx(toolboxContainerStyle, { [closedToolboxStyle]: !open })}>
      {prefixElement}
      <BlockCreatorButtons context={context} blockSelected={blockSelected} />
      <IconButton icon={faPen} title="edit block" className={toolboxButtonStyle} />
      <IconButton icon={faTrash} title="delete block" className={toolboxButtonStyle} />
    </Flex>
  );
}

interface BlockButtonsProps {
  context: DocumentContext;
  blockSelected: string;
}

export function BlockCreatorButtons({ context, blockSelected }: BlockButtonsProps): JSX.Element {
  return (
    <>
      <Flex className={
        cx({[borderRightStyle]: blockSelected != (null || undefined)})
      }>
        <DocumentCreatorButton
          context={context}
          docKind="TextDataBlock"
          title="add a text block"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          context={context}
          docKind="DocumentFile"
          title="add a file"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          context={context}
          docKind="ExternalLink"
          title="add a link"
          className={toolboxButtonStyle}
        />
      </Flex>
    </>
  );
}
