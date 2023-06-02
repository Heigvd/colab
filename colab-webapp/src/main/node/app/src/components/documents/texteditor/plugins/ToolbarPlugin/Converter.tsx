/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { $createLinkNode } from '@lexical/link';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { entityIs, ExternalLink } from 'colab-rest-client';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import * as React from 'react';
import * as API from '../../../../../API/api';
import { useAppDispatch } from '../../../../../store/hooks';
import { useCardContent } from '../../../../../store/selectors/cardSelector';
import { useAndLoadDocuments } from '../../../../../store/selectors/documentSelector';
import { useResource } from '../../../../../store/selectors/resourceSelector';
import IconButton from '../../../../common/element/IconButton';
import { DocumentOwnership } from '../../../documentCommonType';
import { activeToolbarButtonStyle } from './ToolbarPlugin';

export default function ConverterPlugin(docOwnership: DocumentOwnership) {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();
  const { documents, status } = useAndLoadDocuments(docOwnership);

  const cardContent = useCardContent(docOwnership.ownerId);
  const { resource } = useResource(docOwnership.ownerId);

  const [isConverting, setIsConverting] = React.useState(false);

  const sortedDocuments = React.useMemo(() => {
    return documents.sort((a, b) => (a.index || 0) - (b.index || 0));
  }, [documents]);

  const convertTextBlocks = React.useCallback(
    (texts: string[]) => {
      const text = texts.join('\n\n');
      editor.update(() => {
        $convertFromMarkdownString(text);
      });
    },
    [editor],
  );

  interface linkNodes {
    url: string;
    name?: string;
  }

  const convertToLinkNodes = React.useCallback(
    (array: linkNodes[]) => {
      editor.update(() => {
        const root = $getRoot();
        for (const entry of array) {
          const paragraphNode = $createParagraphNode();
          const linkNode = $createLinkNode(entry.url);
          const text = entry.name ?? entry.url;
          linkNode.append($createTextNode(text));
          paragraphNode.append(linkNode);
          root.append(paragraphNode);
        }
      });
    },
    [editor],
  );

  const doConvert = React.useCallback(() => {
    if (!isConverting) {
      setIsConverting(true);
      const textData = [];
      const fileData = [];
      const linkData = [];
      for (const doc of sortedDocuments) {
        switch (doc['@class']) {
          case 'TextDataBlock':
            if (doc.textData) {
              textData.push(doc.textData);
            }
            break;
          case 'DocumentFile':
            if (doc.id && doc.fileName) {
              const url = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(doc.id);
              fileData.push({ url: url, name: doc.fileName });
            }
            break;
          case 'ExternalLink':
            if ((doc as ExternalLink).url) {
              const url = (doc as ExternalLink).url;
              if (url!.length > 0) {
                linkData.push({ url: url! });
              }
            }
            break;
        }
      }
      convertTextBlocks(textData);
      convertToLinkNodes(fileData);
      convertToLinkNodes(linkData);
      if (
        docOwnership.kind === 'DeliverableOfCardContent' &&
        entityIs(cardContent, 'CardContent') &&
        cardContent.id != null
      ) {
        dispatch(
          API.changeCardContentLexicalConversionStatus({
            cardContentId: cardContent.id,
            conversionStatus: 'DONE',
          }),
        );
      }

      if (
        docOwnership.kind === 'PartOfResource' &&
        entityIs(resource, 'AbstractResource') &&
        entityIs(resource, 'Resource') &&
        resource.id != null
      ) {
        dispatch(
          API.changeResourceLexicalConversionStatus({
            resourceId: docOwnership.ownerId,
            conversionStatus: 'DONE',
          }),
        );
      }
      setIsConverting(false);
    }
    // Prevent reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    convertTextBlocks,
    convertToLinkNodes,
    docOwnership.kind,
    docOwnership.ownerId,
    sortedDocuments,
    dispatch,
  ]);

  React.useEffect(() => {
    if (!isConverting && status === 'READY') {
      if (
        docOwnership.kind === 'DeliverableOfCardContent' &&
        entityIs(cardContent, 'CardContent') &&
        cardContent.lexicalConversion === 'PAGAN'
      ) {
        doConvert();
      }
    }

    // Prevent reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docOwnership.kind, cardContent, status]);

  React.useEffect(() => {
    if (!isConverting && status === 'READY') {
      if (
        docOwnership.kind === 'PartOfResource' &&
        entityIs(resource, 'AbstractResource') &&
        entityIs(resource, 'Resource') &&
        resource.lexicalConversion === 'PAGAN'
      ) {
        doConvert();
      }
    }
    // Prevent reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docOwnership.kind, resource, status]);

  return (
    <IconButton
      icon={'skateboarding'}
      iconSize="xs"
      title={'Convert old documents'}
      onClick={doConvert}
      className={activeToolbarButtonStyle}
      aria-label="Convert old documents"
      disabled={status !== 'READY'}
    />
  );
}
