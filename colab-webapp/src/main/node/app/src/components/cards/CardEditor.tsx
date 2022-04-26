/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faSnowflake, faWindowRestore } from '@fortawesome/free-regular-svg-icons';
import {
  faCog,
  faCompressArrowsAlt,
  faEllipsisV,
  faExpandArrowsAlt,
  faHandSparkles,
  faInfoCircle,
  faPaperclip,
  faPercent,
  faStickyNote,
  faTimes,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useCardACLForCurrentUser, useVariantsOrLoad } from '../../selectors/cardSelector';
import { useAndLoadCardType } from '../../selectors/cardTypeSelector';
import { useAppDispatch } from '../../store/hooks';
import Collapsible from '../common/Collapsible';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import Input from '../common/Form/Input';
import IconButton from '../common/IconButton';
import InlineInputNew from '../common/InlineInputNew';
import Modal from '../common/Modal';
import OpenCloseModal from '../common/OpenCloseModal';
import { DocTextDisplay } from '../documents/DocTextItem';
import DocumentList from '../documents/DocumentList';
import ResourcesWrapper from '../resources/ResourcesWrapper';
import StickyNoteWrapper from '../stickynotes/StickyNoteWrapper';
import {
  cardStyle,
  cardTitle,
  lightIconButtonStyle,
  space_M,
  space_S,
  variantTitle,
} from '../styling/style';
import CardEditorToolbox from './CardEditorToolbox';
import CardInvolvement from './CardInvolvement';
import CardSettings from './CardSettings';
import ContentSubs from './ContentSubs';
import SideCollapsiblePanel from './SideCollapsiblePanel';
import { computeNav, VariantPager } from './VariantSelector';

