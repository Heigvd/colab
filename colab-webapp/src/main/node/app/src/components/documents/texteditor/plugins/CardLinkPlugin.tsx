/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { Card } from 'colab-rest-client';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, LexicalEditor } from 'lexical';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import CardSelector from '../../../cards/CardSelector';
import Button from '../../../common/element/Button';
import { $createCardLinkNode, CardLinkNode, CardLinkPayload } from '../nodes/CardLinkNode';
import { DialogActions } from '../ui/Dialog';

export type InsertCardLinkPayload = Readonly<CardLinkPayload>;

export const INSERT_CARDLINK_COMMAND: LexicalCommand<InsertCardLinkPayload> =
  createCommand('INSERT_CARDLINK_COMMAND');

export function InsertCardLinkDialogBody({
  onClick,
  activeEditor,
}: {
  onClick: (payload: Card) => void;
  activeEditor: LexicalEditor;
}) {
  const i18n = useTranslations();

  const [selectedCard, setSelectedCard] = React.useState<Card | undefined>(undefined);
  const isDisabled = !activeEditor.isEditable || selectedCard == undefined;

  return (
    <>
      <CardSelector value={selectedCard} onSelect={card => setSelectedCard(card)} />
      <DialogActions>
        <Button disabled={isDisabled} onClick={() => onClick(selectedCard!)}>
          {i18n.common.confirm}
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertCardLinkDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const onClick = (card: Card) => {
    activeEditor.dispatchCommand(INSERT_CARDLINK_COMMAND, {
      cardId: card.id!,
      cardTitle: card.title!,
    });

    onClose();
  };

  return (
    <>
      <InsertCardLinkDialogBody onClick={onClick} activeEditor={activeEditor} />
    </>
  );
}

export function CardLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    if (!editor.hasNodes([CardLinkNode])) {
      throw new Error('CardLinkPlugin: CardLinkNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertCardLinkPayload>(
        INSERT_CARDLINK_COMMAND,
        payload => {
          const cardLinkNode = $createCardLinkNode(payload);
          $insertNodeToNearestRoot(cardLinkNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
