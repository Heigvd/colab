/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faCog,
  faEllipsisV,
  faFrog,
  faPen,
  faPercent,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../selectors/cardSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';
import { FeaturePreview } from '../common/element/Tips';
import Toggler from '../common/element/Toggler';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import DocumentPreview from '../documents/preview/DocumentPreview';
import {
  errorColor,
  lightIconButtonStyle,
  space_L,
  space_M,
  space_S,
  variantTitle,
} from '../styling/style';
import CardContentStatus from './CardContentStatus';
import CardInvolvement from './CardInvolvement';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import CompletionEditor from './CompletionEditor';
import ContentSubs from './ContentSubs';
import PositionEditor from './PositionEditor';

export interface TinyCardProps {
  card: Card;
  width?: string;
  height?: string;
}

export function TinyCard({ card, width = '15px', height = '10px' }: TinyCardProps): JSX.Element {
  const i18n = useTranslations();
  return (
    <div
      className={css({
        width: width,
        height: height,
        border: `2px solid var(--lightGray)`,
        borderRadius: '4px',
        margin: '5px',
      })}
      title={(card.title && i18n.modules.card.subcardTooltip(card.title)) || undefined}
    >
      <div
        className={css({
          height: '3px',
          width: '100%',
          borderBottom: `2px solid ${card.color || 'var(--lightGray)'}`,
        })}
      ></div>
    </div>
  );
}

