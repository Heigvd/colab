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
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import {
  heading_xs,
  lightIconButtonStyle,
  oneLineEllipsisStyle,
  p_xs,
  space_sm,
} from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import { DiscreetInput } from '../common/element/Input';
import { FeaturePreview } from '../common/element/Tips';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import DocumentPreview from '../documents/preview/DocumentPreview';
import CardContentStatusDisplay from './CardContentStatusDisplay';
import CardContentStatusSelector from './CardContentStatusSelector';
import CardCreator from './CardCreator';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import CardLayout from './CardLayout';
import CardSettings from './CardSettings';
import { ProgressBar } from './ProgressBar';
import SubCardsGrid from './SubCardsGrid';

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
  withoutHeader?: boolean;
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
  withoutHeader = false,
}: CardThumbProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const { canWrite } = useCardACLForCurrentUser(card.id);
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

  const navigateToCb = React.useCallback(() => {
    const path = `card/${cardId}/v/${variant?.id}`;
    if (location.pathname.match(/(card)\/\d+\/v\/\d+/)) {
      navigate(`../${path}`);
    } else {
      navigate(path);
    }
  }, [variant, cardId, location.pathname, navigate]);

  // const subCards = useAndLoadSubCards(variant?.id);
  // const currentPathIsSelf = location.pathname.match(new RegExp(`card/${card.id}`)) != null;

  // const shouldZoomOnClick = currentPathIsSelf == false && (subCards?.length ?? 0 > 0);

  const clickOnCardCb = React.useCallback(
    (e: React.MouseEvent) => {
      navigateToCb();
      e.stopPropagation();
    },
    [navigateToCb],
  );

  const [organize, setOrganize] = React.useState(false);

  if (cardId == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants} className={className}>
        <Flex grow="1" align="stretch" className={css({ overflow: 'hidden' })}>
          {mayOrganize && variant && (
            <CardCreatorAndOrganize
              organize={{
                organize: organize,
                setOrganize: setOrganize,
              }}
              rootContent={variant}
            />
          )}

          <Flex direction="column" grow={1} align="stretch" onClick={clickOnCardCb}>
            {!withoutHeader && (
              <div
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
                    className={cx(
                      'flexItem+1',
                      css({
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }),
                    )}
                  >
                    <Flex
                      align="center"
                      className={cx(
                        cardThumbTitleStyle(depth),
                        'FlexItem',
                        css({ flexGrow: 1, justifyContent: 'space-between' }),
                      )}
                    >
                      <DiscreetInput
                        value={card.title || ''}
                        placeholder={i18n.modules.card.untitled}
                        readOnly={!canWrite || variant?.frozen}
                        onChange={newValue =>
                          dispatch(API.updateCard({ ...card, title: newValue }))
                        }
                        inputDisplayClassName={cx(heading_xs, css({ textOverflow: 'ellipsis' }))}
                        containerClassName={css({ flexGrow: 1 })}
                        autoWidth={false}
                      />
                      <Flex className={css({ margin: '0 ' + space_sm })}>
                        {depth === 0 ? (
                          <CardContentStatusDisplay kind="icon_only" status={variant?.status} />
                        ) : (
                          <div onClick={event => event.stopPropagation()}>
                            <CardContentStatusSelector
                              value={variant?.status}
                              readOnly={!canWrite || variant?.frozen}
                              onChange={status =>
                                dispatch(API.updateCardContent({ ...variant!, status }))
                              }
                            />
                          </div>
                        )}
                      </Flex>
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
                            message={
                              <p>{i18n.modules.card.confirmDeleteCardVariant(hasVariants)}</p>
                            }
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
                </div>
                <ProgressBar variant={variant} />
              </div>
            )}
            <Flex
              grow={1}
              align="stretch"
              direction="column"
              className={cx(
                cardThumbContentStyle(depth),
                {
                  [css({
                    //minHeight: space_L,
                    cursor: 'pointer',
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
                  <SubCardsGrid
                    cardContent={variant}
                    depth={depth}
                    organize={organize}
                    showPreview={false}
                    minCardWidth={100}
                    cardSize={{ width: card.width, height: card.height }}
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
