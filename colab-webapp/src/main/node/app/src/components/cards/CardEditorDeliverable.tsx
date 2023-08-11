/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css';
import useTranslations from '../../i18n/I18nContext';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useCurrentUser } from '../../store/selectors/userSelector';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { DocumentOwnership } from '../documents/documentCommonType';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCtx,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';
import TextEditorWrapper from '../documents/texteditor/TextEditorWrapper';

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

  const { currentUser } = useCurrentUser();

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
            <Flex
              direction="column"
              grow={1}
              align="stretch"
              className={css({ overflow: 'hidden' })}
            >
              <Flex
                direction="column"
                grow={1}
                className={css({
                  overflow: 'auto',
                })}
                align="stretch"
              >
                {!currentUser?.admin ? (
                  <Flex
                    direction="column"
                    grow={1}
                    align="stretch"
                    className={css({ overflow: 'auto' })}
                  >
                    {cardContent.id && (
                      <TextEditorWrapper
                        readOnly={false}
                        docOwnership={{
                          kind: 'DeliverableOfCardContent',
                          ownerId: cardContent.id,
                        }}
                      />
                    )}
                  </Flex>
                ) : (
                  <ReflexContainer orientation={'vertical'}>
                    <ReflexElement
                      className={css({ display: 'flex' })}
                      resizeHeight={false}
                      minSize={20}
                    >
                      <Flex
                        direction="column"
                        grow={1}
                        align="stretch"
                        className={css({ overflow: 'auto' })}
                      >
                        {cardContent.id && (
                          <TextEditorWrapper
                            readOnly={false}
                            docOwnership={{
                              kind: 'DeliverableOfCardContent',
                              ownerId: cardContent.id,
                            }}
                          />
                        )}
                      </Flex>
                    </ReflexElement>
                    <ReflexSplitter
                      className={css({
                        zIndex: 0,
                      })}
                    >
                      <Icon
                        icon="swap_horiz"
                        opsz="xs"
                        className={css({
                          position: 'relative',
                          top: '50%',
                          left: '-9px',
                        })}
                      />
                    </ReflexSplitter>
                    {/* <WIPContainer> */}
                    <ReflexElement
                      className={css({ display: 'flex' })}
                      resizeHeight={false}
                      minSize={20}
                      flex={0.1}
                    >
                      <Flex
                        direction="column"
                        align="stretch"
                        grow="1"
                        className={css({
                          backgroundColor: 'var(--blackAlpha-200)',
                        })}
                      >
                        <Flex direction="column" align="stretch">
                          <div>
                            {!readOnly && cardContent.id && (
                              <DocEditorToolbox open={true} docOwnership={deliverableDocContext} />
                            )}
                          </div>
                        </Flex>
                        <Flex
                          direction="column"
                          grow={1}
                          align="stretch"
                          className={css({
                            overflow: 'auto',
                            backgroundColor: 'var(--blackAlpha-200)',
                          })}
                        >
                          {canRead != undefined &&
                            (canRead ? (
                              cardContent.id ? (
                                <DocumentList
                                  docOwnership={deliverableDocContext}
                                  readOnly={readOnly}
                                />
                              ) : (
                                <span>{i18n.modules.card.infos.noDeliverable}</span>
                              )
                            ) : (
                              <span>{i18n.httpErrorMessage.ACCESS_DENIED}</span>
                            ))}
                        </Flex>
                      </Flex>
                    </ReflexElement>
                  </ReflexContainer>
                )}
              </Flex>
            </Flex>
          </DocEditorCtx.Provider>
        </Flex>
      </Flex>
    </>
  );
}