interface Props {
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

function ProgressModifier({ variant }: { variant: CardContent }) {
  const dispatch = useAppDispatch();
  return (
    <Input
      label="Completion level"
      value={String(variant.completionLevel || 0)}
      onChange={newValue =>
        dispatch(
          API.updateCardContent({
            ...variant,
            completionLevel: +newValue,
          }),
        )
      }
    />
  );
}

interface CardEditorContext {
selectedId?: number | null;
setSelectedId: (id: number | undefined | null ) => void;
}

const defaultCardEditorContext: CardEditorContext = {
  setSelectedId:()=>{}
}

export const CardEditorCTX = React.createContext<CardEditorContext>(defaultCardEditorContext);

export default function CardEditor({ card, variant, showSubcards = true }: Props): JSX.Element {
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
  const userAcl = useCardACLForCurrentUser(card.id);
  const readOnly = !userAcl.write || variant.frozen;
  const [showTypeDetails, setShowTypeDetails] = React.useState(false);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [openToolbox, setOpenToolbox] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<number | undefined | null>(undefined);

  const closeRouteCb = React.useCallback(
    route => {
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
    return <i>Card without id is invalid...</i>;
  } else {
    const cardId = card.id;
    return (
      <CardEditorCTX.Provider value={{selectedId, setSelectedId}}>
      <Flex direction="column" grow={1} align="stretch">
        <Flex
          grow={1}
          direction="row"
          align="stretch"
          className={css({ paddingBottom: space_S, height: '50vh' })}
        >
          <Flex
            grow={1}
            direction="row"
            justify="space-between"
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
            <Flex direction="column" grow={1} align="stretch">
              <Flex
                direction="column"
                grow={1}
                className={css({
                  overflow: 'auto',
                })}
                align="stretch"
              >
                <Flex direction="column" align="stretch" className={'HEADER'}>
                  <Flex
                    justify="space-between"
                    className={css({
                      alignItems: 'center',
                      padding: space_S,
                      borderBottom:
                        card.color && card.color != '#ffffff'
                          ? '5px solid ' + card.color
                          : '1px solid var(--lightGray)',
                    })}
                  >
                    <div>
                      {variant.frozen && (
                        <div
                          className={css({ color: '#71D9FF' })}
                          title='Card is frozen (locked). To unfreeze go to Card settings and uncheck "frozen".'
                        >
                          <FontAwesomeIcon icon={faSnowflake} />
                          <i> frozen</i>
                        </div>
                      )}
                      <Flex align="center">
                        <InlineInputNew
                          placeholder={i18n.card.untitled}
                          readOnly={readOnly}
                          value={card.title || ''}
                          onChange={newValue =>
                            dispatch(API.updateCard({ ...card, title: newValue }))
                          }
                          className={cardTitle}
                          autosave
                        />
                        {hasVariants && (
                          <>
                            <span className={variantTitle}>&#xFE58;</span>
                            <InlineInputNew
                              className={variantTitle}
                              value={
                                variant.title && variant.title.length > 0
                                  ? variant.title
                                  : `Variant ${variantNumber}`
                              }
                              readOnly={readOnly}
                              placeholder={i18n.content.untitled}
                              onChange={newValue =>
                                dispatch(API.updateCardContent({ ...variant, title: newValue }))
                              }
                              autosave={false}
                            />
                          </>
                        )}
                        {hasCardType && (
                          <IconButton
                            icon={faInfoCircle}
                            title="Show card model informations"
                            className={cx(lightIconButtonStyle, css({ color: 'var(--lightGray)' }))}
                            onClick={() => setShowTypeDetails(showTypeDetails => !showTypeDetails)}
                          />
                        )}
                        {!readOnly && <IconButton
                          icon={faHandSparkles}
                          title="Show/hide toolbox"
                          className={cx(lightIconButtonStyle, css({ color: 'var(--lightGray)' }))}
                          onClick={() => setOpenToolbox(openToolbox => !openToolbox)}
                        />}
                      </Flex>
                    </div>
                    <Flex>
                      {/* handle modal routes*/}
                      <Routes>
                        <Route
                          path="settings"
                          element={
                            <Modal
                              title="Card Settings"
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
                              title="Involvements"
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
                              title="Completion"
                              onClose={() => navigate('./')}
                              showCloseButton
                            >
                              {() =>
                                variant && (
                                  <Flex direction="column">
                                    <ProgressModifier variant={variant} />
                                  </Flex>
                                )
                              }
                            </Modal>
                          }
                        />
                      </Routes>
                      <IconButton
                        title="Full screen mode"
                        icon={fullScreen ? faCompressArrowsAlt : faExpandArrowsAlt}
                        onClick={() => setFullScreen(fullScreen => !fullScreen)}
                        className={lightIconButtonStyle}
                      />
                      <DropDownMenu
                        icon={faEllipsisV}
                        valueComp={{ value: '', label: '' }}
                        buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                        entries={[
                          {
                            value: 'settings',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faCog} /> Card Settings
                              </>
                            ),
                          },
                          {
                            value: 'involvements',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faUsers} /> Involvements
                              </>
                            ),
                          },
                          {
                            value: 'completion',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faPercent} /> Completion
                              </>
                            ),
                          },
                          {
                            value: 'Add new variant',
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
                            label: (
                              <>
                                <FontAwesomeIcon icon={faWindowRestore} /> Add variant
                              </>
                            ),
                          },
                          {
                            value: 'Delete card or variant',
                            action: () => {},
                            label: (
                              <ConfirmDeleteModal
                                buttonLabel={
                                  <>
                                    <FontAwesomeIcon icon={faTrash} />
                                    {hasVariants ? ' Delete variant' : ' Delete card'}
                                  </>
                                }
                                message={
                                  hasVariants ? (
                                    <p>
                                      Are you <strong>sure</strong> you want to delete this whole
                                      variant? This will delete all subcards inside.
                                    </p>
                                  ) : (
                                    <p>
                                      Are you <strong>sure</strong> you want to delete this whole
                                      card? This will delete all subcards inside.
                                    </p>
                                  )
                                }
                                onConfirm={() => {
                                  if (hasVariants) {
                                    dispatch(API.deleteCardContent(variant));
                                    navigate(`../edit/${card.id}/v/${variantPager?.next.id}`);
                                  } else {
                                    dispatch(API.deleteCard(card));
                                    navigate('../');
                                  }
                                }}
                                confirmButtonLabel={hasVariants ? 'Delete variant' : 'Delete card'}
                              />
                            ),
                          },
                        ]}
                        onSelect={val => {
                          val.action != null ? val.action() : navigate(val.value);
                        }}
                      />
                    </Flex>
                  </Flex>
                  {!readOnly && variant.id && <CardEditorToolbox open={openToolbox} context={{ kind: 'DeliverableOfCardContent', ownerId: variant.id }} />}
                  {cardType && (
                    <div className={showTypeDetails ? openDetails : closeDetails}>
                      <div>
                        <p>
                          <b>Card type</b>: {cardType.title || ''}
                        </p>
                        <p>
                          <b>Purpose</b>: <DocTextDisplay id={cardType.purposeId} />
                        </p>
                      </div>
                      <IconButton
                        icon={faTimes}
                        title="Close"
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
                  {userAcl.read ? (
                    variant.id ? (
                      <DocumentList
                        context={{ kind: 'DeliverableOfCardContent', ownerId: variant.id }}
                        allowEdition={!readOnly}
                      />
                    ) : (
                      <span>no deliverable available</span>
                    )
                  ) : (
                    <span>Access Denied</span>
                  )}
                  
                </Flex>
              </Flex>
              <Flex align="center">
                <OpenCloseModal
                  title="Edit card completion"
                  className={css({ width: '100%' })}
                  showCloseButton={true}
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
                >
                  {() =>
                    variant && (
                      <Flex direction="column">
                        <ProgressModifier variant={variant} />
                      </Flex>
                    )
                  }
                </OpenCloseModal>
              </Flex>
            </Flex>
            <SideCollapsiblePanel
              items={{
                resources: {
                  children: (
                    <ResourcesWrapper
                      kind={'CardOrCardContent'}
                      accessLevel={
                        !readOnly && userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'
                      }
                      cardId={card.id}
                      cardContentId={variant.id}
                      hasSeveralVariants={hasVariants}
                    />
                  ),
                  icon: faPaperclip,
                  title: 'Documentation',
                },
                'Sticky Notes': {
                  icon: faStickyNote,
                  title: 'Sticky notes',
                  children: <StickyNoteWrapper destCardId={card.id} showSrc />,
                },
              }}
              direction="RIGHT"
            />
          </Flex>
        </Flex>
        <VariantPager allowCreation={userAcl.write} card={card} current={variant} />
        {showSubcards ? (
          <Collapsible title="Subcards">
            <ContentSubs
              depth={1}
              cardContent={variant}
              className={css({ alignItems: 'flex-start', overflow: 'auto', width: '100%' })}
              subcardsContainerStyle={css({ overflow: 'auto', width: '100%', flexWrap: 'nowrap' })}
            />
          </Collapsible>
        ) : null}
      </Flex>
      </ CardEditorCTX.Provider>
    );
  }
}
