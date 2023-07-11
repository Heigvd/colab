/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $getRoot, $isDecoratorNode, $isElementNode, $isParagraphNode, $isTextNode } from 'lexical';
import * as React from 'react';
import { TextEditorContext } from '../TextEditorContext';

/**
 * Plugin that detects if a text editor is empty.
 */

export default function EmptinessSensorPlugin(): null {
  const [editor] = useLexicalComposerContext();

  const { /*isEmpty, */ setIsEmpty } = React.useContext(TextEditorContext);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(() => {
          if (isEditorBlankOrEmpty(editor.isComposing())) {
            setIsEmpty(true);
          } else if (!isEditorBlankOrEmpty(editor.isComposing())) {
            setIsEmpty(false);
          }
        });
      }),
    );
  });

  return null;
}

// Based on $canShowPlaceholder from lexical
function isEditorBlankOrEmpty(isComposing: boolean): boolean {
  if (isComposing) {
    return false;
  }

  const root = $getRoot();
  const children = root.getChildren();
  const childrenLength = children.length;

  if (root.getTextContent().trim().length > 0) {
    return false;
  }

  for (let i = 0; i < childrenLength; i++) {
    const topBlock = children[i];

    if ($isDecoratorNode(topBlock)) {
      return false;
    }

    if ($isElementNode(topBlock)) {
      if (!$isParagraphNode(topBlock)) {
        return false;
      }

      if (topBlock.__indent !== 0) {
        return false;
      }

      const topBlockChildren = topBlock.getChildren();
      const topBlockChildrenLength = topBlockChildren.length;

      for (let s = 0; s < topBlockChildrenLength; s++) {
        const child = topBlockChildren[i];

        if (!$isTextNode(child)) {
          return false;
        }
      }
    }
  }

  return true;
}