export interface CardThumbProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
  mayOrganize?: boolean;
  showPreview: boolean;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
  mayOrganize,
  showPreview,
}: CardThumbProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  // Get nb of sticky notes and resources to display on card (cf below).
  //Commented temporarily for first online version. Full data is not complete on first load. To discuss.
  //const nbStickyNotes = useStickyNoteLinksForDest(card.id).stickyNotesForDest.length;
  /* const nbResources = useResources({
    kind: ResourceContextScope.CardOrCardContent,
    cardContentId: variant?.id || undefined,
    cardId: card?.id || undefined,
    accessLevel: 'READ',
  }).resourcesAndRefs.length; */

  const closeRouteCb = React.useCallback(
    (route: string) => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

  const cardId = card.id;

  const navigateToZoomPageCb = React.useCallback(() => {
    const path = `card/${cardId}/v/${variant?.id}`;
    if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
      navigate(`../${path}`);
    } else {
      navigate(path);
    }
  }, [variant, cardId, location.pathname, navigate]);

  const navigateToEditPageCb = React.useCallback(() => {
    const path = `edit/${cardId}/v/${variant?.id}`;
    if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
      navigate(`../${path}`);
    } else {
      navigate(path);
    }
  }, [variant, cardId, location.pathname, navigate]);

  const subCards = useAndLoadSubCards(variant?.id);
  const currentPathIsSelf = location.pathname.match(new RegExp(`card/${card.id}`)) != null;

  const shouldZoomOnClick = currentPathIsSelf == false && (subCards?.length ?? 0 > 0);

  const clickOnCardTitleCb = React.useCallback(
    (e: React.MouseEvent) => {
      navigateToEditPageCb();
      e.stopPropagation();
    },
    [navigateToEditPageCb],
  );

  const clickOnCardContentCb = React.useCallback(
    (e: React.MouseEvent) => {
      if (shouldZoomOnClick) {
        navigateToZoomPageCb();
      } else {
        navigateToEditPageCb();
      }
      e.stopPropagation();
    },
    [shouldZoomOnClick, navigateToZoomPageCb, navigateToEditPageCb],
  );

  const [organize, setOrganize] = React.useState(false);

  if (cardId == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants}>
        <>
          <div
            onClick={clickOnCardTitleCb}
            className={css({
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              borderBottom:
                card.color && card.color != '#ffffff'
                  ? '3px solid ' + card.color
                  : '3px solid var(--lightGray)',
              width: '100%',
              cursor: 'pointer',
            })}
          >
            <div
              className={css({
                padding: space_S + ' ' + space_S + ' ' + space_S + ' ' + space_M,
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ flexGrow: 1 })}>
                  <CardContentStatus mode="icon" status={variant?.status || 'ACTIVE'} />
                  <span className={css({ fontWeight: 'bold' })}>
                    {card.title || i18n.modules.card.untitled}
                  </span>
                  {hasVariants && (
                    <span className={variantTitle}>
                      &#xFE58;
                      {variant?.title && variant.title.length > 0
                        ? variant.title
                        : `${i18n.modules.card.variant} ${variantNumber}`}
                    </span>
                  )}
                </div>
                {/* handle modal routes*/}
                <Routes>
                  <Route
                    path={`${cardId}/settings`}
                    element={
                      <Modal
                        title={i18n.modules.card.settings.title}
                        onClose={() => closeRouteCb(`${cardId}/settings`)}
                        showCloseButton
                      >
                        {closeModal =>
                          variant != null ? (
                            <CardSettings onClose={closeModal} card={card} variant={variant} />
                          ) : (
                            <InlineLoading />
                          )
                        }
                      </Modal>
                    }
                  />
                  <Route
                    path={`${cardId}/involvements`}
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
                    path={`${cardId}/v/${variant?.id}/completion`}
                    element={
                      <Modal
                        title={i18n.modules.card.editCompletion}
                        onClose={() => closeRouteCb(`${cardId}/v/${variant?.id}/completion`)}
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
                    path={`${cardId}/position`}
                    element={
                      <Modal
                        title={i18n.modules.card.settings.cardPosition}
                        onClose={() => closeRouteCb(`${cardId}/position`)}
                        showCloseButton
                      >
                        {() => <PositionEditor card={card} />}
                      </Modal>
                    }
                  />
                  <Route
                    path={`${cardId}/delete`}
                    element={
                      <ConfirmDeleteModal
                        title={i18n.modules.card.deleteCardVariant(hasVariants)}
                        message={<p>{i18n.modules.card.confirmDeleteCardVariant(hasVariants)}</p>}
                        onCancel={() => closeRouteCb(`${cardId}/delete`)}
                        onConfirm={() => {
                          startLoading();
                          if (hasVariants) {
                            dispatch(API.deleteCardContent(variant)).then(stopLoading);
                          } else {
                            dispatch(API.deleteCard(card)).then(() => {
                              stopLoading();
                              navigate('../');
                            });
                          }
                        }}
                        confirmButtonLabel={i18n.modules.card.deleteCardVariant(hasVariants)}
                        isConfirmButtonLoading={isLoading}
                      />
                    }
                  />
                </Routes>
                <DropDownMenu
                  icon={faEllipsisV}
                  valueComp={{ value: '', label: '' }}
                  buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                  entries={[
                    {
                      value: 'edit',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPen} /> {i18n.common.edit}
                        </>
                      ),
                      action: navigateToEditPageCb,
                    },
                    {
                      value: 'settings',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}
                        </>
                      ),
                      action: () => {
                        navigate(`${cardId}/settings`);
                      },
                    },
                    {
                      value: 'involvements',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faUsers} /> {i18n.modules.card.involvements}
                        </>
                      ),
                      action: () => navigate(`${cardId}/involvements`),
                    },
                    {
                      value: 'completion',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPercent} /> {i18n.modules.card.completion}
                        </>
                      ),
                      action: () => {
                        navigate(`${cardId}/v/${variant!.id}/completion`);
                      },
                    },
                    {
                      value: 'position',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faFrog} /> {i18n.modules.card.position}
                        </>
                      ),
                      action: () => {
                        navigate(`${cardId}/position`);
                      },
                    },
                    {
                      value: 'delete',
                      label: (
                        <>
                          <FontAwesomeIcon color={errorColor} icon={faTrash} />{' '}
                          {i18n.modules.card.deleteCardVariant(hasVariants)}
                        </>
                      ),
                      action: () => navigate(`${cardId}/delete`),
                    },
                  ]}
                />
              </div>
              {/*
              // Show nb of sticky notes and resources under card title.
              // Commented temporarily for first online version. Full data is not complete on first load. Erroneous data displayed yet.
              // To discuss.
              <Flex
                className={css({
                  color: 'var(--lightGray)',
                  gap: space_M,
                  fontSize: '0.85em',
                  paddingRight: space_S,
                })}
              >
                <div>
                  <FontAwesomeIcon icon={faStickyNote} /> {nbStickyNotes}
                </div>
                <div>
                  <FontAwesomeIcon icon={faFile} /> {nbResources}
                </div>
              </Flex> */}
            </div>
          </div>
          <Flex
            grow={1}
            align="stretch"
            direction="column"
            onClick={clickOnCardContentCb}
            className={cx({
              [css({ minHeight: space_L, cursor: shouldZoomOnClick ? 'zoom-in' : 'pointer' })]:
                true,
              [css({
                padding: space_M,
              })]: depth > 0,
            })}
            justify="center"
          >
            {mayOrganize && (
              <FeaturePreview>
                <Toggler
                  className={css({ alignSelf: 'flex-end' })}
                  label={i18n.modules.card.positioning.toggleText}
                  value={organize}
                  onChange={setOrganize}
                />
              </FeaturePreview>
            )}

            {showPreview && variant && (
              <FeaturePreview>
                <DocumentPreview
                  className={css({
                    flexShrink: '1',
                    flexGrow: '1',
                    flexBasis: '1px',
                    position: 'relative',
                    overflow: 'hidden',
                    '::before': {
                      content: '" "',
                      background: 'linear-gradient(#FFF0, #fff 100%)',
                      position: 'absolute',
                      width: '100%',
                      bottom: '0',
                      top: '75%',
                      pointerEvents: 'none',
                    },
                    ':empty': {
                      display: 'none',
                    },
                  })}
                  docOwnership={{
                    kind: 'DeliverableOfCardContent',
                    ownerId: variant.id!,
                  }}
                />
              </FeaturePreview>
            )}
            {showSubcards ? (
              variant != null ? (
                <ContentSubs
                  minCardWidth={100}
                  depth={depth}
                  cardContent={variant}
                  organize={organize}
                  showPreview={false}
                />
              ) : (
                <i>{i18n.modules.content.none}</i>
              )
            ) : null}
          </Flex>
        </>
      </CardLayout>
    );
  }
}
