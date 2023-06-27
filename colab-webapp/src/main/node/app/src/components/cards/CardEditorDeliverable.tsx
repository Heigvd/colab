/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import useTranslations from '../../i18n/I18nContext';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { space_sm } from '../../styling/style';
import Flex from '../common/layout/Flex';
import { DocumentOwnership } from '../documents/documentCommonType';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCtx,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';

interface CardEditorDeliverableProps {
  card: Card;
  cardContent: CardContent;
  readOnly?: boolean;
}
export default function CardEditorDeliverable({
  card,
  cardContent,
  readOnly,
}: CardEditorDeliverableProps): JSX.Element {
  const i18n = useTranslations();

  const { canRead } = useCardACLForCurrentUser(card.id);

  //const [showTypeDetails, setShowTypeDetails] = React.useState(false);
  const [selectedDocId, setSelectedDocId] = React.useState<number | null>(null);
  const [lastCreatedDocId, setLastCreatedDocId] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState(defaultDocEditorContext.editMode);
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setMarkDownMode] = React.useState(false);
  const [editToolbar, setEditToolbar] = React.useState(defaultDocEditorContext.editToolbar);

  const TXToptions = {
    showTree: showTree,
    setShowTree: setShowTree,
    markDownMode: markDownMode,
    setMarkDownMode: setMarkDownMode,
  };

  const deliverableDocContext: DocumentOwnership = {
    kind: 'DeliverableOfCardContent',
    ownerId: cardContent.id!,
  };

  return (
    <>
      <Flex grow={1} direction="column" align="stretch" className={cx(css({ overflow: 'auto' }))}>
        <Flex grow={1} align="stretch" className={css({ overflow: 'hidden' })}>
          <Flex direction="column" grow={1} align="stretch">
            <Flex
              direction="column"
              grow={1}
              className={css({
                overflow: 'auto',
              })}
              align="stretch"
            >
              <DocEditorCtx.Provider
                value={{
                  selectedDocId,
                  setSelectedDocId,
                  lastCreatedId: lastCreatedDocId,
                  setLastCreatedId: setLastCreatedDocId,
                  editMode,
                  setEditMode,
                  editToolbar,
                  setEditToolbar,
                  TXToptions,
                }}
              >
                <Flex direction="column" align="stretch">
                  {!readOnly && cardContent.id && (
                    <DocEditorToolbox open={true} docOwnership={deliverableDocContext} />
                  )}
                </Flex>
                <Flex
                  direction="column"
                  grow={1}
                  align="stretch"
                  className={css({ overflow: 'auto', padding: space_sm })}
                >
                  {canRead != undefined &&
                    (canRead ? (
                      cardContent.id ? (
                        <DocumentList docOwnership={deliverableDocContext} readOnly={readOnly} />
                      ) : (
                        <span>{i18n.modules.card.infos.noDeliverable}</span>
                      )
                    ) : (
                      <span>{i18n.httpErrorMessage.ACCESS_DENIED}</span>
                    ))}
                </Flex>
              </DocEditorCtx.Provider>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
