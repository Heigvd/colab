/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import { useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { selectIsDirectUnderRoot } from '../../store/selectors/cardSelector';
import {
  heading_xs,
  lightIconButtonStyle,
  m_sm,
  oneLineEllipsisStyle,
  p_0,
  p_xs,
  space_sm,
  text_xs,
} from '../../styling/style';
import { cardColors } from '../../styling/theme';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
import { FeaturePreview } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import DocumentPreview from '../documents/preview/DocumentPreview';
import CardCreator from './CardCreator';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import CardLayout from './CardLayout';
import Droppable from './dnd/Droppable';
import StatusDropDown from './StatusDropDown';
import SubCardsGrid from './SubCardsGrid';
import { PutInTrashModal, currentProjectLinkTarget } from '../common/PutInTrashModal';
import { putInTrashDefaultIcon } from '../../styling/IconDefault';
import DeletionStatusIndicator from '../common/element/DeletionStatusIndicator';

const placeHolderStyle = { color: 'var(--gray-400)' };

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

// export interface TinyCardProps {
//   card: Card;
//   width?: string;
//   height?: string;
// }

// export function TinyCard({ card, width = '15px', height = '10px' }: TinyCardProps): JSX.Element {
//   return (
//     <div
//       className={css({
//         width: width,
//         height: height,
//         border: `2px solid var(--divider-main)`,
//         borderRadius: '4px',
//         margin: '3px',
//       })}
//      <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
//        {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
//        <DeletionStatusIndicator status={card.deletionStatus} size="sm" />
//      </Flex>
//       title={card.title || undefined}
//     >
//       {/* <div
//         className={css({
//           height: '3px',
//           width: '100%',
//           borderBottom: `2px solid ${card.color || 'var(--divider-main)'}`,
//         })}
//       ></div> */}
//     </div>
//   );
// }

export interface CardThumbProps {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
  mayOrganize?: boolean;
  showPreview?: boolean;
  showAllSubCards?: boolean;
  className?: string;
  withoutHeader?: boolean;
  coveringColor?: boolean;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
  mayOrganize,
  showPreview,
  showAllSubCards,
  className,
  withoutHeader = false,
  coveringColor,
}: CardThumbProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasVariants = variants.length > 1 && variant != null;
  const variantNumber = hasVariants ? variants.indexOf(variant) + 1 : undefined;
  const { canWrite } = useCardACLForCurrentUser(card.id);

  const isDirectUnderRoot: boolean = useAppSelector(state => selectIsDirectUnderRoot(state, card));

  const [showModal, setShowModal] = React.useState<'' | 'putInTrash'>('');

  const closeModal = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showPutInTrashModal = React.useCallback(() => {
    setShowModal('putInTrash');
  }, [setShowModal]);

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

  const navigateToCardCb = React.useCallback(
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
      <>
        {showModal === 'putInTrash' && (
          <PutInTrashModal
            title={i18n.common.trash.title.card}
            message={i18n.common.trash.youCanFindItInTrash.feminine}
            onClose={closeModal}
            trashPath={currentProjectLinkTarget}
          />
        )}
        <Droppable id={variant!.id!} data={variant}>
          <CardLayout
            card={card}
            variant={variant}
            variants={variants}
            className={className}
            showProgressBar={!withoutHeader}
            coveringColor={coveringColor}
            showBorder={depth !== 2}
          >
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

              <Flex direction="column" grow={1} align="stretch" onDoubleClick={navigateToCardCb}>
                {!withoutHeader && (
                  <div
                    className={cx(
                      css({
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        width: '100%',
                        cursor: 'pointer',
                      }),
                      {
                        [css({
                          borderBottom: '1px solid var(--divider-fade)',
                        })]: depth > 0,
                      },
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
                            'FlexItem',
                            css({ flexGrow: 1, justifyContent: 'space-between' }),
                          )}
                        >
                          <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                            {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                            <DeletionStatusIndicator status={card.deletionStatus} size="sm" />
                          </Flex>
                          {depth === 1 ? (
                            <DiscreetInput
                              value={card.title || ''}
                              placeholder={i18n.modules.card.untitled}
                              readOnly={!canWrite || variant?.frozen}
                              onChange={newValue =>
                                dispatch(API.updateCard({ ...card, title: newValue }))
                              }
                              inputDisplayClassName={cx(
                                heading_xs,
                                css({
                                  textOverflow: 'ellipsis',
                                  '&::placeholder': placeHolderStyle,
                                }),
                              )}
                              containerClassName={css({ flexGrow: 1 })}
                              autoWidth={false}
                            />
                          ) : (
                            <DiscreetTextArea
                              value={card.title || ''}
                              placeholder={i18n.modules.card.untitled}
                              readOnly={!canWrite || variant?.frozen}
                              onChange={newValue =>
                                dispatch(API.updateCard({ ...card, title: newValue }))
                              }
                              inputDisplayClassName={cx(
                                text_xs,
                                m_sm,
                                p_0,
                                css({
                                  resize: 'none',
                                  '&::placeholder': placeHolderStyle,
                                }),
                              )}
                              containerClassName={css({ flexGrow: 1 })}
                              autoWidth={false}
                              rows={2}
                            />
                          )}
                          {depth === 1 && (
                            <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                              <StatusDropDown
                                value={variant?.status}
                                readOnly={!canWrite || variant?.frozen}
                                onChange={status =>
                                  dispatch(API.updateCardContent({ ...variant!, status }))
                                }
                                kind={depth ? 'outlined' : 'icon_only'}
                              />
                            </Flex>
                          )}
                          {hasVariants && (
                            <span className={cx(oneLineEllipsisStyle, css({ minWidth: '50px' }))}>
                              &#xFE58;
                              {variant?.title && variant.title.length > 0
                                ? variant.title
                                : `${i18n.modules.card.variant} ${variantNumber}`}
                            </span>
                          )}
                        </Flex>

                        <DropDownMenu
                          icon={'more_vert'}
                          valueComp={{ value: '', label: '' }}
                          buttonClassName={cx(lightIconButtonStyle)}
                          className={css({ alignSelf: depth === 0 ? 'flex-start' : 'center' })}
                          entries={[
                            ...(depth === 1
                              ? [
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
                                ]
                              : []),
                            ...(!isDirectUnderRoot
                              ? [
                                  {
                                    value: 'moveAbove',

                                    label: (
                                      <>
                                        <Icon icon={'north'} /> {i18n.common.action.moveAbove}
                                      </>
                                    ),
                                    action: () => {
                                      dispatch(API.moveCardAbove(cardId));
                                    },
                                  },
                                ]
                              : []),
                            {
                              value: 'color',
                              label: (
                                <CirclePicker
                                  colors={Object.values(cardColors)}
                                  onChangeComplete={newColor => {
                                    dispatch(API.updateCard({ ...card, color: newColor.hex }));
                                  }}
                                  color={card.color || 'white'}
                                  width={'auto'}
                                  className={css({
                                    marginTop: space_sm,
                                    padding: space_sm,
                                    'div[title="#FFFFFF"]': {
                                      background: '#FFFFFF !important',
                                      boxShadow:
                                        (card.color || '#FFFFFF').toUpperCase() === '#FFFFFF'
                                          ? 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px inset !important'
                                          : 'rgba(0, 0, 0, 0.1) 0px 0px 6px 3px !important',
                                    },
                                  })}
                                />
                              ),
                            },
                            {
                              value: 'delete',
                              label: (
                                <>
                                  <Icon icon={putInTrashDefaultIcon} />{' '}
                                  {i18n.modules.card.deleteCard}
                                </>
                              ),
                              action: () => {
                                if (cardId != null) {
                                  dispatch(API.putCardInTrash(cardId)).then(payload => {
                                    if (payload.meta.requestStatus === 'fulfilled') {
                                      showPutInTrashModal();
                                    }
                                  });
                                }
                              },
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {depth > 0 && (
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
                          alwaysShowAllSubCards={showAllSubCards}
                          cardSize={{ width: card.width, height: card.height }}
                        />
                      ) : (
                        <i>{i18n.modules.content.none}</i>
                      )
                    ) : null}
                  </Flex>
                )}
              </Flex>
            </Flex>
          </CardLayout>
        </Droppable>
      </>
    );
  }
}
