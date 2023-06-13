/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import React, { Suspense } from 'react';

const FileComponent = React.lazy(() => import('./FileComponent'));

export interface FilePayload {
  docId: number;
  fileName: string;
  key?: NodeKey;
}

export type SerializedFileNode = Spread<
  {
    docId: number;
    fileName: string;
    type: 'file';
    version: 1;
  },
  SerializedLexicalNode
>;

function convertFileElement(domNode: HTMLElement): null | DOMConversionOutput {
  const docId = domNode.getAttribute('data-lexical-docId');
  const fileName = domNode.getAttribute('data-lexical-fileName');
  if (docId && fileName) {
    const node = $createFileNode({ docId: Number(docId), fileName: fileName });
    return { node };
  }
  return null;
}

export class FileNode extends DecoratorNode<JSX.Element> {
  __docId: number;
  __fileName: string;

  static getType(): string {
    return 'file';
  }

  static clone(node: FileNode): LexicalNode {
    return new FileNode(node.__docId, node.__fileName);
  }

  static importJSON(serializedNode: SerializedFileNode): FileNode {
    const { docId, fileName } = serializedNode;
    const node = $createFileNode({
      docId,
      fileName,
    });
    return node;
  }

  exportJSON(): SerializedFileNode {
    return {
      ...super.exportJSON(),
      docId: this.getDocId(),
      fileName: this.getFileName(),
      type: 'file',
      version: 1,
    };
  }

  constructor(docId: number, fileName: string, key?: NodeKey) {
    super(key);
    this.__docId = docId;
    this.__fileName = fileName;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('href');
    element.setAttribute('data-lexical-docId', String(this.__docId));
    element.setAttribute('data-lexical-fileName', this.__fileName);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      anchor: (domNode: HTMLElement) => {
        if (
          !domNode.hasAttribute('data-lexical-docId') ||
          !domNode.hasAttribute('data-lexical-fileName')
        ) {
          return null;
        }
        return {
          conversion: convertFileElement,
          priority: 1,
        };
      },
    };
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.file;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getDocId(): number {
    return this.__docId;
  }

  getFileName(): string {
    return this.__fileName;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <Suspense fallback={null}>
        <FileComponent
          className={className}
          docId={this.__docId}
          fileName={this.__fileName}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export function $createFileNode({ docId, fileName, key }: FilePayload): FileNode {
  return $applyNodeReplacement(new FileNode(docId, fileName, key));
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode;
}
