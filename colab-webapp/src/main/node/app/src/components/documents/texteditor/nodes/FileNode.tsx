/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
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
import React from 'react';

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

function convertFileElement(element: HTMLElement): null | DOMConversionOutput {
  const docId = element.getAttribute('data-lexical-doc-id');
  const fileName = element.getAttribute('data-lexical-file-name');
  if (docId != null && fileName != null) {
    const node = $createFileNode({ docId: Number(docId), fileName: fileName });
    return { node };
  }
  return null;
}

export class FileNode extends DecoratorNode<JSX.Element> {
  __docId: number;
  __fileName: string;

  /**
   * Returns the string type of this node. Every node must
   * implement this and it MUST BE UNIQUE amongst nodes registered
   * on the editor.
   */
  static getType(): string {
    return 'file';
  }

  /**
   * Clones this node, creating a new node with a different key
   * and adding it to the EditorState (but not attaching it anywhere!). All nodes must
   * implement this method.
   */
  static clone(node: FileNode): FileNode {
    return new FileNode(node.__docId, node.__fileName, node.__key);
  }

  /**
   * Controls how the this node is deserialized from JSON. This is usually boilerplate,
   * but provides an abstraction between the node implementation and serialized interface that can
   * be important if you ever make breaking changes to a node schema (by adding or removing properties).
   * See [Serialization & Deserialization](https://lexical.dev/docs/concepts/serialization#lexical---html).
   */
  static importJSON(serializedNode: SerializedFileNode): FileNode {
    const { docId, fileName } = serializedNode;
    const node = $createFileNode({
      docId,
      fileName,
    });
    return node;
  }

  /**
   * Controls how the this node is serialized to JSON. This is important for
   * copy and paste between Lexical editors sharing the same namespace. It's also important
   * if you're serializing to JSON for persistent storage somewhere.
   * See [Serialization & Deserialization](https://lexical.dev/docs/concepts/serialization#lexical---html).
   */
  exportJSON(): SerializedFileNode {
    return {
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

  /**
   * Controls how the this node is serialized to HTML. This is important for
   * copy and paste between Lexical and non-Lexical editors, or Lexical editors with different namespaces,
   * in which case the primary transfer format is HTML. It's also important if you're serializing
   * to HTML for any other reason via {@link @lexical/html!$generateHtmlFromNodes}. You could
   * also use this method to build your own HTML renderer.
   */
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-doc-id', String(this.__docId));
    element.setAttribute('data-lexical-file-name', this.__fileName);
    element.textContent = this.__fileName;
    return { element };
  }

  /**
   * The return value of `importDOM` is a map of the lower case (DOM)
   * [Node.nodeName](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName)
   * property to an object that specifies a conversion function and a priority for that conversion.
   * This allows `LexicalNodes` to specify which type of DOM nodes they can convert and what the
   * relative priority of their conversion should be. This is useful in cases where a DOM Node with
   * specific attributes should be interpreted as one type of `LexicalNode`, and otherwise it should
   * be represented as another type of `LexicalNode`.
   */
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (
          !domNode.hasAttribute('data-lexical-doc-id') ||
          !domNode.hasAttribute('data-lexical-file-name')
        ) {
          return null;
        }
        return {
          conversion: convertFileElement,
          priority: 0,
        };
      },
    };
  }

  /**
   * Called during the reconciliation process to determine which nodes
   * to insert into the DOM for this Lexical Node.
   *
   * This method must return exactly one HTMLElement. Nested elements are not supported.
   *
   * Do not attempt to update the Lexical EditorState during this phase of the update lifecyle.
   *
   * @param _config - allows access to things like the EditorTheme (to apply classes) during reconciliation.
   * @param _editor - allows access to the editor for context during reconciliation.
   */
  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  /**
   * Called when a node changes and should update the DOM
   * in whatever way is necessary to make it align with any changes that might
   * have happened during the update.
   *
   * Returning "true" here will cause lexical to unmount and recreate the DOM node
   * (by calling createDOM). You would need to do this if the element tag changes,
   * for instance.
   */
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
      <FileComponent
        className={className}
        docId={this.__docId}
        fileName={this.__fileName}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createFileNode({ docId, fileName }: FilePayload): FileNode {
  return new FileNode(docId, fileName);
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode;
}
