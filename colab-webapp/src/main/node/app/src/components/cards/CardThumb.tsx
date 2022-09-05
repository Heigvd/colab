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
import ConfirmDeleteModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import {
  errorColor,
  lightIconButtonStyle,
  space_L,
  space_M,
  space_S,
  variantTitle,
} from '../styling/style';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import CompletionEditor from './CompletionEditor';
import ContentSubs from './ContentSubs';
import PositionEditor from './PositionEditor';

interface CardThumbProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
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
  const hasSubCards = subCards?.length ?? 0 > 0;

  const clickOnCardTitleCb = React.useCallback(
    (e: React.MouseEvent) => {
      navigateToEditPageCb();
      e.stopPropagation();
    },
    [navigateToEditPageCb],
  );

  const clickOnCardContentCb = React.useCallback(
    (e: React.MouseEvent) => {
      if (hasSubCards) {
        navigateToZoomPageCb();
      } else {
        navigateToEditPageCb();
      }
      e.stopPropagation();
    },
    [hasSubCards, navigateToZoomPageCb, navigateToEditPageCb],
  );

  if (cardId == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants}>
        <>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              borderBottom:
                card.color && card.color != '#ffffff'
                  ? '3px solid ' + card.color
                  : '1px solid var(--lightGray)',
              width: '100%',
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
                <div
                  className={css({ flexGrow: 1, cursor: 'pointer' })}
                  onClick={clickOnCardTitleCb}
                >
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
                        <ConfirmDeleteModal
                          buttonLabel={
                            <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                              <FontAwesomeIcon icon={faTrash} />
                              {i18n.modules.card.deleteCardVariant(hasVariants)}
                            </div>
                          }
                          className={css({
                            '&:hover': { textDecoration: 'none' },
                            display: 'flex',
                            alignItems: 'center',
                          })}
                          message={i18n.modules.card.confirmDeleteCardVariant(hasVariants)}
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
                      ),
                      modal: true,
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
            onClick={clickOnCardContentCb}
            className={cx({
              [css({ minHeight: space_L, cursor: hasSubCards ? 'zoom-in' : 'pointer' })]: true,
              [css({
                padding: space_M,
              })]: depth > 0,
            })}
            justify="center"
          >
            {showSubcards ? (
              variant != null ? (
                <ContentSubs depth={depth} cardContent={variant} />
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
