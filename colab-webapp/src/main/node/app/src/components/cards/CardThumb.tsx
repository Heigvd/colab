/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectIsDirectUnderRoot, useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import { dropDownMenuDefaultIcon, putInBinDefaultIcon } from '../../styling/IconDefault';
import {
  heading_xs,
  lightIconButtonStyle,
  oneLineEllipsisStyle,
  p_xs,
  space_sm,
  text_xs,
} from '../../styling/style';
import { cardColors } from '../../styling/theme';
import DeletionStatusIndicator from '../common/element/DeletionStatusIndicator';
import { DiscreetInput, DiscreetTextArea } from '../common/element/Input';
import { Link } from '../common/element/Link';
import { FeaturePreview } from '../common/element/Tips';
import { ColorPicker } from '../common/element/color/ColorPicker';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import DocumentPreview from '../documents/preview/DocumentPreview';
import CardCreator from './CardCreator';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import CardLayout from './CardLayout';
import { getCardTitle } from './CardTitle';
import DeletionChoiceCardAndContent from './DeletionChoiceCardAndContent';
import StatusDropDown, { StatusSubDropDownEntry } from './StatusDropDown';
import SubCardsGrid from './SubCardsGrid';
import { useIsCardReadOnly } from './cardRightsHooks';
import Droppable from './dnd/Droppable';

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

// TODO : show only when hovering THE card
const onHoverStyle = css({
  '&:hover': {
    '.visibleOnHover ': {
      visibility: 'visible',
    },
  },
});

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
  const readOnly = useIsCardReadOnly({ card, cardContent: variant });

  const isDirectUnderRoot: boolean = useAppSelector(state => selectIsDirectUnderRoot(state, card));

  const cardId = card.id;

  const cardPath = React.useMemo(() => {
    const path = `card/${cardId}/v/${variant?.id}`;
    if (location.pathname.match(/(card)\/\d+\/v\/\d+/)) {
      return '../' + path;
    } else {
      return path;
    }
  }, [variant, cardId, location.pathname]);

  const navigateToCb = React.useCallback(() => {
    navigate(cardPath);
  }, [navigate, cardPath]);

  const hasSubCards = (useAndLoadSubCards(variant?.id)?.length || 0) > 0;
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
            <Flex
              grow="1"
              align="stretch"
              className={cx(onHoverStyle, css({ overflow: 'hidden' }))}
            >
              {mayOrganize && variant && (
                <CardCreatorAndOrganize
                  rootContent={variant}
                  showOrganize={hasSubCards}
                  organize={{
                    organize: organize,
                    setOrganize: setOrganize,
                  }}
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
                          // justify="stretch"
                          className={cx('FlexItem', css({ flexGrow: 1 }))}
                        >
                          {card.deletionStatus != null && (
                            <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                              {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                              <DeletionStatusIndicator status={card.deletionStatus} size="sm" />
                            </Flex>
                          )}
                          {depth === 1 ? (
                            <DiscreetInput
                              value={card.title || ''}
                              placeholder={i18n.modules.card.untitled}
                              readOnly={readOnly}
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
                              readOnly={readOnly}
                              onChange={newValue =>
                                dispatch(API.updateCard({ ...card, title: newValue }))
                              }
                              inputDisplayClassName={cx(
                                text_xs,
                                css({
                                  resize: 'none',
                                  '&::placeholder': placeHolderStyle,
                                  overflow: 'hidden',
                                  // whiteSpace: 'nowrap', // no wrap because we want multiple lines
                                  maxWidth: 'calc(100% - 18px)',
                                  display: 'inline-block',
                                  padding: '6px 6px 2px 6px',
                                  margin: '2px 2px 6px 2px',
                                }),
                              )}
                              containerClassName={css({ flexGrow: 1 })}
                              autoWidth={false}
                              rows={2}
                            />
                          )}
                          {depth === 1 &&
                            variant?.status != null /* display only if has a status */ && (
                              <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                                <StatusDropDown
                                  value={variant?.status}
                                  readOnly={readOnly}
                                  onChange={status =>
                                    dispatch(API.updateCardContent({ ...variant!, status }))
                                  }
                                  kind={'icon_only'}
                                  iconSize="xxs"
                                />
                              </Flex>
                            )}
                          {hasVariants && (
                            <span className={cx(oneLineEllipsisStyle, css({ minWidth: '50px' }))}>
                              &#xFE58;
                              {variant?.title && variant.title.length > 0
                                ? variant.title
                                : `${i18n.modules.card.variant} ${variantNumber}`}
                              {variant.deletionStatus != null && (
                                <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                                  {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                                  <DeletionStatusIndicator
                                    status={variant.deletionStatus}
                                    size="sm"
                                  />
                                </Flex>
                              )}
                            </span>
                          )}
                        </Flex>

                        <DropDownMenu
                          icon={dropDownMenuDefaultIcon}
                          valueComp={{ value: '', label: '' }}
                          buttonClassName={
                            'visibleOnHover ' +
                            cx(lightIconButtonStyle, css({ visibility: 'hidden' }))
                          }
                          className={css({ alignSelf: depth === 0 ? 'flex-start' : 'center' })}
                          entries={[
                            {
                              value: 'edit',
                              label: (
                                <Link to={cardPath}>
                                  <Icon icon={'edit'} /> {i18n.common.edit}
                                </Link>
                              ),
                            },
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
                                          />
                                        )}
                                      </>
                                    ),
                                  },
                                ]
                              : []),
                            ...(variant
                              ? [
                                  {
                                    value: 'changeStatus',
                                    label: (
                                      <StatusSubDropDownEntry
                                        mainLabel={i18n.modules.card.action.changeStatus}
                                        onChange={newStatus => {
                                          dispatch(
                                            API.updateCardContent({
                                              ...variant,
                                              status: newStatus ?? null,
                                            }),
                                          );
                                        }}
                                      />
                                    ),
                                    subDropDownButton: true,
                                  },
                                ]
                              : []),
                            {
                              value: 'color',
                              label: (
                                <ColorPicker
                                  colors={Object.values(cardColors)}
                                  onChange={newColor => {
                                    dispatch(API.updateCard({ ...card, color: newColor.hex }));
                                  }}
                                  color={card.color}
                                  width="auto"
                                  className={css({ padding: space_sm })}
                                />
                              ),
                            },
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
                            ...(hasVariants && variant != null
                              ? [
                                  {
                                    value: 'doubleDeletion',
                                    label: (
                                      <DeletionChoiceCardAndContent
                                        card={card}
                                        cardContent={variant}
                                      />
                                    ),
                                    subDropDownButton: true,
                                  },
                                ]
                              : [
                                  {
                                    value: 'putCardInBin',
                                    label: (
                                      <>
                                        <Icon icon={putInBinDefaultIcon} />{' '}
                                        {i18n.common.bin.action.moveToBin}
                                      </>
                                    ),
                                    action: () => {
                                      dispatch(API.putCardInBin(card));
                                      dispatch(
                                        addNotification({
                                          status: 'OPEN',
                                          type: 'INFO',
                                          message: i18n.common.bin.info.movedToBin.card(
                                            getCardTitle({ card, i18n }),
                                          ),
                                        }),
                                      );
                                    },
                                  },
                                ]),
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
