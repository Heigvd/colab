/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards, useVariantsOrLoad } from '../../store/selectors/cardSelector';
//import { useStickyNoteLinksForDest } from '../../selectors/stickyNoteLinkSelector';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useAndLoadIfOnlyEmptyDocuments } from '../../store/selectors/documentSelector';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { heading_sm, lightIconButtonStyle, space_md, space_sm } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import {
  Item,
  SideCollapsibleCtx,
  SideCollapsibleMenu,
  SideCollapsiblePanelBody,
} from '../common/layout/SideCollapsiblePanel';
import { DocumentOwnership } from '../documents/documentCommonType';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCtx,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';
import { ResourceAndRef, ResourceOwnership } from '../resources/resourcesCommonType';
import {
  ResourcesCtx,
  ResourcesMainViewHeader,
  ResourcesMainViewPanel,
} from '../resources/ResourcesMainView';
import CardAssignmentsPanel from '../team/CardAssignments';
import CardContentStatusDisplay from './CardContentStatusDisplay';
import CardSettings from './CardSettings';
import CardThumb from './CardThumb';
import { ProgressBarEditor } from './ProgressBar';
import { computeNav, VariantPager } from './VariantSelector';

interface CardEditorProps {
  card: Card;
  variant: CardContent;
}

const fullScreenStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  borderRadius: 0,
  backgroundColor: 'var(--bg-primary)',
});

