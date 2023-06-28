/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { heading_sm, lightIconButtonStyle, space_sm } from '../../styling/style';
import { cardColors } from '../../styling/theme';
import ConversionStatusDisplay from '../common/element/ConversionStatusDisplay';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { TipsCtx } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';
import CardSettings from './CardSettings';
import { ProgressBar, ProgressBarEditor } from './ProgressBar';
import StatusDropDown from './StatusDropDown';
import { VariantPager } from './VariantSelector';

interface CardEditorHeaderProps {
  card: Card;
  cardContent: CardContent;
  readOnly?: boolean;
}
export default function CardEditorHeader({
  card,
  cardContent,
  readOnly,
}: CardEditorHeaderProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useCurrentUser();

  const tipsConfig = React.useContext(TipsCtx);

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && cardContent != null;
  const variantNumber = hasVariants ? variants.indexOf(cardContent) + 1 : undefined;

  const closeRouteCb = React.useCallback(
    (route: string) => {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    },
    [location.pathname, navigate],
  );

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
        <Flex
          justify="space-between"
          className={css({
            alignItems: 'center',
            padding: '0 ' + space_sm,
            borderBottom: '1px solid var(--divider-main)',
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
                      : i18n.modules.card.variant + `${variantNumber}`
                  }
                  placeholder={i18n.modules.content.untitled}
                  readOnly={readOnly}
                  onChange={newValue =>
                    dispatch(API.updateCardContent({ ...cardContent, title: newValue }))
                  }
                />
                <VariantPager allowCreation={!readOnly} card={card} current={cardContent} />
              </>
            )}
            <IconButton
              icon={cardContent.frozen ? 'lock' : 'lock_open'}
              title={i18n.modules.card.infos.cardLocked}
              color={'var(--gray-400)'}
              onClick={() =>
                dispatch(API.updateCardContent({ ...cardContent, frozen: !cardContent.frozen }))
              }
              kind="ghost"
              className={css({ padding: space_sm, background: 'none' })}
            />
            <StatusDropDown
              value={cardContent.status}
              readOnly={readOnly}
              onChange={status => dispatch(API.updateCardContent({ ...cardContent, status }))}
              kind="outlined"
            />
          </Flex>
          {tipsConfig.DEBUG.value && (
            <Flex className={css({ boxShadow: '0 0 20px 2px fuchsia' })}>
              <ConversionStatusDisplay status={cardContent.lexicalConversion} />
            </Flex>
          )}

          {/* View mode btn *********************************************** */}

          <Flex align="center">
            <IconButton
              title="contentOnly"
              icon={'subtitles'}
              kind="ghost"
              iconSize="xs"
              className={css({ marginRight: space_sm })}
            ></IconButton>
            <IconButton
              title="Splitted"
              icon={'space_dashboard'}
              kind="ghost"
              iconSize="xs"
              className={css({ marginRight: space_sm })}
            ></IconButton>
            <IconButton
              title="cardsOnly"
              icon={'iframe'}
              kind="ghost"
              iconSize="xs"
              className={css({ marginRight: space_sm })}
            ></IconButton>

            {/* handle modal routes*/}
            <Routes>
              <Route
                path="settings"
                element={
                  <Modal
                    title={i18n.modules.card.settings.title}
                    onClose={() => closeRouteCb('settings')}
                    showCloseButton
                    modalBodyClassName={css({ overflowY: 'visible' })}
                  >
                    {closeModal => (
                      <CardSettings onClose={closeModal} card={card} variant={cardContent} />
                    )}
                  </Modal>
                }
              />
            </Routes>
            <DropDownMenu
              icon={'more_vert'}
              valueComp={{ value: '', label: '' }}
              buttonClassName={lightIconButtonStyle}
              entries={[
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
                      <Icon icon={'library_add'} /> {i18n.modules.card.createVariant}
                    </>
                  ),
                  action: () => {
                    dispatch(API.createCardContentVariantWithBlockDoc(card.id!)).then(payload => {
                      if (payload.meta.requestStatus === 'fulfilled') {
                        if (entityIs(payload.payload, 'CardContent')) {
                          goto(card, payload.payload);
                        }
                      }
                    });
                  },
                },
              ]}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" align="stretch">
        {readOnly ? (
          <ProgressBar card={card} variant={cardContent} tall />
        ) : (
          <ProgressBarEditor card={card} variant={cardContent} />
        )}
      </Flex>
    </>
  );
}
