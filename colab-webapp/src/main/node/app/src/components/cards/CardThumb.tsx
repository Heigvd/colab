/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadSubCards } from '../../selectors/cardSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import { FeaturePreview } from '../common/element/Tips';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import DocumentPreview from '../documents/preview/DocumentPreview';
import { CardCreatorAndOrganize } from '../projects/edition/Editor';
import {
  heading_xs,
  lightIconButtonStyle,
  oneLineEllipsisStyle,
  p_xs,
  space_sm,
} from '../styling/style';
import CardContentStatus from './CardContentStatus';
import CardCreator from './CardCreator';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import ContentSubs from './ContentSubs';

const cardThumbTitleStyle = (depth?: number) => {
  switch (depth) {
    case 0:
      return css({
        fontSize: '0.8em',
      });
    case 1:
      return css({
        fontSize: '0.9em',
      });
    default:
      return undefined;
  }
};

const cardThumbContentStyle = (depth?: number) => {
  switch (depth) {
    case 0:
      return css({
        height: '28px',
      });
    case 1:
      return css({
        height: 'auto',
      });
    default:
      return undefined;
  }
};

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
        border: `2px solid var(--divider-main)`,
        borderRadius: '4px',
        margin: '3px',
      })}
      title={(card.title && i18n.modules.card.subcardTooltip(card.title)) || undefined}
    >
      <div
        className={css({
          height: '3px',
          width: '100%',
          borderBottom: `2px solid ${card.color || 'var(--divider-main)'}`,
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
  showPreview?: boolean;
  className?: string;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
  mayOrganize,
  showPreview,
  className,
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
      <CardLayout card={card} variant={variant} variants={variants} className={className}>
        <Flex align="stretch" className={css({ overflow: 'hidden' })}>
          {mayOrganize && variant && (
            <CardCreatorAndOrganize
              organize={{
                organize: organize,
                setOrganize: setOrganize,
              }}
              rootContent={variant}
            />
          )}
          {/* <Flex direction="column" gap={space_sm} wrap="nowrap" align="center">
              <IconButton
                variant='ghost'
                className={cx(
                  css({ alignSelf: 'flex-end' }),
                  organize &&
                    css({
                      backgroundColor: 'var(--success-main)',
                      color: 'var(--bg-primary)',
                      border: 'var(--success-main)',
                    }),
                )}
                title={i18n.modules.card.positioning.toggleText}
                icon={'view_quilt'}
                //value={organize.organize}
                onClick={e => {
                  e.stopPropagation();
                  setOrganize(v => !v);
                }}
              />
              <CardCreator parentCardContent={variant} className={lightIconButtonStyle} />
            </Flex> */}
          <Flex direction="column" grow={1} align="stretch">
            <div
              onClick={clickOnCardTitleCb}
              className={cx(
                css({
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  borderTop:
                    card.color && card.color != '#ffffff'
                      ? '5px solid ' + card.color
                      : '3px solid var(--bg-primary)',
                  borderBottom: '1px solid var(--divider-fade)',
                  width: '100%',
                  cursor: 'pointer',
                }),
              )}
            >
              <div className={p_xs}>
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  })}
                >
                  <Flex
                    align="center"
                    className={cx(cardThumbTitleStyle(depth), css({ flexGrow: 1 }))}
                  >
                    <CardContentStatus mode="icon" status={variant?.status || 'ACTIVE'} />
                    <span
                      className={cx(heading_xs, css({ minWidth: '50px' }), oneLineEllipsisStyle)}
                    >
                      {card.title || i18n.modules.card.untitled}
                    </span>
                    {hasVariants && (
                      <span className={cx(oneLineEllipsisStyle, css({ minWidth: '50px' }))}>
                        &#xFE58;
                        {variant?.title && variant.title.length > 0
                          ? variant.title
                          : `${i18n.modules.card.variant} ${variantNumber}`}
                      </span>
                    )}
                  </Flex>
                  {/* handle modal routes*/}
                  <Routes>
                    <Route
                      path={`${cardId}/settings`}
                      element={
                        <Modal
                          title={i18n.modules.card.settings.title}
                          onClose={() => closeRouteCb(`${cardId}/settings`)}
                          showCloseButton
                          modalBodyClassName={css({ overflowY: 'visible' })}
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
                                closeRouteCb(`${cardId}/delete`);
                              });
                            }
                          }}
                          confirmButtonLabel={i18n.modules.card.deleteCardVariant(hasVariants)}
                          isConfirmButtonLoading={isLoading}
                        />
                      }
                    />
                  </Routes>
                  {depth === 1 && (
                    <DropDownMenu
                      icon={'more_vert'}
                      valueComp={{ value: '', label: '' }}
                      buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_sm }))}
                      entries={[
                        {
                          value: 'newSubcard',
                          label: (
                            <>
                              {variant && (
                                <CardCreator
                                  parentCardContent={variant}
                                  display="dropdown"
                                  customLabel={i18n.modules.card.createSubcard}
                                />
                              )}
                            </>
                          ),
                        },
                        {
                          value: 'edit',
                          label: (
                            <>
                              <Icon icon={'edit'} /> {i18n.common.edit}
                            </>
                          ),
                          action: navigateToEditPageCb,
                        },
                        {
                          value: 'settings',
                          label: (
                            <>
                              <Icon icon={'settings'} /> {i18n.common.settings}
                            </>
                          ),
                          action: () => {
                            navigate(`${cardId}/settings`);
                          },
                        },
                        {
                          value: 'delete',
                          label: (
                            <>
                              <Icon color={'var(--error-main)'} icon={'delete'} />{' '}
                              {i18n.modules.card.deleteCardVariant(hasVariants)}
                            </>
                          ),
                          action: () => navigate(`${cardId}/delete`),
                        },
                      ]}
                    />
                  )}
                </div>
                {/*
              // Show nb of sticky notes and resources under card title.
              // Commented temporarily for first online version. Full data is not complete on first load. Erroneous data displayed yet.
              // To discuss.
              <Flex
                className={css({
                  color: 'var(--divider-main)',
                  gap: space_M,
                  fontSize: '0.85em',
                  paddingRight: space_S,
                })}
              >
                <div>
                   <Icon icon={faStickyNote} /> {nbStickyNotes}
                </div>
                <div>
                   <Icon icon={faFile} /> {nbResources}
                </div>
              </Flex> */}
              </div>
            </div>
            <Flex
              grow={1}
              align="stretch"
              direction="column"
              onClick={clickOnCardContentCb}
              className={cx(
                cardThumbContentStyle(depth),
                {
                  [css({
                    //minHeight: space_L,
                    cursor: shouldZoomOnClick ? 'zoom-in' : 'pointer',
                  })]: true,
                  [css({
                    padding: space_sm,
                  })]: depth > 0,
                },
                css({ overflow: 'auto' }),
              )}
              justify="stretch"
            >
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
                    cardSize={{ width: card.width, height: card.height }}
                    organize={organize}
                    showPreview={false}
                  />
                ) : (
                  <i>{i18n.modules.content.none}</i>
                )
              ) : null}
            </Flex>
          </Flex>
        </Flex>
      </CardLayout>
    );
  }
}
