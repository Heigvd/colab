/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faQuestionCircle, faSnowflake } from '@fortawesome/free-regular-svg-icons';
import {
  faCog,
  faEllipsisV,
  faFileAlt,
  faStickyNote,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
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
import SelectInput from '../common/Form/SelectInput';
import IconButton from '../common/IconButton';
import InlineInput from '../common/InlineInput';
import Modal from '../common/Modal';
import OpenCloseModal from '../common/OpenCloseModal';
import Tips from '../common/Tips';
import DocTextDisplay from '../documents/DocTextDisplay';
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

  const closeRouteCb = React.useCallback(
    route => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
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
            direction="row"
            justify="space-between"
            align="stretch"
            className={cx(
              cardStyle,
              css({
                backgroundColor: 'white',
              }),
            )}
          >
            <Flex direction="column" grow={1} align="stretch">
              <Flex
                direction="column"
                grow={1}
                className={css({
                  padding: '10px',
                  overflow: 'auto',
                })}
                align="stretch"
              >
                <Flex direction="column" align="stretch">
                  <Flex
                    justify="space-between"
                    className={css({
                      paddingBottom: space_S,
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
                        <InlineInput
                          placeholder={i18n.card.untitled}
                          readOnly={readOnly}
                          value={card.title || ''}
                          onChange={newValue =>
                            dispatch(API.updateCard({ ...card, title: newValue }))
                          }
                          className={cardTitle}
                          autosave={false}
                        />
                        {hasVariants && (
                          <>
                            <span className={variantTitle}>&#xFE58;</span>
                            <InlineInput
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
                            />
                          </>
                        )}
                        {hasCardType && (
                          <IconButton
                            icon={faQuestionCircle}
                            title="Show card model informations"
                            className={cx(
                              lightIconButtonStyle,
                              css({ color: 'var(--lightGray)' }),
                              showTypeDetails ? css({ color: 'var(--linkHoverColor)' }) : '',
                            )}
                            onClick={() => setShowTypeDetails(showTypeDetails => !showTypeDetails)}
                          />
                        )}
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
                            >
                              {closeModal => (
                                <CardSettings onClose={closeModal} card={card} variant={variant} />
                              )}
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
                          {
                            value: 'settings',
                            label: (
                              <>
                                <FontAwesomeIcon icon={faCog} title="Card settings" /> Card Settings
                              </>
                            ),
                          },
                        ]}
                        onSelect={val => {
                          val.action != null ? val.action() : navigate(val.value);
                        }}
                      />
                    </Flex>
                  </Flex>
                  {cardType && (
                    <div className={showTypeDetails ? openDetails : closeDetails}>
                      <p>
                        <b>Card type</b>: {cardType.title || ''}
                      </p>
                      <p>
                        <b>Purpose</b>: <DocTextDisplay id={cardType.purposeId} />
                      </p>
                    </div>
                  )}
                </Flex>
                <Flex direction="column" grow={1} align="stretch">
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
                  {() => (
                    <Flex direction="column">
                      <Input
                        label="Completion level"
                        value={String(variant.completionLevel || 0)}
                        onChange={newValue =>
                          dispatch(
                            API.updateCardContent({ ...variant, completionLevel: +newValue }),
                          )
                        }
                        className={css({ marginBottom: space_M })}
                      />
                      <Flex>
                        <SelectInput
                          value={String(variant.completionMode)}
                          label="Completion mode"
                          placeholder={String(variant.completionMode)}
                          options={[]}
                          onChange={() => {}}
                          isMulti={false}
                        />
                        <Tips tipsType="TODO">
                          Select completion mode (MANUAL | AUTO | NO_OP). Manual: input to set
                          completion; Auto: based on children; No: do not event diplay the bar
                          <br />
                          Shall we move all of this to card settings ??
                        </Tips>
                      </Flex>
                    </Flex>
                  )}
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
                    />
                  ),
                  icon: faFileAlt,
                  title: 'Resources',
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
    );
  }
}
