/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { $createLinkNode } from '@lexical/link';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ExternalLink } from 'colab-rest-client';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import * as React from 'react';
import * as API from '../../../../../API/api';
import logger from '../../../../../logger';
import { useAndLoadDocuments } from '../../../../../store/selectors/documentSelector';
import IconButton from '../../../../common/element/IconButton';
import { DocumentOwnership } from '../../../documentCommonType';
import { activeToolbarButtonStyle } from './ToolbarPlugin';

logger.setLevel(4);

export default function ConverterPlugin(docOwnership: DocumentOwnership) {
  const [editor] = useLexicalComposerContext();
  const { documents, status } = useAndLoadDocuments(docOwnership);

  React.useEffect(() => {
    logger.info('useEff');
  });

  const convertTextBlocks = (texts: string[]) => {
    const text = texts.join('\n\n');
    editor.update(() => {
      $convertFromMarkdownString(text);
    });
  };

  const convertToLinkNode = (url: string, name?: string) => {
    editor.update(() => {
      const root = $getRoot();
      const linkNode = $createLinkNode(url);
      const paragraphNode = $createParagraphNode();

      const text = name ?? url;
      linkNode.append($createTextNode(text));
      paragraphNode.append(linkNode);
      root.append(paragraphNode);
    });
  };

  interface linkNodes {
    url: string;
    name?: string;
  }

  const convertToLinkNodes = (array: linkNodes[]) => {
    editor.update(() => {
      const root = $getRoot();
      const paragraphNode = $createParagraphNode();
      for (const entry of array) {
        const linkNode = $createLinkNode(entry.url);
        const text = entry.name ?? entry.url;
        linkNode.append($createTextNode(text));
        paragraphNode.append(linkNode);
        root.append(paragraphNode);
      }
    });
  };

  const onClickHandler = () => {
    if (status === 'READY') {
      const textData = [];
      const fileData = [];
      const linkData = [];
      for (const doc of documents) {
        switch (doc['@class']) {
          case 'TextDataBlock':
            logger.debug('TextDataBlock convertion');
            if (doc.textData) {
              textData.push(doc.textData);
            }
            break;
          case 'DocumentFile':
            logger.debug('DocumentFile convertion');
            if (doc.id && doc.fileName) {
              const url = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(doc.id);
              fileData.push({ url: url, name: doc.fileName });
            }
            break;
          case 'ExternalLink':
            logger.debug('ExternalLink convertion');
            if ((doc as ExternalLink).url) {
              const url = (doc as ExternalLink).url;
              if (url!.length > 0) {
                linkData.push({ url: url! });
              }
            }
            break;
        }
      }
      logger.info('textData', textData);
      convertTextBlocks(textData);
      convertToLinkNodes(fileData);
      convertToLinkNodes(linkData);
    }
  };

  return (
    <IconButton
      icon={'skateboarding'}
      iconSize="xs"
      title={'Convert old documents'}
      onClick={onClickHandler}
      className={activeToolbarButtonStyle}
      aria-label="Convert old documents"
      disabled={status !== 'READY'}
    />
  );
}
