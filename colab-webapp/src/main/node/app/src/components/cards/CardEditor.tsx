/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import {
  faCog,
  faCompressArrowsAlt,
  faEllipsisV,
  faExpandArrowsAlt,
  faInfoCircle,
  faLock,
  faPaperclip,
  faPercent,
  //faStickyNote,
  faTimes,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useCardACLForCurrentUser, useVariantsOrLoad } from '../../selectors/cardSelector';
import { useAndLoadCardType } from '../../selectors/cardTypeSelector';
import { useAndLoadResources } from '../../selectors/resourceSelector';
//import { useStickyNoteLinksForDest } from '../../selectors/stickyNoteLinkSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import Tips from '../common/element/Tips';
import Collapsible from '../common/layout/Collapsible';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { DocTextDisplay } from '../documents/DocTextItem';
import DocEditorToolbox, {
  defaultDocEditorContext,
  DocEditorCTX,
} from '../documents/DocumentEditorToolbox';
import DocumentList from '../documents/DocumentList';
import HidenResourcesKeeper from '../resources/HidenResourcesKeeper';
import ResourceCreator from '../resources/ResourceCreator';
import { ResourceCallContext } from '../resources/resourcesCommonType';
import ResourcesMainView from '../resources/ResourcesMainView';
import { ResourceListNb } from '../resources/summary/ResourcesListSummary';
//import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import {
  cardStyle,
  errorColor,
  lightIconButtonStyle,
  localTitleStyle,
  space_M,
  space_S,
  textSmall,
  variantTitle,
} from '../styling/style';
import CardContentStatus from './CardContentStatus';
import CardInvolvement from './CardInvolvement';
import CardSettings from './CardSettings';
import CompletionEditor from './CompletionEditor';
import ContentSubs from './ContentSubs';
import {
  Item,
  SideCollapsibleCTX,
  SideCollapsibleMenu,
  SideCollapsiblePanelBody,
} from './SideCollapsiblePanel';
import { computeNav, VariantPager } from './VariantSelector';

interface CardEditorProps {
  card: Card;
  variant: CardContent;
  showSubcards?: boolean;
}
const descriptionStyle = {
  backgroundColor: 'var(--lightGray)',
  color: 'var(--darkGray)',
  transition: 'all 1s ease',
  overflow: 'hidden',
  fontSize: '0.9em',
  flexGrow: 0,
  display: 'flex',
  justifyContent: 'space-between',
};
const openDetails = css({
  ...descriptionStyle,
  maxHeight: '600px',
  padding: space_M,
});
const closeDetails = css({
  ...descriptionStyle,
  maxHeight: '0px',
  padding: '0 ' + space_M,
});
const barHeight = '18px';

const progressBarContainer = css({
  height: barHeight,
  lineHeight: barHeight,
  backgroundColor: '#949494',
  width: '100%',
  position: 'relative',
});

const valueStyle = css({
  position: 'absolute',
  color: 'white',
  width: '100%',
  textAlign: 'center',
});

const fullScreenStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 0,
});

const progressBar = (width: number) =>
  css({
    width: `${width}%`,
    height: 'inherit',
    backgroundColor: '#00DDB3',
  });

function ProgressBar({
  variant,
  className,
}: {
  variant: CardContent | undefined;
  className?: string;
}) {
  const percent = variant != null ? variant.completionLevel : 0;
  return (
    <div className={cx(progressBarContainer, className)}>
      <div className={valueStyle}>{percent}%</div>
      <div className={progressBar(percent)}></div>
    </div>
  );
}

