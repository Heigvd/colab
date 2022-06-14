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
import { useAppDispatch } from '../../store/hooks';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import InlineLoading from '../common/InlineLoading';
import Modal from '../common/Modal';
import { errorColor, lightIconButtonStyle, space_M, space_S, variantTitle } from '../styling/style';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import CompletionEditor from './CompletionEditor';
import ContentSubs from './ContentSubs';
import PositionEditor from './PositionEditor';

interface Props {
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
}: Props): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;

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
    route => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

  const cardId = card.id;

  if (cardId == null) {
    return <i>Card without id is invalid...</i>;
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
                <div>
                  <span className={css({ fontWeight: 'bold' })}>
                    {card.title || i18n.card.untitled}
                  </span>
                  {hasVariants && (
                    <span className={variantTitle}>
                      &#xFE58;
                      {variant?.title && variant.title.length > 0
                        ? variant.title
                        : `Variant ${variantNumber}`}
                    </span>
                  )}
                </div>
                {/* handle modal routes*/}
                <Routes>
                  <Route
                    path={`${cardId}/settings`}
                    element={
                      <Modal
                        title="Card Settings"
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
                        title="Card completion"
                        onClose={() => closeRouteCb(`${cardId}/v/${variant?.id}/completion`)}
                        showCloseButton
                      >
                        {() => variant && <CompletionEditor variant={variant} />}
                      </Modal>
                    }
                  />
                  <Route
                    path={`${cardId}/position`}
                    element={
                      <Modal
                        title="Card position"
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
                      value: 'edit card',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPen} /> Edit Card
                        </>
                      ),
                      action: () => {
                        const path = `edit/${cardId}/v/${variant?.id}`;
                        if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
                          navigate(`../${path}`);
                        } else {
                          navigate(path);
                        }
                      },
                    },
                    {
                      value: 'settings',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faCog} /> Card Settings
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
                          <FontAwesomeIcon icon={faPercent} /> Completion
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
                          <FontAwesomeIcon icon={faFrog} /> Position
                        </>
                      ),
                      action: () => {
                        navigate(`${cardId}/position`);
                      },
                    },
                    {
                      value: 'Delete card',
                      label: (
                        <ConfirmDeleteModal
                          buttonLabel={
                            <div className={css({ color: errorColor })}>
                              <FontAwesomeIcon icon={faTrash} />
                              {hasVariants ? ' Delete variant' : ' Delete card'}
                            </div>
                          }
                          message={
                            hasVariants ? (
                              <p>
                                Are you <strong>sure</strong> you want to delete this whole variant?
                                This will delete all subcards inside.
                              </p>
                            ) : (
                              <p>
                                Are you <strong>sure</strong> you want to delete this whole card?
                                This will delete all subcards inside.
                              </p>
                            )
                          }
                          onConfirm={() => {
                            if (hasVariants) {
                              dispatch(API.deleteCardContent(variant));
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
            className={
              depth > 0
                ? css({
                    padding: space_M,
                  })
                : ''
            }
            justify="center"
          >
            {showSubcards ? (
              variant != null ? (
                <ContentSubs depth={depth} cardContent={variant} />
              ) : (
                <i>{i18n.content.none}</i>
              )
            ) : null}
          </Flex>
        </>
      </CardLayout>
    );
  }
}