export default function CardEditor({ card, variant }: CardEditorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useCurrentUser();

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;

  const contents = useVariantsOrLoad(card);

  const subCards = useAndLoadSubCards(variant.id);

  const variantPager = computeNav(contents, variant.id);

  const { canRead, canWrite } = useCardACLForCurrentUser(card.id);
  const readOnly = !canWrite || variant.frozen;
  //const [showTypeDetails, setShowTypeDetails] = React.useState(false);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [selectedDocId, setSelectedDocId] = React.useState<number | null>(null);
  const [lastCreatedDocId, setLastCreatedDocId] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState(defaultDocEditorContext.editMode);
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setMarkDownMode] = React.useState(false);
  const [editToolbar, setEditToolbar] = React.useState(defaultDocEditorContext.editToolbar);
  const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);

  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const [lastCreatedResourceId, setLastCreatedResourceId] = React.useState<number | null>(null);

  const TXToptions = {
    showTree: showTree,
    setShowTree: setShowTree,
    markDownMode: markDownMode,
    setMarkDownMode: setMarkDownMode,
  };
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const hasNoSubCard = !subCards || subCards.length < 1;

  const deliverableDocContext: DocumentOwnership = {
    kind: 'DeliverableOfCardContent',
    ownerId: variant.id!,
  };

  const { empty: hasNoDeliverableDoc } = useAndLoadIfOnlyEmptyDocuments(deliverableDocContext);

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: variant.id,
    hasSeveralVariants: hasVariants,
  };

  const sideBarItems: Record<string, Item> = {
    resources: {
      icon: 'menu_book',
      // nextToIconElement: (
      //   <div className={text_sm}>
      //     <ResourcesListNb resourcesOwnership={resourceOwnership} />
      //   </div>
      // ),
      title: i18n.modules.resource.documentation,
      header: (
        <ResourcesMainViewHeader
          title={<h3>{i18n.modules.resource.documentation}</h3>}
          helpTip={i18n.modules.resource.help.documentationExplanation}
        />
      ),
      children: (
        <ResourcesMainViewPanel
          accessLevel={!readOnly ? 'WRITE' : canRead ? 'READ' : 'DENIED'}
          showLevels
        />
      ),
      className: css({ overflow: 'auto' }),
    },
    team: {
      icon: 'group',
      title: i18n.team.assignment.labels.assignments,
      children: (
        <div className={css({ overflow: 'auto' })}>
          <CardAssignmentsPanel cardId={card.id!} />
        </div>
      ),
      className: css({ overflow: 'auto' }),
    },
  };

  //const { stickyNotesForDest } = useStickyNoteLinksForDest(card.id);
  const closeRouteCb = React.useCallback(
    (route: string) => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

  const goto = React.useCallback(
    (card: Card, variant: CardContent) => {
      navigate(`../card/${card.id}/v/${variant.id}`);
    },
    [navigate],
  );

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    const cardId = card.id;
    return (
      <Flex direction="column" grow={1} align="stretch" className={css({ overflow: 'auto' })}>
        <ReflexContainer orientation={'horizontal'}>
          <ReflexElement
            className={'top-pane ' + css({ display: 'flex' })}
            resizeWidth={false}
            minSize={65}
            flex={hasNoSubCard ? 1 : hasNoDeliverableDoc ? 0 : 0.5}
          >
            <Flex
              grow={1}
              direction="column"
              align="stretch"
              className={cx({ [fullScreenStyle]: fullScreen === true }, css({ overflow: 'auto' }))}
            >
              <Flex
                justify="space-between"
                className={css({
                  alignItems: 'center',
                  padding: '0 ' + space_sm,
                  borderBottom: '1px solid var(--divider-main)',
                  borderTop:
                    card.color && card.color != '#ffffff'
                      ? '6px solid ' + card.color
                      : '1px solid var(--divider-main)',
                })}
              >
                <Flex align="center">
                  <DiscreetInput
                    value={card.title || ''}
                    placeholder={i18n.modules.card.untitled}
                    readOnly={readOnly}
                    onChange={newValue => dispatch(API.updateCard({ ...card, title: newValue }))}
                    inputDisplayClassName={heading_sm}
                  />
                  {hasVariants && (
                    <>
                      <span>&#xFE58;</span>
                      <DiscreetInput
                        value={
                          variant.title && variant.title.length > 0
                            ? variant.title
                            : i18n.modules.card.variant + `${variantNumber}`
                        }
                        placeholder={i18n.modules.content.untitled}
                        readOnly={readOnly}
                        onChange={newValue =>
                          dispatch(API.updateCardContent({ ...variant, title: newValue }))
                        }
                      />
                      <VariantPager allowCreation={!readOnly} card={card} current={variant} />
                    </>
                  )}
                  {variant.frozen && (
                    <Icon
                      className={css({ padding: `0 ${space_sm}` })}
                      icon={'lock'}
                      title={i18n.modules.card.infos.cardLocked}
                      color={'var(--secondary-main)'}
                    />
                  )}
                  <CardContentStatusDisplay kind="solid" status={variant.status} />
                  <CardContentStatusDisplay kind="outlined" status={variant.status} />
                  <CardContentStatusDisplay kind="icon_only" status={variant.status} />
                </Flex>
                <Flex align="center">
                  {/* handle modal routes*/}
                  <Routes>
                    <Route
                      path="settings"
                      element={
                        <Modal
                          title={i18n.modules.card.settings.title}
                          onClose={() => closeRouteCb('settings')}
                          showCloseButton
                          modalBodyClassName={css({ overflowY: 'visible' })}
                        >
                          {closeModal => (
                            <CardSettings onClose={closeModal} card={card} variant={variant} />
                          )}
                        </Modal>
                      }
                    />
                    <Route
                      path="delete"
                      element={
                        <ConfirmDeleteModal
                          title={i18n.modules.card.deleteCardVariant(hasVariants)}
                          message={<p>{i18n.modules.card.confirmDeleteCardVariant(hasVariants)}</p>}
                          onCancel={() => closeRouteCb(`delete`)}
                          onConfirm={() => {
                            startLoading();
                            if (hasVariants) {
                              dispatch(API.deleteCardContent(variant)).then(() => {
                                navigate(`../card/${card.id}/v/${variantPager?.next.id}`);
                                stopLoading();
                              });
                            } else {
                              dispatch(API.deleteCard(card)).then(() => {
                                navigate('../');
                                stopLoading();
                              });
                            }
                          }}
                          confirmButtonLabel={i18n.modules.card.deleteCardVariant(hasVariants)}
                          isConfirmButtonLoading={isLoading}
                        />
                      }
                    />
                  </Routes>
                  <IconButton
                    title={i18n.modules.card.editor.fullScreen}
                    icon={fullScreen ? 'close_fullscreen' : 'open_in_full'}
                    onClick={() => setFullScreen(fullScreen => !fullScreen)}
                    className={lightIconButtonStyle}
                  />
                  <DropDownMenu
                    icon={'more_vert'}
                    valueComp={{ value: '', label: '' }}
                    buttonClassName={lightIconButtonStyle}
                    entries={[
                      {
                        value: 'settings',
                        label: (
                          <>
                            <Icon icon={'settings'} /> {i18n.common.settings}
                          </>
                        ),
                        action: () => navigate('settings'),
                      },
                      ...(currentUser?.admin && card.cardTypeId == null
                        ? [
                            {
                              value: 'createType',
                              label: (
                                <>
                                  <Icon icon={'account_tree'} />
                                  {i18n.modules.card.action.createAType}
                                </>
                              ),
                              action: () => {
                                dispatch(API.createCardCardType(cardId));
                              },
                            },
                          ]
                        : []),
                      ...(currentUser?.admin && card.cardTypeId != null
                        ? [
                            {
                              value: 'removeType',
                              label: (
                                <>
                                  <Icon icon={'eco'} /> {i18n.modules.card.action.removeTheType}
                                </>
                              ),
                              action: () => {
                                dispatch(API.removeCardCardType(cardId));
                              },
                            },
                          ]
                        : []),
                      {
                        value: 'createVariant',
                        label: (
                          <>
                            <Icon icon={'library_add'} /> {i18n.modules.card.createVariant}
                          </>
                        ),
                        action: () => {
                          dispatch(API.createCardContentVariantWithBlockDoc(cardId)).then(
                            payload => {
                              if (payload.meta.requestStatus === 'fulfilled') {
                                if (entityIs(payload.payload, 'CardContent')) {
                                  goto(card, payload.payload);
                                }
                              }
                            },
                          );
                        },
                      },
                      {
                        value: 'delete',
                        label: (
                          <>
                            <Icon icon={'delete'} color={'var(--error-main)'} />{' '}
                            {i18n.modules.card.deleteCardVariant(hasVariants)}
                          </>
                        ),
                        action: () => navigate('delete'),
                      },
                    ]}
                  />
                </Flex>
              </Flex>
              <Flex direction="column" align="stretch">
                <ProgressBarEditor variant={variant} />
              </Flex>
              <SideCollapsibleCtx.Provider
                value={{
                  items: sideBarItems,
                  openKey,
                  setOpenKey,
                }}
              >
                <ResourcesCtx.Provider
                  value={{
                    resourceOwnership,
                    selectedResource,
                    selectResource,
                    lastCreatedId: lastCreatedResourceId,
                    setLastCreatedId: setLastCreatedResourceId,
                  }}
                >
                  <Flex grow={1} align="stretch" className={css({ overflow: 'hidden' })}>
                    <ReflexContainer orientation={'vertical'}>
                      <ReflexElement
                        className={'left-pane ' + css({ display: 'flex' })}
                        resizeHeight={false}
                        minSize={20}
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
                          <Flex direction="column" grow={1} align="stretch">
                            <Flex
                              direction="column"
                              grow={1}
                              className={css({
                                overflow: 'auto',
                              })}
                              align="stretch"
                            >
                              <Flex direction="column" align="stretch">
                                {!readOnly && variant.id && (
                                  <DocEditorToolbox
                                    open={true}
                                    docOwnership={deliverableDocContext}
                                  />
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
                                    variant.id ? (
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
                          </Flex>
                        </DocEditorCtx.Provider>
                      </ReflexElement>
                      {openKey && (
                        <ReflexSplitter className={css({ zIndex: 0, margin: '0 ' + space_md })}>
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
                      )}
                      <ReflexElement
                        className={'right-pane ' + css({ display: 'flex' })}
                        resizeHeight={false}
                        maxSize={openKey ? undefined : 0.1}
                        minSize={20}
                        flex={0.2}
                      >
                        <SideCollapsiblePanelBody className={css({ overflow: 'hidden' })} />
                      </ReflexElement>
                    </ReflexContainer>
                    <SideCollapsibleMenu
                      defaultOpenKey="resources"
                      className={css({ borderLeft: '1px solid var(--divider-main)' })}
                    />
                  </Flex>
                </ResourcesCtx.Provider>
              </SideCollapsibleCtx.Provider>
            </Flex>
          </ReflexElement>
          <ReflexSplitter
            className={css({
              zIndex: 0,
              margin: space_md + ' 0',
            })}
          >
            <Icon
              icon="swap_vert"
              opsz="xs"
              className={css({
                position: 'relative',
                top: '-9px',
                left: '50%',
              })}
            />
          </ReflexSplitter>
          <ReflexElement
            className={'bottom-pane ' + css({ display: 'flex' })}
            resizeWidth={false}
            minSize={42}
          >
            <CardThumb
              card={card}
              variant={variant}
              variants={variants}
              showSubcards={true}
              depth={2}
              mayOrganize={true}
              showPreview={false}
              withoutHeader={true}
              className={css({ width: '100%', overflow: 'auto', flexGrow: 1 })}
            />
          </ReflexElement>
        </ReflexContainer>
      </Flex>
    );
  }
}
