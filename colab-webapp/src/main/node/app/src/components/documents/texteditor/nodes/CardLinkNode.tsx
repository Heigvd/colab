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
import * as React from 'react';
import CardLinkComponent from './CardLinkComponent';

export interface CardLinkPayload {
  cardId: number;
  cardTitle: string;
  key?: NodeKey;
}

export type SerializedCardLinkNode = Spread<
  {
    cardId: number;
    cardTitle: string;
    type: 'cardLink';
    version: 1;
  },
  SerializedLexicalNode
>;

export class CardLinkNode extends DecoratorNode<JSX.Element> {
  __cardId: number;
  __cardTitle: string;

  static getType(): string {
    return 'cardLink';
  }

  static clone(node: CardLinkNode): CardLinkNode {
    return new CardLinkNode(node.__cardId, node.__key);
  }

  constructor(cardId: number, cardTitle: string, key?: NodeKey) {
    super(key);
    this.__cardId = cardId;
    this.__cardTitle = cardTitle;
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-card-id', String(this.__cardId));
    element.setAttribute('data-lexical-card-title', String(this._cardTitle));
    element.textContent = this.__cardTitle;
    return { element };
  }

  static importDom(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (
          !domNode.hasAttribute('data-lexical-card-id') ||
          !domNode.hasAttribute('data-lexical-card-title')
        ) {
          return null;
        }
        return {
          conversion: convertCardLinkElement,
          priority: 0,
        };
      },
    };
  }

  exportJSON(): SerializedCardLinkNode {
    return {
      cardId: this.getCardId(),
      cardTitle: this.getCardTitle(),
      type: 'cardLink',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedCardLinkNode): CardLinkNode {
    const { cardId, cardTitle } = serializedNode;
    const node = $createCardLinkNode({
      cardId,
      cardTitle,
    });
    return node;
  }

  getCardId(): number {
    return this.__cardId;
  }

  getCardTitle(): string {
    return this.__cardTitle;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <CardLinkComponent
        className={className}
        cardId={this.__cardId}
        cardTitle={this.__cardTitle}
        nodeKey={this.getKey()}
      />
    );
  }
}

function convertCardLinkElement(element: HTMLElement): null | DOMConversionOutput {
  const cardId = element.getAttribute('data-lexical-card-id');
  const cardTitle = element.getAttribute('data-lexical-card-title');
  if (cardId != null && cardTitle != null) {
    const node = $createCardLinkNode({ cardId: Number(cardId), cardTitle: cardTitle });
    return { node };
  }
  return null;
}

export function $createCardLinkNode({ cardId, cardTitle }: CardLinkPayload): CardLinkNode {
  return new CardLinkNode(cardId, cardTitle);
}

export function $isCardLinkNode(node: LexicalNode | null | undefined): node is CardLinkNode {
  return node instanceof CardLinkNode;
}
