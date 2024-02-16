/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useCurrentProject } from '../../store/selectors/projectSelector';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import { dropDownMenuDefaultIcon, putInBinDefaultIcon } from '../../styling/IconDefault';
import {
  heading_sm,
  lightIconButtonStyle,
  space_md,
  space_sm,
  space_xs,
} from '../../styling/style';
import { cardColors } from '../../styling/theme';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { TipsCtx } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';
import { CardEditorDeletedBanner } from './CardEditorDeletedBanner';
import { getCardTitle } from './CardTitle';
import DeletionChoiceCardAndContent from './DeletionChoiceCardAndContent';
import { ProgressBarEditor } from './ProgressBar';
import SharingLinkPanelModalOnClick from './SharingLink';
import StatusDropDown, { StatusSubDropDownEntry } from './StatusDropDown';
import { VariantPager } from './VariantSelector';

interface CardEditorHeaderProps {
  card: Card;
  cardContent: CardContent;
  setSplitterPlace: React.Dispatch<React.SetStateAction<'TOP' | 'MIDDLE' | 'BOTTOM' | undefined>>;
  preventVariantSelection?: boolean;
  readOnly?: boolean;
}
export default function CardEditorHeader({
  card,
  cardContent,
  setSplitterPlace,
  preventVariantSelection,
  readOnly,
}: CardEditorHeaderProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  const { project: currentProjectProject } = useCurrentProject();

  const tipsConfig = React.useContext(TipsCtx);

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && cardContent != null;
  const variantNumber = hasVariants ? variants.indexOf(cardContent) + 1 : undefined;

  const showVariantSelection = !preventVariantSelection;

  const goto = React.useCallback(
    (card: Card, cardContent: CardContent) => {
      navigate(`../card/${card.id}/v/${cardContent.id}`);
    },
    [navigate],
  );

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        className={css({
          backgroundColor: `${card.color || cardColors.white}`,
        })}
      >
        <ProjectBreadcrumbs card={card} cardContent={cardContent} />
        <CardEditorDeletedBanner card={card} cardContent={cardContent} />
        <Flex
          justify="space-between"
          className={css({
            alignItems: 'center',
            padding: '0 ' + space_sm,
          })}
        >
          <Flex align="center">
            <DiscreetInput
              value={card.title || ''}
              placeholder={i18n.modules.card.untitled}
              readOnly={readOnly}
              onChange={newValue => dispatch(API.updateCard({ ...card, title: newValue }))}
              inputDisplayClassName={heading_sm}
              autoWidth={true}
            />
            {hasVariants && (
              <>
                <span>&#xFE58;</span>
                <DiscreetInput
                  value={
                    cardContent.title && cardContent.title.length > 0
                      ? cardContent.title
                      : showVariantSelection
                      ? i18n.modules.card.variant + `${variantNumber}`
                      : ''
                  }
                  placeholder={i18n.modules.content.untitled}
                  readOnly={readOnly}
                  onChange={newValue =>
                    dispatch(API.updateCardContent({ ...cardContent, title: newValue }))
                  }
                />
                {showVariantSelection && <VariantPager card={card} current={cardContent} />}
              </>
            )}
            {cardContent.frozen /* display only if is locked */ && (
              <Icon
                icon={'lock'}
                title={i18n.modules.card.infos.cardLocked}
                color={'var(--gray-400)'}
                className={css({ padding: space_sm, background: 'none' })}
              />
            )}
            {cardContent.status != null /* display only if has a status */ && (
              <StatusDropDown
                value={cardContent.status}
                readOnly={readOnly}
                onChange={status => dispatch(API.updateCardContent({ ...cardContent, status }))}
                kind="outlined"
              />
            )}
          </Flex>
          {currentUser?.admin && tipsConfig.DEBUG.value && (
            <Flex
              align="center"
              className={css({ boxShadow: '0 0 14px 2px fuchsia', borderRadius: '4px' })}
            >
              {cardContent.lexicalConversion}
              {cardContent.lexicalConversion !== 'VERIFIED' ? (
                <Button
                  title="is verified"
                  icon="check"
                  iconSize="xs"
                  className={css({ padding: space_xs, margin: '0 ' + space_md })}
                  onClick={() => {
                    dispatch(
                      API.changeCardContentLexicalConversionStatus({
                        cardContentId: cardContent.id!,
                        conversionStatus: 'VERIFIED',
                      }),
                    );
                  }}
                />
              ) : (
                <Icon icon="check" />
              )}
            </Flex>
          )}

          {/* View mode btn *********************************************** */}

          <Flex align="center">
            <IconButton
              title={i18n.modules.card.editor.contentOnly}
              icon={'subtitles'}
              kind="ghost"
              iconSize="xs"
              onClick={() => {
                setSplitterPlace('BOTTOM');
              }}
              className={css({ marginRight: space_sm, backgroundColor: 'transparent' })}
            />
            <IconButton
              title={i18n.modules.card.editor.split}
              icon={'space_dashboard'}
              kind="ghost"
              iconSize="xs"
              onClick={() => {
                setSplitterPlace('MIDDLE');
              }}
              className={css({ marginRight: space_sm, backgroundColor: 'transparent' })}
            />
            <IconButton
              title={i18n.modules.card.editor.cardsOnly}
              icon={'iframe'}
              kind="ghost"
              iconSize="xs"
              onClick={() => {
                setSplitterPlace('TOP');
              }}
              className={css({ marginRight: space_sm, backgroundColor: 'transparent' })}
            />

            <DropDownMenu
              icon={dropDownMenuDefaultIcon}
              valueComp={{ value: '', label: '' }}
              buttonClassName={lightIconButtonStyle}
              entries={[
                {
                  value: 'changeStatus',
                  label: (
                    <StatusSubDropDownEntry
                      mainLabel={i18n.modules.card.action.changeStatus}
                      onChange={newStatus => {
                        dispatch(
                          API.updateCardContent({
                            ...cardContent,
                            status: newStatus ?? null,
                          }),
                        );
                      }}
                    />
                  ),
                  subDropDownButton: true,
                },
                {
                  value: 'changeLock',
                  label: (
                    <>
                      {cardContent.frozen ? (
                        <>
                          <Icon icon={'lock_open'} />
                          {i18n.modules.card.action.unlock}
                        </>
                      ) : (
                        <>
                          <Icon icon={'lock'} />
                          {i18n.modules.card.action.lock}
                        </>
                      )}
                    </>
                  ),
                  action: () => {
                    dispatch(
                      API.updateCardContent({ ...cardContent, frozen: !cardContent.frozen }),
                    );
                  },
                },
                ...(currentUser?.admin && card.cardTypeId == null
                  ? [
                      {
                        value: 'createType',
                        label: (
                          <>
                            <Icon icon={'account_tree'} />
                            {i18n.modules.card.action.createAType}
                          </>
                        ),
                        action: () => {
                          dispatch(API.createCardCardType(card.id!));
                        },
                      },
                    ]
                  : []),
                ...(currentUser?.admin && card.cardTypeId != null
                  ? [
                      {
                        value: 'removeType',
                        label: (
                          <>
                            <Icon icon={'eco'} /> {i18n.modules.card.action.removeTheType}
                          </>
                        ),
                        action: () => {
                          dispatch(API.removeCardCardType(card.id!));
                        },
                      },
                    ]
                  : []),
                {
                  value: 'createVariant',
                  label: (
                    <>
                      <Icon icon={'library_add'} /> {i18n.modules.card.addVariant}
                    </>
                  ),
                  action: () => {
                    dispatch(API.createCardContentVariant(card.id!)).then(payload => {
                      if (payload.meta.requestStatus === 'fulfilled') {
                        if (entityIs(payload.payload, 'CardContent')) {
                          goto(card, payload.payload);
                        }
                      }
                    });
                  },
                },
                ...(currentProjectProject != null && card != null
                  ? [
                      {
                        value: 'sharingLink',
                        label: (
                          <SharingLinkPanelModalOnClick
                            project={currentProjectProject}
                            card={card}
                          />
                        ),
                      },
                    ]
                  : []),
                ...(hasVariants
                  ? [
                      {
                        value: 'doubleDeletion',
                        label: (
                          <DeletionChoiceCardAndContent card={card} cardContent={cardContent} />
                        ),
                        subDropDownButton: true,
                      },
                    ]
                  : [
                      {
                        value: 'putCardInBin',
                        label: (
                          <>
                            <Icon icon={putInBinDefaultIcon} /> {i18n.common.bin.action.moveToBin}
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
          </Flex>
        </Flex>
      </Flex>
      {/* The margin bottom is a hack to see all the cursor circle */}
      <Flex direction="column" align="stretch" className={css({ marginBottom: '1px' })}>
        <ProgressBarEditor card={card} variant={cardContent} readOnly={readOnly} />
      </Flex>
    </>
  );
}