export default function CardEditor({
  card,
  variant,
  showSubcards = true,
}: CardEditorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cardType } = useAndLoadCardType(card.cardTypeId);
  const hasCardType = cardType != null;

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;

  const contents = useVariantsOrLoad(card);
  const variantPager = computeNav(contents, variant.id);
  const { canRead, canWrite } = useCardACLForCurrentUser(card.id);
  const readOnly = !canWrite || variant.frozen;
  const [showTypeDetails, setShowTypeDetails] = React.useState(false);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [selectedDocId, setSelectedDocId] = React.useState<number | undefined | null>(undefined);
  const [editMode, setEditMode] = React.useState(defaultDocEditorContext.editMode);
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setMarkDownMode] = React.useState(false);
  const [editToolbar, setEditToolbar] = React.useState(defaultDocEditorContext.editToolbar);
  const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);
  const TXToptions = {
    showTree: showTree,
    setShowTree: setShowTree,
    markDownMode: markDownMode,
    setMarkDownMode: setMarkDownMode,
  };
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const resourceContext: ResourceCallContext = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: variant.id,
    hasSeveralVariants: hasVariants,
  };
  const { ghostResources } = useAndLoadResources(resourceContext);
  const sideBarItems: Record<string, Item> = {
    resources: {
      icon: faPaperclip,
      nextToIconElement: (
        <div className={textSmall}>
          {' '}
          (<ResourceListNb context={resourceContext} />)
        </div>
      ),
      title: i18n.modules.resource.documentation,
      header: (
        <>
          <h3>{i18n.modules.resource.documentation}</h3>
          <Tips>{i18n.modules.resource.help.documentationExplanation}</Tips>
          <ResourceCreator
            contextInfo={resourceContext}
            onCreated={() => {}}
            collapsedClassName={lightIconButtonStyle}
          />
          {/* <TocDisplayToggler /> */}
          {ghostResources != null && ghostResources.length > 0 && (
            // note : we can imagine that a read access level allows to see the ghost resources
            <>
              <span
                className={css({
                  width: '1px',
                  height: '100%',
                  backgroundColor: 'var(--lightGray)',
                })}
              />
              <HidenResourcesKeeper
                resources={ghostResources}
                collapsedClassName={cx(
                  css({
                    borderTop: '1px solid var(--lightGray)',
                    padding: space_S,
                    '&:hover': { backgroundColor: 'var(--lightGray)', cursor: 'pointer' },
                  }),
                  lightIconButtonStyle,
                )}
              />
            </>
          )}
        </>
      ),
      children: (
        <ResourcesMainView
          contextData={resourceContext}
          accessLevel={!readOnly ? 'WRITE' : canRead ? 'READ' : 'DENIED'}
        />
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
      navigate(`../edit/${card.id}/v/${variant.id}`);
    },
    [navigate],
  );

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    const cardId = card.id;
    return (
      <Flex direction="column" grow={1} align="stretch">
        <Flex
          grow={1}
          direction="row"
          align="stretch"
          className={css({ paddingBottom: space_S, height: '50vh' })}
        >
          <Flex
            grow={1}
            direction="column"
            align="stretch"
            className={cx(
              cardStyle,
              { [fullScreenStyle]: fullScreen === true },
              css({
                backgroundColor: 'white',
                overflow: 'hidden',
              }),
            )}
          >
            <Flex
              justify="space-between"
              className={css({
                alignItems: 'center',
                padding: space_S,
                borderBottom: '1px solid var(--lightGray)',
                borderTop:
                  card.color && card.color != '#ffffff'
                    ? '6px solid ' + card.color
                    : '1px solid var(--lightGray)',
              })}
            >
              <Flex align="center">
                {variant.frozen && (
                  <FontAwesomeIcon
                    className={css({ padding: `0 ${space_S}` })}
                    icon={faLock}
                    title={i18n.modules.card.infos.cardLocked}
                    color={'var(--darkGray)'}
                  />
                )}
                <CardContentStatus mode="semi" status={variant.status} />
                <DiscreetInput
                  value={card.title || ''}
                  placeholder={i18n.modules.card.untitled}
                  readOnly={readOnly}
                  onChange={newValue => dispatch(API.updateCard({ ...card, title: newValue }))}
                  inputDisplayClassName={localTitleStyle}
                />
                {hasVariants && (
                  <>
                    <span className={variantTitle}>&#xFE58;</span>
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
                      inputDisplayClassName={variantTitle}
                    />
                  </>
                )}
                {hasCardType && (
                  <IconButton
                    icon={faInfoCircle}
                    title={i18n.modules.card.showCardType}
                    className={cx(lightIconButtonStyle)}
                    onClick={() => setShowTypeDetails(showTypeDetails => !showTypeDetails)}
                  />
                )}
              </Flex>
              <Flex>
                {/* handle modal routes*/}
                <Routes>
                  <Route
                    path="settings"
                    element={
                      <Modal
                        title={i18n.modules.card.settings.title}
                        onClose={() => closeRouteCb('settings')}
                        showCloseButton
                        className={css({ height: '580px' })}
                      >
                        {closeModal => (
                          <CardSettings onClose={closeModal} card={card} variant={variant} />
                        )}
                      </Modal>
                    }
                  />
                  <Route
                    path="involvements"
                    element={
                      <Modal
                        title={i18n.modules.card.involvements}
                        onClose={() => closeRouteCb('involvements')}
                        showCloseButton
                        className={css({ height: '580px', width: '600px' })}
                      >
                        {() => <CardInvolvement card={card} />}
                      </Modal>
                    }
                  />
                  <Route
                    path="completion"
                    element={
                      <Modal
                        title={i18n.modules.card.editCompletion}
                        onClose={() => closeRouteCb('completion')}
                        showCloseButton
                        modalBodyClassName={css({ alignItems: 'center' })}
                        onEnter={close => close()}
                        footer={close => (
                          <Flex grow={1} justify="center" className={css({ margin: space_S })}>
                            <Button onClick={close}>{i18n.common.ok}</Button>
                          </Flex>
                        )}
                      >
                        {() =>
                          variant && (
                            <Flex direction="column" justify="center" align="center">
                              <CompletionEditor variant={variant} />
                            </Flex>
                          )
                        }
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
                              navigate(`../edit/${card.id}/v/${variantPager?.next.id}`);
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
                  icon={fullScreen ? faCompressArrowsAlt : faExpandArrowsAlt}
                  onClick={() => setFullScreen(fullScreen => !fullScreen)}
                  className={cx(lightIconButtonStyle, css({ padding: space_S }))}
                />
                <DropDownMenu
                  icon={faEllipsisV}
                  valueComp={{ value: '', label: '' }}
                  buttonClassName={cx(
                    lightIconButtonStyle,
                    css({ marginLeft: space_S, padding: space_S }),
                  )}
                  entries={[
                    {
                      value: 'settings',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}
                        </>
                      ),
                      action: () => navigate('settings'),
                    },
                    {
                      value: 'involvements',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faUsers} /> {i18n.modules.card.involvements}
                        </>
                      ),
                      action: () => navigate('involvements'),
                    },
                    {
                      value: 'completion',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPercent} /> {i18n.modules.card.completion}
                        </>
                      ),
                      action: () => navigate('completion'),
                    },
                    {
                      value: 'createVariant',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faWindowRestore} />{' '}
                          {i18n.modules.card.createVariant}
                        </>
                      ),
                      action: () => {
                        dispatch(API.createCardContentVariantWithBlockDoc(cardId)).then(payload => {
                          if (payload.meta.requestStatus === 'fulfilled') {
                            if (entityIs(payload.payload, 'CardContent')) {
                              goto(card, payload.payload);
                            }
                          }
                        });
                      },
                    },
                    {
                      value: 'delete',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faTrash} color={errorColor} />{' '}
                          {i18n.modules.card.deleteCardVariant(hasVariants)}
                        </>
                      ),
                      action: () => navigate('delete'),
                    },
                  ]}
                />
              </Flex>
            </Flex>
            <SideCollapsibleCTX.Provider
              value={{
                items: sideBarItems,
                openKey,
                setOpenKey,
              }}
            >
              <Flex grow={1} align="stretch" className={css({ overflow: 'hidden' })}>
                <ReflexContainer orientation={'vertical'}>
                  <ReflexElement
                    className={'left-pane ' + css({ display: 'flex' })}
                    resizeHeight={false}
                    minSize={150}
                  >
                    <DocEditorCTX.Provider
                      value={{
                        selectedDocId,
                        setSelectedDocId,
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
                                docOwnership={{
                                  kind: 'DeliverableOfCardContent',
                                  ownerId: variant.id,
                                }}
                              />
                            )}
                            {cardType && (
                              <div className={showTypeDetails ? openDetails : closeDetails}>
                                <div>
                                  <p>
                                    <b>{i18n.modules.cardType.cardType}</b>: {cardType.title || ''}
                                  </p>
                                  <p>
                                    <b>{i18n.modules.cardType.purpose}</b>:{' '}
                                    <DocTextDisplay id={cardType.purposeId} />
                                  </p>
                                </div>
                                <IconButton
                                  icon={faTimes}
                                  title={i18n.common.close}
                                  onClick={() => setShowTypeDetails(false)}
                                />
                              </div>
                            )}
                          </Flex>
                          <Flex
                            direction="column"
                            grow={1}
                            align="stretch"
                            className={css({ overflow: 'auto', padding: space_S })}
                          >
                            {canRead != undefined &&
                              (canRead ? (
                                variant.id ? (
                                  <DocumentList
                                    docOwnership={{
                                      kind: 'DeliverableOfCardContent',
                                      ownerId: variant.id,
                                    }}
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
                    </DocEditorCTX.Provider>
                  </ReflexElement>
                  {openKey && <ReflexSplitter className={css({ zIndex: 0 })} />}
                  <ReflexElement
                    className={'right-pane ' + css({ display: 'flex' })}
                    resizeHeight={false}
                    maxSize={openKey ? undefined : 0.1}
                    minSize={360}
                    flex={0.2}
                  >
                    <SideCollapsiblePanelBody className={css({ overflow: 'hidden' })} />
                  </ReflexElement>
                </ReflexContainer>
                <SideCollapsibleMenu
                  defaultOpenKey="resources"
                  className={css({ borderLeft: '1px solid var(--lightGray)' })}
                />
              </Flex>
            </SideCollapsibleCTX.Provider>
            <Flex align="center">
              <OpenCloseModal
                title={i18n.modules.card.editCompletion}
                className={css({ width: '100%' })}
                modalBodyClassName={css({ alignItems: 'center' })}
                collapsedChildren={
                  <ProgressBar
                    variant={variant}
                    className={css({
                      '&:hover': {
                        cursor: 'pointer',
                        opacity: 0.6,
                      },
                    })}
                  />
                }
                footer={close => (
                  <Flex grow={1} justify="center" className={css({ margin: space_S })}>
                    <Button onClick={close}>{i18n.common.ok}</Button>
                  </Flex>
                )}
                onEnter={close => close()}
              >
                {() =>
                  variant && (
                    <Flex direction="column" justify="center" align="center">
                      <CompletionEditor variant={variant} />
                    </Flex>
                  )
                }
              </OpenCloseModal>
            </Flex>
          </Flex>
        </Flex>
        <VariantPager allowCreation={!!canWrite} card={card} current={variant} />
        {showSubcards ? (
          <Collapsible label={i18n.modules.card.subcards}>
            <ContentSubs
              minCardWidth={80}
              depth={1}
              cardContent={variant}
              className={css({ alignItems: 'flex-start', overflow: 'auto', width: '100%' })}
              showPreview
              subcardsContainerStyle={css({
                overflow: 'auto',
                width: '100%',
                flexWrap: 'nowrap',
              })}
            />
          </Collapsible>
        ) : null}
      </Flex>
    );
  }
}
